import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TouchableOpacity, Platform, Modal, Pressable, Animated } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import './i18n';
import { saveLanguage } from './i18n';
import Login from './app/Login';
import Register from './app/Register';
import ForgotPassword from './app/ForgotPassword';
import ChallengesScreen from './screens/ChallengesScreen';
import TopScoreScreen from './screens/TopScoreScreen';
import MapScreen from './screens/MapScreen';
import ProfileEditScreen from './screens/ProfileEditScreen';
import PrizesScreen from './screens/PrizesScreen';
import MyPrizesScreen from './screens/MyPrizesScreen';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://226ef1ba51fb30cfcda2240647b405ad@o4510981976293376.ingest.de.sentry.io/4510981983240272',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const Pulse = ({ children, style }) => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>;
};

export default Sentry.wrap(function App() {
  const { t, i18n } = useTranslation();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  // Load user session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user_session');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setLoggedUser(user);
          // Set language from user profile if available
          if (user.language && user.language !== i18n.language) {
            await i18n.changeLanguage(user.language);
            await saveLanguage(user.language);
          }
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    };
    loadSession();
  }, []);

  const handleLoginSuccess = async (data) => {
    setLoggedUser(data);
    setShowLogin(false);
    try {
      await AsyncStorage.setItem('user_session', JSON.stringify(data));
      // Set language from user profile if available
      if (data.language && data.language !== i18n.language) {
        await i18n.changeLanguage(data.language);
        await saveLanguage(data.language);
      }
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  };

  const handleLogout = async () => {
    setLoggedUser(null);
    setCurrentScreen('home');
    setActiveChallenge(null);
    try {
      await AsyncStorage.removeItem('user_session');
    } catch (e) {
      console.error('Failed to remove session:', e);
    }
  };



  const renderScreen = () => {
    if (showForgotPassword) {
      return <ForgotPassword onBack={() => { setShowForgotPassword(false); setShowLogin(true); }} />;
    }
    if (showRegister) {
      return <Register onRegisterSuccess={handleLoginSuccess} onBack={() => { setShowRegister(false); setShowLogin(true); }} />;
    }
    if (showLogin) {
      return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setShowLogin(false)} onGoToRegister={() => { setShowLogin(false); setShowRegister(true); }} onGoToForgotPassword={() => { setShowLogin(false); setShowForgotPassword(true); }} />;
    }
    if (activeChallenge) {
      return <MapScreen challenge={activeChallenge} user={loggedUser} onBack={() => setActiveChallenge(null)} />;
    }
    if (currentScreen === 'challenges') return <ChallengesScreen user={loggedUser} onOpenMap={setActiveChallenge} />;
    if (currentScreen === 'topscore') return <TopScoreScreen user={loggedUser} onBack={() => setCurrentScreen('challenges')} />;
    if (currentScreen === 'profile') return <ProfileEditScreen user={loggedUser} onBack={() => setCurrentScreen('challenges')} />;
    if (currentScreen === 'prizes') return <PrizesScreen user={loggedUser} />;
    if (currentScreen === 'myprizes') return <MyPrizesScreen user={loggedUser} />;
    return (
      <View style={styles.home}>
        <Text style={styles.welcome}>{loggedUser ? t('app.welcomeUser', { name: loggedUser.name || loggedUser.email }) : t('app.welcome')}!</Text>
        <Text style={styles.readyText}>{t('app.readyText')}</Text>
        <Text style={styles.homeDescription}>
          {t('app.description')}
        </Text>
        {!loggedUser ? (
          <View style={styles.authButtons}>
            <TouchableOpacity style={styles.getStartedBtn} onPress={() => setShowLogin(true)}>
              <Text style={styles.getStartedBtnText}>{t('auth.signIn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerBtn} onPress={() => setShowRegister(true)}>
              <Text style={styles.registerBtnText}>{t('auth.createAccount')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.getStartedBtn} onPress={() => setCurrentScreen('challenges')}>
            <Text style={styles.getStartedBtnText}>{t('challenges.viewChallenges')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const navItems = [
    { key: 'challenges', icon: '🏆', label: t('challenges.title') },
    { key: 'topscore', icon: '⭐', label: t('score.title') },
    { key: 'prizes', icon: '🎁', label: t('prizes.title') },
    { key: 'myprizes', icon: '🏅', label: t('myPrizes.title') },
  ];

  const goTo = (key) => {
    setCurrentScreen(key);
    setActiveChallenge(null);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>{t('app.title')}</Text>
        {loggedUser ? (
          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={styles.userButton}
              onPress={() => setUserMenuOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.userText} numberOfLines={1}>
                👤 {loggedUser.name || loggedUser.email || t('profile.user')}
              </Text>
              <Text style={styles.userChevron}>▾</Text>
            </TouchableOpacity>
            <Pulse>
              <TouchableOpacity
                style={styles.hamburger}
                onPress={() => setNavMenuOpen(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.hamburgerIcon}>☰</Text>
              </TouchableOpacity>
            </Pulse>
          </View>
        ) : (
          <View style={styles.topBarRight}>
            <Button title={t('auth.login')} onPress={() => setShowLogin(true)} />
            <Button title={t('auth.register')} onPress={() => setShowRegister(true)} />
          </View>
        )}
      </View>

      {/* User dropdown menu */}
      <Modal
        visible={userMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setUserMenuOpen(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setUserMenuOpen(false)}>
          <View style={[styles.dropdown, { top: Platform.OS === 'android' ? 72 : 52 }]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setUserMenuOpen(false);
                setCurrentScreen('profile');
                setActiveChallenge(null);
              }}
            >
              <Text style={styles.dropdownItemText}>✏️  {t('profile.title')}</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setUserMenuOpen(false);
                handleLogout();
              }}
            >
              <Text style={[styles.dropdownItemText, styles.dropdownLogout]}>🚪  {t('auth.logout')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Hamburger nav dropdown — available on every screen */}
      <Modal
        visible={navMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setNavMenuOpen(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setNavMenuOpen(false)}>
          <View style={[styles.navDropdown, { top: Platform.OS === 'android' ? 72 : 52 }]}>
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.dropdownItem}
                onPress={() => {
                  setNavMenuOpen(false);
                  goTo(item.key);
                }}
              >
                <Text style={[styles.dropdownItemText, currentScreen === item.key && styles.dropdownItemActive]}>
                  {item.icon}  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    marginTop: Platform.OS === 'android' ? 24 : 0, // Roughly standard height for Android status bar if StatusBar.currentHeight isn't firing
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  hamburger: {
    paddingHorizontal: 2,
  },
  hamburgerIcon: {
    fontSize: 24,
    color: '#333',
    fontWeight: '700',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    color: '#000',
  },

  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    maxWidth: 200,
  },
  userText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  userChevron: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dropdown: {
    position: 'absolute',
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 190,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  dropdownLogout: {
    color: '#e53935',
  },
  dropdownItemActive: {
    color: '#4A90E2',
    fontWeight: '700',
  },
  navDropdown: {
    position: 'absolute',
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 8,
  },
  menu: {
    flexDirection: 'row',
    backgroundColor: '#f0f4ff',
    borderBottomWidth: 1,
    borderBottomColor: '#d0d9f0',
  },
  menuItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  menuItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#4A90E2',
    backgroundColor: '#e8efff',
  },
  menuText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  menuTextActive: {
    color: '#4A90E2',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  home: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  readyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
  },
  homeDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
  getStartedBtn: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: 20,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authButtons: {
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  registerBtn: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  registerBtnText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
});

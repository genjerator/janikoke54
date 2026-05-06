import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TouchableOpacity, Platform } from 'react-native';
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

export default Sentry.wrap(function App() {
  const { t, i18n } = useTranslation();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [activeChallenge, setActiveChallenge] = useState(null);

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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>{t('app.title')}</Text>
        {loggedUser ? (
          <View style={styles.topBarRight}>
            <TouchableOpacity onPress={() => {
              setCurrentScreen('profile');
              setActiveChallenge(null);
            }}>
              <Text style={[styles.userText, currentScreen === 'profile' && { textDecorationLine: 'underline' }]}>
                👤 {loggedUser.name || loggedUser.email || t('profile.user')}
              </Text>
            </TouchableOpacity>
            <Button title={t('auth.logout')} onPress={handleLogout} />
          </View>
        ) : (
          <View style={styles.topBarRight}>
            <Button title={t('auth.login')} onPress={() => setShowLogin(true)} />
            <Button title={t('auth.register')} onPress={() => setShowRegister(true)} />
          </View>
        )}
      </View>

      {/* Menu — only when logged in */}
      {loggedUser && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={[styles.menuItem, currentScreen === 'challenges' && styles.menuItemActive]}
            onPress={() => {
              setCurrentScreen('challenges');
              setActiveChallenge(null);
            }}
          >
            <Text style={[styles.menuText, currentScreen === 'challenges' && styles.menuTextActive]}>
              🏆 {t('challenges.title')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, currentScreen === 'topscore' && styles.menuItemActive]}
            onPress={() => {
              setCurrentScreen('topscore');
              setActiveChallenge(null);
            }}
          >
            <Text style={[styles.menuText, currentScreen === 'topscore' && styles.menuTextActive]}>
              ⭐ {t('score.title')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, currentScreen === 'prizes' && styles.menuItemActive]}
            onPress={() => {
              setCurrentScreen('prizes');
              setActiveChallenge(null);
            }}
          >
            <Text style={[styles.menuText, currentScreen === 'prizes' && styles.menuTextActive]}>
              🎁 {t('prizes.title')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, currentScreen === 'myprizes' && styles.menuItemActive]}
            onPress={() => {
              setCurrentScreen('myprizes');
              setActiveChallenge(null);
            }}
          >
            <Text style={[styles.menuText, currentScreen === 'myprizes' && styles.menuTextActive]}>
              🏅 {t('myPrizes.title')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#000',
  },
  topBarTitle: {
    color: '#fff',
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

  userText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    color: '#000',
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

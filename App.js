import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, SafeAreaView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './app/Login';
import ChallengesScreen from './screens/ChallengesScreen';
import TopScoreScreen from './screens/TopScoreScreen';
import MapScreen from './screens/MapScreen';
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
  const [showLogin, setShowLogin] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [activeChallenge, setActiveChallenge] = useState(null);

  // Load user session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user_session');
        if (savedUser) {
          setLoggedUser(JSON.parse(savedUser));
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
    if (showLogin) {
      return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setShowLogin(false)} />;
    }
    if (activeChallenge) {
      return <MapScreen challenge={activeChallenge} user={loggedUser} onBack={() => setActiveChallenge(null)} />;
    }
    if (currentScreen === 'challenges') return <ChallengesScreen user={loggedUser} onOpenMap={setActiveChallenge} />;
    if (currentScreen === 'topscore') return <TopScoreScreen user={loggedUser} />;
    return (
      <View style={styles.home}>
        <Text style={styles.welcome}>Welcome{loggedUser ? `, ${loggedUser.name || loggedUser.email}` : ''}!</Text>
        <Text style={styles.readyText}>Are you ready for a challenge?</Text>
        <Text style={styles.homeDescription}>
          Explore your surroundings, complete geographical challenges, and collect points to climb the scoreboard.
        </Text>
        {!loggedUser ? (
          <TouchableOpacity style={styles.getStartedBtn} onPress={() => setShowLogin(true)}>
            <Text style={styles.getStartedBtnText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.getStartedBtn} onPress={() => setCurrentScreen('challenges')}>
            <Text style={styles.getStartedBtnText}>View Challenges</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Jani Koke</Text>
        {loggedUser ? (
          <View style={styles.topBarRight}>
            <Text style={styles.userText}>👤 {loggedUser.name || loggedUser.email || 'User'}</Text>
            <Button title="Logout" onPress={handleLogout} color="#fff" />
          </View>
        ) : (
          <Button title="Login" onPress={() => setShowLogin(true)} color="#fff" />
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
              🏆 Challenges
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
              ⭐ Score
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
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
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
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
});

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, SafeAreaView, TouchableOpacity } from 'react-native';
import Login from './app/Login';
import ChallengesScreen from './screens/ChallengesScreen';
import TopScoreScreen from './screens/TopScoreScreen';
import MapScreen from './screens/MapScreen';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [activeChallenge, setActiveChallenge] = useState(null);

  const handleLoginSuccess = (data) => {
    setLoggedUser(data);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setLoggedUser(null);
    setCurrentScreen('home');
    setActiveChallenge(null);
  };



  const renderScreen = () => {
    if (showLogin) {
      return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setShowLogin(false)} />;
    }
    if (activeChallenge) {
      return <MapScreen challenge={activeChallenge} onBack={() => setActiveChallenge(null)} />;
    }
    if (currentScreen === 'challenges') return <ChallengesScreen user={loggedUser} onOpenMap={setActiveChallenge} />;
    if (currentScreen === 'topscore') return <TopScoreScreen user={loggedUser} />;
    return (
      <View style={styles.home}>
        <Text style={styles.welcome}>Welcome{loggedUser ? `, ${loggedUser.name || loggedUser.email}` : ''}!</Text>
        <Text style={styles.subtitle}>Open up App.js to start working on your app!</Text>
        <Button title="Press m11Me!" onPress={() => alert('Button Pressed!')} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>MyApp</Text>
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
            onPress={() => setCurrentScreen('challenges')}
          >
            <Text style={[styles.menuText, currentScreen === 'challenges' && styles.menuTextActive]}>
              🏆 Challenges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, currentScreen === 'topscore' && styles.menuItemActive]}
            onPress={() => setCurrentScreen('topscore')}
          >
            <Text style={[styles.menuText, currentScreen === 'topscore' && styles.menuTextActive]}>
              ⭐ Top Score
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
}

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
    gap: 12,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
});

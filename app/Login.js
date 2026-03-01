import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';

const Login = ({ onBack, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await fetch('https://janikoke.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Invalid credentials');
                return;
            }

            onLoginSuccess && onLoginSuccess(data);
        } catch (e) {
            console.log(e);
            setError('Network error: could not reach the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={setEmail}
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                onChangeText={setPassword}
                value={password}
                secureTextEntry
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {loading
                ? <ActivityIndicator />
                : <Button title="Login" onPress={handleLogin} />
            }
            {onBack && (
                <View style={styles.backButton}>
                    <Button title="Back" onPress={onBack} color="gray" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '80%',
        marginBottom: 10,
        borderWidth: 1,
        padding: 10,
        borderRadius: 4,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    backButton: {
        marginTop: 10,
    },
});

export default Login;

import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet,
    ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Login = ({ onBack, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) { setError('Please fill in all fields'); return; }
        setError('');
        setLoading(true);
        try {
            const response = await fetch('https://janikoke.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) { setError(data.message || 'Invalid credentials'); return; }
            onLoginSuccess && onLoginSuccess(data);
        } catch (e) {
            setError('Network error: could not reach the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.container}>

                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <MaterialIcons name="terrain" size={32} color="#fff" />
                    </View>
                    <Text style={styles.appName}>Janikoke</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.inputWrapper}>
                        <MaterialIcons name="email" size={18} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email address"
                            placeholderTextColor="#aaa"
                            onChangeText={setEmail}
                            value={email}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <MaterialIcons name="lock-outline" size={18} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#aaa"
                            onChangeText={setPassword}
                            value={password}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={18} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {error ? (
                        <View style={styles.errorBox}>
                            <MaterialIcons name="error-outline" size={14} color="#c0392b" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={styles.loginButtonText}>Sign in</Text>
                        }
                    </TouchableOpacity>
                </View>

                {onBack && (
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <MaterialIcons name="arrow-back" size={16} color="#888" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                )}

            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#2e7d32',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    appName: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e8e8e8',
        borderRadius: 10,
        marginBottom: 12,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    eyeIcon: {
        padding: 4,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: '#1a1a1a',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#fdf0ef',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    errorText: {
        color: '#c0392b',
        fontSize: 13,
        flex: 1,
    },
    loginButton: {
        backgroundColor: '#2e7d32',
        borderRadius: 10,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        gap: 6,
    },
    backText: {
        color: '#888',
        fontSize: 14,
    },
});

export default Login;
import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet,
    ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AUTH_URL } from '../Constants';

const Register = ({ onBack, onRegisterSuccess }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registered, setRegistered] = useState(false);

    const handleRegister = async () => {
        setFieldErrors({});
        if (!name || !email || !password || !passwordConfirmation) {
            setError(t('errors.fillAllFields'));
            return;
        }
        if (password !== passwordConfirmation) {
            setError(t('errors.passwordsDoNotMatch'));
            return;
        }
        if (password.length < 8) {
            setError(t('errors.passwordMinLength'));
            return;
        }
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                if (data.errors) {
                    setFieldErrors(data.errors);
                    const firstError = Object.values(data.errors)[0];
                    setError(Array.isArray(firstError) ? firstError[0] : firstError);
                } else {
                    setError(data.message || t('errors.registrationFailed'));
                }
                return;
            }
            // Registration successful — show verification notice
            setRegistered(true);
        } catch (e) {
            setError(t('errors.networkError'));
        } finally {
            setLoading(false);
        }
    };

    if (registered) {
        return (
            <View style={styles.wrapper}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={[styles.logoCircle, { backgroundColor: '#27ae60' }]}>
                            <MaterialIcons name="mark-email-read" size={32} color="#fff" />
                        </View>
                        <Text style={styles.appName}>{t('auth.checkEmail')}</Text>
                        <Text style={[styles.subtitle, { marginTop: 12, textAlign: 'center', lineHeight: 20 }]}>
                            {t('auth.verificationSent', { email })}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.registerButton} onPress={onBack}>
                        <Text style={styles.registerButtonText}>{t('auth.goToLogin')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>

                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <MaterialIcons name="person-add" size={32} color="#fff" />
                        </View>
                        <Text style={styles.appName}>Janikoke</Text>
                        <Text style={styles.subtitle}>{t('auth.createAccount')}</Text>
                    </View>

                    <View style={styles.card}>
                        {/* Name */}
                        <View style={[styles.inputWrapper, fieldErrors.name && styles.inputError]}>
                            <MaterialIcons name="person-outline" size={18} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('auth.fullName')}
                                placeholderTextColor="#aaa"
                                onChangeText={setName}
                                value={name}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Email */}
                        <View style={[styles.inputWrapper, fieldErrors.email && styles.inputError]}>
                            <MaterialIcons name="email" size={18} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('auth.emailAddress')}
                                placeholderTextColor="#aaa"
                                onChangeText={setEmail}
                                value={email}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Password */}
                        <View style={[styles.inputWrapper, fieldErrors.password && styles.inputError]}>
                            <MaterialIcons name="lock-outline" size={18} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('auth.password')}
                                placeholderTextColor="#aaa"
                                onChangeText={setPassword}
                                value={password}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={18} color="#999" />
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password */}
                        <View style={[styles.inputWrapper, fieldErrors.password && styles.inputError]}>
                            <MaterialIcons name="lock" size={18} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('auth.confirmPassword')}
                                placeholderTextColor="#aaa"
                                onChangeText={setPasswordConfirmation}
                                value={passwordConfirmation}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                <MaterialIcons name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={18} color="#999" />
                            </TouchableOpacity>
                        </View>

                        {error ? (
                            <View style={styles.errorBox}>
                                <MaterialIcons name="error-outline" size={14} color="#c0392b" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.registerButton, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text style={styles.registerButtonText}>{t('auth.createAccount')}</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    {onBack && (
                        <TouchableOpacity style={styles.backButton} onPress={onBack}>
                            <MaterialIcons name="arrow-back" size={16} color="#888" />
                            <Text style={styles.backText}>{t('auth.backToLogin')}</Text>
                        </TouchableOpacity>
                    )}

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
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
    inputError: {
        borderColor: '#e74c3c',
        backgroundColor: '#fdf5f4',
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
    registerButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 10,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
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

export default Register;

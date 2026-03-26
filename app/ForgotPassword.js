import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet,
    ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AUTH_URL, BASE_URL } from '../Constants';

const ForgotPassword = ({ onBack }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) { setError(t('errors.enterEmail')); return; }
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/forgot-password/send-new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || t('errors.failedToSendReset'));
                return;
            }
            setSuccess(true);
        } catch (e) {
            setError(t('errors.networkError'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <View style={styles.wrapper}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={[styles.logoCircle, { backgroundColor: '#27ae60' }]}>
                            <MaterialIcons name="mark-email-read" size={32} color="#fff" />
                        </View>
                        <Text style={styles.appName}>{t('auth.checkEmail')}</Text>
                        <Text style={[styles.subtitle, { marginTop: 12, textAlign: 'center', lineHeight: 20 }]}>
                            {t('auth.resetLinkSent', { email })}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.registerButton} onPress={onBack}>
                        <Text style={styles.registerButtonText}>{t('auth.backToLogin')}</Text>
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
            <View style={styles.container}>

                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <MaterialIcons name="lock-reset" size={32} color="#fff" />
                    </View>
                    <Text style={styles.appName}>{t('auth.resetPassword')}</Text>
                    <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 8 }]}>
                        {t('auth.resetPasswordDescription')}
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.inputWrapper}>
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

                    {error ? (
                        <View style={styles.errorBox}>
                            <MaterialIcons name="error-outline" size={14} color="#c0392b" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.registerButton, loading && styles.buttonDisabled]}
                        onPress={handleReset}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={styles.registerButtonText}>{t('auth.sendResetLink')}</Text>
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
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
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
        marginBottom: 16,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
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

export default ForgotPassword;

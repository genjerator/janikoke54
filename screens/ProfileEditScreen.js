import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, Image,
    ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { saveLanguage } from '../i18n';
import { BASE_URL, API_URL } from '../Constants';

const FLAG_URLS = {
    en: 'https://flagcdn.com/w40/gb.png',
    sr: 'https://flagcdn.com/w40/rs.png',
    rsn: 'https://flagcdn.com/w40/rs.png'
};

const ProfileEditScreen = ({ user, onBack }) => {
    const { t, i18n } = useTranslation();
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [language, setLanguage] = useState(user?.language || i18n.language || 'en');
    
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showLanguagePicker, setShowLanguagePicker] = useState(false);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            // Using local time formatting to prevent TZ offset issues
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            setDateOfBirth(`${year}-${month}-${day}`);
        }
    };

    const handleSave = async () => {
        setFieldErrors({});
        setError('');

        if (password && password !== passwordConfirmation) {
            setError(t('errors.passwordsDoNotMatch'));
            return;
        }

        setLoading(true);
        try {
            const url = `${API_URL}/profile`;
            
            const payload = {};
            if (password) {
                payload.password = password;
                payload.password_confirmation = passwordConfirmation;
            }
            if (dateOfBirth) {
                payload.date_of_birth = dateOfBirth;
            }
            if (language) {
                payload.language = language;
            }

            const response = await fetch(url, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${user ? user.token : ''}`
                },
                body: JSON.stringify(payload),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (data.errors) {
                    setFieldErrors(data.errors);
                    const firstError = Object.values(data.errors)[0];
                    setError(Array.isArray(firstError) ? firstError[0] : firstError);
                } else {
                    setError(data.message || t('errors.profileUpdateFailed'));
                }
                return;
            }

            // Update language in i18n and save to storage
            if (language && language !== i18n.language) {
                await i18n.changeLanguage(language);
                await saveLanguage(language);
            }

            // Update user session with new language preference
            try {
                const savedUser = await AsyncStorage.getItem('user_session');
                if (savedUser) {
                    const userSession = JSON.parse(savedUser);
                    userSession.language = language;
                    await AsyncStorage.setItem('user_session', JSON.stringify(userSession));
                }
            } catch (e) {
                console.error('Failed to update user session:', e);
            }

            if (onBack) onBack();

        } catch (e) {
            setError(t('errors.networkError'));
        } finally {
            setLoading(false);
        }
    };

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
                            <MaterialIcons name="person" size={32} color="#fff" />
                        </View>
                        <Text style={styles.appName}>{t('profile.title')}</Text>
                        <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>
                    </View>

                    <View style={styles.card}>

                        {/* Password */}
                        <Text style={styles.label}>{t('profile.newPassword')}</Text>
                        <View style={[styles.inputWrapper, fieldErrors.password && styles.inputError]}>
                            <MaterialIcons name="lock-outline" size={18} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('profile.leaveEmptyKeepCurrent')}
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
                        <Text style={styles.label}>{t('profile.confirmNewPassword')}</Text>
                        <View style={[styles.inputWrapper, fieldErrors.password && styles.inputError]}>
                            <MaterialIcons name="lock" size={18} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('profile.confirmNewPassword')}
                                placeholderTextColor="#aaa"
                                onChangeText={setPasswordConfirmation}
                                value={passwordConfirmation}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                <MaterialIcons name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={18} color="#999" />
                            </TouchableOpacity>
                        </View>

                        {/* Date of Birth */}
                        <Text style={styles.label}>{t('profile.dateOfBirth')}</Text>
                        <TouchableOpacity
                            style={[styles.inputWrapper, fieldErrors.date_of_birth && styles.inputError]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <MaterialIcons name="calendar-today" size={18} color="#999" style={styles.inputIcon} />
                            <Text style={[styles.input, { lineHeight: 48, color: dateOfBirth ? '#1a1a1a' : '#aaa' }]}>
                                {dateOfBirth || t('profile.selectBirthDate')}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={dateOfBirth ? new Date(dateOfBirth) : new Date(1990, 0, 1)}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                            />
                        )}

                        {/* Language */}
                        <Text style={styles.label}>{t('profile.language')}</Text>
                        <TouchableOpacity
                            style={[styles.inputWrapper, fieldErrors.language && styles.inputError]}
                            onPress={() => setShowLanguagePicker(!showLanguagePicker)}
                        >
                            <MaterialIcons name="language" size={18} color="#999" style={styles.inputIcon} />
                            <Image
                                source={{ uri: FLAG_URLS[language] }}
                                style={styles.flagIcon}
                                resizeMode="cover"
                            />
                            <Text style={[styles.input, { lineHeight: 48, color: '#1a1a1a' }]}>
                                {t(`languages.${language}`)}
                            </Text>
                            <MaterialIcons name={showLanguagePicker ? "expand-less" : "expand-more"} size={20} color="#999" />
                        </TouchableOpacity>

                        {/* Language Options */}
                        {showLanguagePicker && (
                            <View style={styles.languageOptions}>
                                {['en', 'sr', 'rsn'].map((lang) => (
                                    <TouchableOpacity
                                        key={lang}
                                        style={[styles.languageOption, language === lang && styles.selectedLanguage]}
                                        onPress={() => {
                                            setLanguage(lang);
                                            setShowLanguagePicker(false);
                                        }}
                                    >
                                        <Image
                                            source={{ uri: FLAG_URLS[lang] }}
                                            style={styles.flagIconLarge}
                                            resizeMode="cover"
                                        />
                                        <Text style={[styles.languageOptionText, language === lang && styles.selectedLanguageText]}>
                                            {t(`languages.${lang}`)}
                                        </Text>
                                        {language === lang && <Text style={styles.checkmark}>✓</Text>}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {error ? (
                            <View style={styles.errorBox}>
                                <MaterialIcons name="error-outline" size={14} color="#c0392b" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.buttonDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
                            }
                        </TouchableOpacity>
                    </View>

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
        paddingBottom: 40,
    },
    container: {
        flex: 1,
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
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
        marginLeft: 4,
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
        marginBottom: 16,
    },
    errorText: {
        color: '#c0392b',
        fontSize: 13,
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 10,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    flagIcon: {
        width: 28,
        height: 18,
        marginRight: 8,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    flagIconLarge: {
        width: 32,
        height: 20,
        marginRight: 12,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    languageOptions: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e8e8e8',
        overflow: 'hidden',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedLanguage: {
        backgroundColor: '#e8efff',
    },
    languageOptionText: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    selectedLanguageText: {
        fontWeight: '600',
        color: '#4A90E2',
    },
    checkmark: {
        fontSize: 18,
        color: '#4A90E2',
        fontWeight: 'bold',
    },
});

export default ProfileEditScreen;

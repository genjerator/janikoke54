import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

// Celebration overlay shown right after the user collects an area. Renders
// nothing when there's no freshly-collected area.
const CongratsPopup = ({ area, onClose }) => {
    const { t } = useTranslation();
    if (!area) return null;

    return (
        <View style={styles.popupOverlay}>
            <View style={styles.popupBox}>
                <Text style={styles.popupEmoji}>🎉</Text>
                <Text style={styles.popupTitle}>{t('score.congratulations')}</Text>
                <Text style={styles.popupText}>{t('score.collectedPoint')}</Text>
                <Text style={styles.popupSubtext}>({area.name})</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>{t('score.close')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    popupOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    popupBox: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    popupEmoji: {
        fontSize: 50,
        marginBottom: 10,
    },
    popupTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: 8,
        textAlign: 'center',
    },
    popupText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    popupSubtext: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#4A90E2',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CongratsPopup;

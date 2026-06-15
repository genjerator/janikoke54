import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

// Shown when the user steps into an area: a random article for that area.
// Renders nothing when there's no article. Content scrolls if it's long.
const ArticlePopup = ({ article, areaName, onClose }) => {
    const { t } = useTranslation();
    if (!article) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.box}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {article.image ? (
                        <Image source={{ uri: article.image }} style={styles.image} resizeMode="cover" />
                    ) : null}
                    {areaName ? <Text style={styles.areaTag}>{areaName}</Text> : null}
                    <Text style={styles.title}>{article.title}</Text>
                    <Text style={styles.content}>{article.content}</Text>
                </ScrollView>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>{t('score.close')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        padding: 20,
    },
    box: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 420,
        maxHeight: '80%',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    scrollContent: {
        padding: 20,
    },
    image: {
        width: '100%',
        height: 160,
        borderRadius: 12,
        marginBottom: 14,
        backgroundColor: '#eee',
    },
    areaTag: {
        fontSize: 12,
        color: '#4A90E2',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 10,
    },
    content: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
    },
    closeButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 14,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ArticlePopup;

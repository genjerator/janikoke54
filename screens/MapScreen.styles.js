import { StyleSheet } from 'react-native';

// Screen-level layout styles. Component-specific styles live alongside each
// component in components/map/.
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A90E2',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    breadcrumbText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
        fontWeight: '600',
    },
    breadcrumbSeparator: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 15,
        marginHorizontal: 4,
    },
    title: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});

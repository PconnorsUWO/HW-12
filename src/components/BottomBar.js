import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationState } from '@react-navigation/native';
import { Home, History, BookOpen } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BottomBar({ navigation }) {
    const insets = useSafeAreaInsets();

    // Get current route name from navigation state
    const currentRoute = useNavigationState(state => {
        if (!state) return 'Home';
        const route = state.routes[state.index];
        return route?.name || 'Home';
    });

    const handleHomePress = () => {
        if (currentRoute !== 'Home') {
            navigation.navigate('Home');
        }
    };

    const handleLastScanPress = async () => {
        try {
            const lastScanData = await AsyncStorage.getItem('lastScan');

            if (lastScanData) {
                const parsed = JSON.parse(lastScanData);
                // Navigate to Results with the saved data
                navigation.navigate('Results', {
                    imageUri: parsed.imageUri,
                    data: parsed.data
                });
            } else {
                // If no last scan, show alert and stay on current screen
                Alert.alert(
                    'No Last Scan',
                    'You haven\'t scanned any products yet. Use the camera to scan a product first.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error retrieving last scan:', error);
            Alert.alert('Error', 'Failed to load last scan. Please try again.');
        }
    };

    const handleIngredientsDirectoryPress = () => {
        if (currentRoute !== 'IngredientsDirectory') {
            navigation.navigate('IngredientsDirectory');
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, SPACING.s) }]}>
                {/* Home Button - Left */}
                <TouchableOpacity
                    style={[styles.button, currentRoute === 'Home' && styles.buttonActive]}
                    onPress={handleHomePress}
                    activeOpacity={0.7}
                >
                    <Home
                        size={24}
                        color={currentRoute === 'Home' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[
                        styles.buttonLabel,
                        currentRoute === 'Home' && styles.buttonLabelActive
                    ]}>
                        Home
                    </Text>
                </TouchableOpacity>

                {/* Last Scan Button - Middle */}
                <TouchableOpacity
                    style={[styles.button, currentRoute === 'Results' && styles.buttonActive]}
                    onPress={handleLastScanPress}
                    activeOpacity={0.7}
                >
                    <History
                        size={24}
                        color={currentRoute === 'Results' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[
                        styles.buttonLabel,
                        currentRoute === 'Results' && styles.buttonLabelActive
                    ]}>
                        Last Scan
                    </Text>
                </TouchableOpacity>

                {/* Ingredients Directory Button - Right */}
                <TouchableOpacity
                    style={[styles.button, currentRoute === 'IngredientsDirectory' && styles.buttonActive]}
                    onPress={handleIngredientsDirectoryPress}
                    activeOpacity={0.7}
                >
                    <BookOpen
                        size={24}
                        color={currentRoute === 'IngredientsDirectory' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[
                        styles.buttonLabel,
                        currentRoute === 'IngredientsDirectory' && styles.buttonLabelActive
                    ]}>
                        Directory
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        zIndex: 100,
    },
    bar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.s,
        paddingHorizontal: SPACING.m,
        minHeight: 70,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.s,
        borderRadius: 12,
    },
    buttonActive: {
        backgroundColor: COLORS.cardBackground,
    },
    buttonLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 4,
        fontWeight: '500',
    },
    buttonLabelActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});


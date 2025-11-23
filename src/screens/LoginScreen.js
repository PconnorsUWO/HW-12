import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING } from '../constants/theme';
import { AuthService } from '../services/auth';

export default function LoginScreen({ navigation, route }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { onLogin } = route.params || {};

    const handleLogin = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const result = await AuthService.login(username, password);
            if (result.success) {
                if (onLogin) {
                    onLogin();
                }
            } else {
                Alert.alert('Login Failed', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
            console.error('Login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const canProceed = username.trim().length > 0 && password.length > 0;

    return (
        <LinearGradient
            colors={[COLORS.background, '#1a1a1a']}
            style={styles.container}
        >
            <StatusBar style="light" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Sign in to continue tracking ingredients.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your username"
                                placeholderTextColor={COLORS.textSecondary}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor={COLORS.textSecondary}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                autoCapitalize="none"
                            />
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                !canProceed && styles.buttonDisabled,
                                pressed && styles.buttonPressed
                            ]}
                            onPress={handleLogin}
                            disabled={!canProceed || isLoading}
                        >
                            <Text style={[styles.buttonText, !canProceed && styles.buttonTextDisabled]}>
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backButtonText}>Don't have an account? Sign Up</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        padding: SPACING.l,
        justifyContent: 'center',
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.s,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    form: {
        gap: SPACING.l,
    },
    inputContainer: {
        gap: SPACING.xs,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginLeft: 4,
    },
    input: {
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        padding: SPACING.m,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        fontSize: 16,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: SPACING.m,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    buttonDisabled: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 1,
        shadowOpacity: 0,
    },
    buttonText: {
        color: COLORS.black,
        fontWeight: '700',
        fontSize: 16,
    },
    buttonTextDisabled: {
        color: COLORS.textSecondary,
    },
    backButton: {
        padding: SPACING.s,
        alignItems: 'center',
    },
    backButtonText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
});

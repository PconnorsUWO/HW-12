import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING } from '../constants/theme';
import { AuthService } from '../services/auth';

const COMMON_ALLERGIES = [
  'Milk', 'Eggs', 'Peanuts', 'Tree nuts', 'Fish', 'Shellfish',
  'Wheat', 'Soy', 'Sesame', 'Gluten', 'Lactose', 'Corn',
  'Sulphites', 'MSG', 'Artificial colors', 'Preservatives'
];

export function OnboardingScreen({ onComplete, navigation }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleAllergy = (allergy) => {
    setSelectedAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const handleRegister = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const registerResult = await AuthService.register(username, password, selectedAllergies);

      if (registerResult.success) {
        const loginResult = await AuthService.login(username, password);
        if (loginResult.success) {
          onComplete();
        } else {
          Alert.alert('Login Error', loginResult.error);
        }
      } else {
        Alert.alert('Registration Error', registerResult.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Registration/Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // For now, just let them in. In a real app, might want a guest mode.
    onComplete();
  };

  const canProceed = username.trim().length >= 3 && password.length >= 6;

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
          {step === 1 ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                  Track ingredients and stay safe.
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Min 3 characters"
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
                    placeholder="Min 6 characters"
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
                  onPress={() => setStep(2)}
                  disabled={!canProceed}
                >
                  <Text style={[styles.buttonText, !canProceed && styles.buttonTextDisabled]}>
                    Continue
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.loginLink}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Your Allergies</Text>
                <Text style={styles.subtitle}>
                  Select ingredients to avoid.
                </Text>
              </View>

              <FlatList
                data={COMMON_ALLERGIES}
                numColumns={2}
                keyExtractor={(item) => item}
                style={styles.allergyList}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.allergyChip,
                      selectedAllergies.includes(item) && styles.allergyChipSelected,
                      pressed && styles.chipPressed
                    ]}
                    onPress={() => toggleAllergy(item)}
                  >
                    <Text style={[
                      styles.allergyText,
                      selectedAllergies.includes(item) && styles.allergyTextSelected
                    ]}>
                      {item}
                    </Text>
                  </Pressable>
                )}
              />

              <View style={styles.bottomButtons}>
                <Pressable
                  style={styles.skipButton}
                  onPress={handleSkip}
                  disabled={isLoading}
                >
                  <Text style={styles.skipButtonText}>Skip Setup</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    isLoading && styles.buttonDisabled,
                    pressed && styles.buttonPressed
                  ]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  <Text style={[styles.buttonText, isLoading && styles.buttonTextDisabled]}>
                    {isLoading ? 'Creating...' : 'Get Started'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
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
    marginTop: SPACING.xl,
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
  allergyList: {
    flex: 1,
    marginVertical: SPACING.l,
  },
  allergyChip: {
    width: '48%',
    marginBottom: SPACING.s,
    padding: SPACING.m,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipPressed: {
    opacity: 0.8,
  },
  allergyChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  allergyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  allergyTextSelected: {
    color: COLORS.black,
    fontWeight: '700',
  },
  bottomButtons: {
    gap: SPACING.m,
    marginBottom: SPACING.l,
  },
  skipButton: {
    padding: SPACING.m,
    alignItems: 'center',
  },
  skipButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    padding: SPACING.s,
    alignItems: 'center',
    marginTop: SPACING.s,
  },
  loginLinkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
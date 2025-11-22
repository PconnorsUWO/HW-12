import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
// Note: Changed to lucide-react-native for compatibility
import { Camera, Sparkles, Shield, Zap } from 'lucide-react-native';
// Import LinearGradient for React Native gradient support
import { LinearGradient } from 'expo-linear-gradient';

// --- Dimensions for responsive styling ---
const { width } = Dimensions.get('window');
const MAX_WIDTH = 400; // Corresponds to max-w-md
const PADDING = 24;    // Corresponds to px-6

// --- Custom Button Component (Replaces ./ui/button) ---
// Since we don't have the original Button component, we create a simple equivalent
const CustomButton = ({ children, onPress, style }) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.ctaButtonWrapper, style]}
      activeOpacity={0.7} // Mimics hover:opacity-90
    >
      {children}
    </TouchableOpacity>
  );
};

// --- Feature Item Component (Sub-Component) ---
function FeatureItem({ icon, title, description, color }) {
  const isCyan = color === 'cyan';
  const bgColor = isCyan ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 107, 53, 0.1)'; // 10% opacity
  const iconColor = isCyan ? '#06b6d4' : '#ff6b35';

  return (
    <View style={styles.featureItemContainer}>
      {/* Icon Wrapper */}
      <View style={[styles.featureIconWrapper, { backgroundColor: bgColor, color: iconColor }]}>
        {/* Pass the icon down, setting the color of the Lucide component */}
        {React.cloneElement(icon, { color: iconColor, size: 20 })}
      </View>
      {/* Text Content */}
      <View style={styles.featureTextContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

// --- Main Welcome Screen Component ---
export function WelcomeScreen({ onGetStarted }) {
  return (
    <View style={styles.screenContainer}>
      
      {/* Gradient Background Effects */}
      <View style={[styles.gradientCircle, styles.topRightCircle, { backgroundColor: '#06b6d4' }]} />
      <View style={[styles.gradientCircle, styles.bottomLeftCircle, { backgroundColor: '#ff6b35' }]} />

      {/* Content */}
      <View style={styles.contentContainer}>
        
        {/* Logo/Icon */}
        <View style={styles.logoWrapper}>
          <LinearGradient
            colors={['#ff6b35', '#06b6d4']}
            style={styles.mainLogoCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Camera icon with custom color and strokeWidth */}
            <Camera size={48} color="black" strokeWidth={2} />
          </LinearGradient>
          {/* Sparkles Badge */}
          <View style={styles.sparklesBadge}>
            <Sparkles size={16} color="black" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Welcome to {'\n'}
          {/* Cannot use bg-clip-text in RN, must use a separate component */}
          <Text>
            <LinearGradient
              colors={['#ff6b35', '#06b6d4']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.titleGradientText}>NutriScan</Text>
            </LinearGradient>
          </Text>
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Instantly analyze nutrition labels with AI-powered technology
        </Text>

        {/* Features */}
        <View style={styles.featuresList}>
          <FeatureItem
            icon={<Zap />}
            title="Instant Analysis"
            description="Get detailed nutrition info in seconds"
            color="cyan"
          />
          <FeatureItem
            icon={<Shield />}
            title="Accurate Data"
            description="Powered by Examine.com database"
            color="orange"
          />
          <FeatureItem
            icon={<Camera />}
            title="Easy Scanning"
            description="Simply snap a photo or upload an image"
            color="cyan"
          />
        </View>

        {/* CTA Button */}
        <CustomButton onPress={onGetStarted}>
          <LinearGradient
            colors={['#ff6b35', '#06b6d4']}
            style={styles.ctaButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaButtonText}>Get Started</Text>
          </LinearGradient>
        </CustomButton>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Scan smarter, eat healthier
        </Text>
      </View>
    </View>
  );
}

// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  // Main Screen Container (min-h-screen, bg-black, flex-col, relative)
  screenContainer: {
    flex: 1,
    backgroundColor: 'black',
    overflow: 'hidden',
  },
  // --- Gradient Effects ---
  gradientCircle: {
    position: 'absolute',
    width: 384, // w-96
    height: 384, // h-96
    borderRadius: 192,
    opacity: 0.2,
    // Note: React Native doesn't have a direct blur CSS equivalent.
    // The blur-[120px] is approximated by its opacity and size.
  },
  topRightCircle: {
    top: 0,
    right: 0,
    transform: [{ translateX: 100 }, { translateY: -100 }], // Move off screen slightly
  },
  bottomLeftCircle: {
    bottom: 0,
    left: 0,
    transform: [{ translateX: -100 }, { translateY: 100 }],
  },
  // --- Content ---
  contentContainer: {
    flex: 1, // flex-1
    alignItems: 'center', // items-center
    justifyContent: 'center', // justify-center
    paddingHorizontal: PADDING, // px-6
    paddingVertical: 48, // py-12
    zIndex: 10,
  },
  // --- Logo/Icon ---
  logoWrapper: {
    position: 'relative',
    marginBottom: 32, // mb-8
  },
  mainLogoCircle: {
    width: 96, // w-24
    height: 96, // h-24
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparklesBadge: {
    position: 'absolute',
    top: -8, // -top-2
    right: -8, // -right-2
    width: 32, // w-8
    height: 32, // h-8
    borderRadius: 16,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // --- Title ---
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16, // mb-4
  },
  // RN Gradient Text Approximation: Using a placeholder text and hoping the linear gradient is applied, but RN doesn't support text clipping easily.
  titleGradientText: {
    fontSize: 32,
    fontWeight: 'bold',
    // In a real app, you'd use a masked view or an SVG component for this effect
    color: '#ff6b35', // Fallback color
  },
  // --- Subtitle ---
  subtitle: {
    color: 'gray', // text-gray-400
    textAlign: 'center',
    maxWidth: MAX_WIDTH, // max-w-sm
    marginBottom: 48, // mb-12
    fontSize: 16,
  },
  // --- Features ---
  featuresList: {
    width: '100%',
    maxWidth: MAX_WIDTH, // max-w-md
    marginBottom: 48, // mb-12
    gap: 16, // space-y-4
  },
  // --- Feature Item ---
  featureItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16, // gap-4
    padding: 16, // p-4
    borderRadius: 12, // rounded-xl
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // bg-white/5
    // backdrop-blur-sm is not directly supported, using opacity
    borderWidth: 1, // border
    borderColor: 'rgba(255, 255, 255, 0.1)', // border-white/10
  },
  featureIconWrapper: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 8, // rounded-lg
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // flex-shrink-0
  },
  featureTextContent: {
    flex: 1,
  },
  featureTitle: {
    color: 'white',
    fontWeight: '600',
    marginBottom: 4, // mb-1
    fontSize: 16,
  },
  featureDescription: {
    color: 'gray', // text-gray-400
    fontSize: 14,
  },
  // --- CTA Button (CustomButton styles) ---
  ctaButtonWrapper: {
    width: '100%',
    maxWidth: MAX_WIDTH, // max-w-md
    height: 48, // h-12
    borderRadius: 8,
    overflow: 'hidden', // To contain the gradient
  },
  ctaButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: 'black', // text-black
    fontWeight: 'bold',
    fontSize: 16,
  },
  // --- Footer ---
  footer: {
    paddingHorizontal: PADDING, // px-6
    paddingVertical: 24, // py-6
    textAlign: 'center',
    zIndex: 10,
  },
  footerText: {
    color: '#6b7280', // text-gray-600
    textAlign: 'center',
    fontSize: 14,
  },
});
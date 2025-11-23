import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
// Assuming you have installed lucide-react-native for these icons
import { Apple, FileText, BookOpen } from 'lucide-react-native';

/**
 * Note: The component structure is kept as a functional component,
 * but the type annotations (Tab, BottomNavProps) are removed for pure JavaScript.
 * You will need to rely on prop validation or runtime checks if not using TypeScript.
 */

export function BottomNav({ activeTab, onTabChange }) {
  // Define the structure of your navigation tabs
  const tabs = [
    { id: 'scan-food', label: 'Scan food', icon: Apple, color: '#b8e6b8', activeColor: '#9dd99d' },
    { id: 'food-label', label: 'Food label', icon: FileText, color: '#ffc4d6', activeColor: '#ffb3cc' },
    { id: 'library', label: 'Library', icon: BookOpen, color: '#b8d4f0', activeColor: '#a3c9ed' },
  ];

  return (
    // Replaced <div> with <View>
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            // Replaced <button> with <Pressable> for interactive elements
            <Pressable
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              // Apply styles based on active state and tab color
              style={({ pressed }) => [
                styles.tabButton,
                { backgroundColor: isActive ? tab.activeColor : tab.color },
                // Optional: scale effect on active and press
                isActive && styles.tabActive,
                pressed && styles.tabPressed,
              ]}
            >
              {/* Lucide icons are now imported from lucide-react-native and take a 'color' prop */}
              <Icon size={24} color="#333333" />
              {/* Replaced <span> with <Text> */}
              <Text style={styles.tabLabel}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// StyleSheet is the standard way to define styles in React Native
const styles = StyleSheet.create({
  // This replaces the absolute positioning and padding of the outer <div>
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16, // px-4
    paddingBottom: 24,    // pb-6
    zIndex: 30,
  },
  // This replaces the flex container for the tabs
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12, // Replaces gap-3 (note: React Native gap support depends on version/Expo SDK)
  },
  // Base style for the individual tab pressable area
  tabButton: {
    flex: 1, // flex-1
    height: 80, // h-20
    borderRadius: 16, // rounded-2xl
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // Added transition-like properties
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
  },
  tabActive: {
    // scale-105 equivalent
    transform: [{ scale: 1.05 }],
  },
  tabPressed: {
    // Slight dimming or scaling when pressed
    opacity: 0.8,
  },
  tabLabel: {
    fontSize: 10, // text-xs
    color: '#333333', // text-gray-800
    marginTop: 4, // gap-2 (partial equivalent for space between icon and text)
  },
});
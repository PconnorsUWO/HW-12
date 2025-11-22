import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
// Added MessageCircle for Forums
import { Zap, ZapOff, Image as ImageIcon, Settings, User, BookOpen, Search, MessageCircle, Camera, Laugh, Smile } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

// --- Reusable Tab Button Component ---
// Color logic adjusted for the new cream/floating look
const TabButton = ({ icon: Icon, label, onPress, isActive }) => {
    // Inactive background is transparent/light gray, active is primary color
    const buttonBg = isActive ? COLORS.primary : 'rgba(255, 255, 255, 0.2)'; // Floating look
    const iconColor = isActive ? COLORS.black : '#F5F5DC'; // Cream color for inactive icons
    const labelColor = isActive ? COLORS.black : '#F5F5DC'; // Cream color for inactive labels

    return (
        <TouchableOpacity 
            onPress={onPress} 
            style={[styles.tabButton, { backgroundColor: buttonBg }]}
            activeOpacity={0.7}
        >
            <Icon size={24} color={iconColor} />
            <Text style={[styles.tabButtonLabel, { color: labelColor }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};


export default function HomeScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [flash, setFlash] = useState('off');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    // Default to the main action, which is taking a picture
    const [activeTab, setActiveTab] = useState('scan'); 
    const cameraRef = useRef(null);

    // Tab Data (Only 3 tabs now)
    const tabs = [
        { id: 'library', label: 'Little Guys', icon: Smile, isActive: activeTab === 'library' },
        { id: 'forums', label: 'Forums', icon: MessageCircle, isActive: activeTab === 'forums' },
        {id: 'ingredients', label: 'Ingredients', icon: BookOpen, isActive: activeTab === 'ingredients' },
    ];

    // Simulate "Lock-on" effect (Only runs when scanning)
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeTab === 'scan') {
                setIsFocused(prev => !prev);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [activeTab]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ color: '#fff' }}>No access to camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.text}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            // Set activeTab to 'scan' when the capture button is pressed
            setActiveTab('scan'); 
            setLoading(true);
            try {
                const photo = await cameraRef.current.takePictureAsync();
                setLoading(false);
                navigation.navigate('Results', { imageUri: photo.uri });
            } catch (error) {
                console.error(error);
                setLoading(false);
                Alert.alert('Error', 'Failed to take picture');
            }
        }
    };

    // Handler for the bottom tabs
    const handleTabPress = (tabId) => {
        // We set the active tab state
        setActiveTab(tabId);
        
        // --- Navigation Logic for Tabs ---
        if (tabId === 'library') {
            Alert.alert("Navigation", "Go to Scrapbook/Library Screen");
            // navigation.navigate('LibraryScreen'); 
        } else if (tabId === 'research') {
             Alert.alert("Navigation", "Go to Research Screen (Little Guys)");
            // navigation.navigate('ResearchScreen'); 
        } else if (tabId === 'forums') {
             Alert.alert("Navigation", "Go to Forums Screen");
            // navigation.navigate('ForumsScreen'); 
        }
    };

    // Dynamic Color based on focus state
    const focusColor = isFocused ? '#4ADE80' : 'rgba(255, 255, 255, 0.6)';

    return (
        <SafeAreaView style={styles.container}>
            {/* Camera View */}
            <CameraView
                style={styles.camera}
                facing="back"
                flash={flash}
                ref={cameraRef}
            >
                <View style={styles.overlay}>
                    
                    {/* Top Controls (Settings/User) */}
                    <View style={styles.topControls}>
                        <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
                            {flash === 'on' ? <Zap size={24} color="#FFF" /> : <ZapOff size={24} color="#FFF" />}
                        </TouchableOpacity>
                        <Text style={styles.scannerHeader}>Ingest</Text>
                        <TouchableOpacity style={styles.iconButton}>
                            <User size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Center Focus Area */}
                    <View style={styles.focusArea}>
                        <View style={styles.cornerRow}>
                            <View style={[styles.corner, styles.topLeft, { borderColor: focusColor }]} />
                            <View style={[styles.corner, styles.topRight, { borderColor: focusColor }]} />
                        </View>
                        <View style={styles.cornerRow}>
                            <View style={[styles.corner, styles.bottomLeft, { borderColor: focusColor }]} />
                            <View style={[styles.corner, styles.bottomRight, { borderColor: focusColor }]} />
                        </View>
                        {isFocused && activeTab === 'scan' && ( 
                            <Text style={[styles.focusLabel, { color: focusColor }]}>DETECTED</Text>
                        )}
                    </View>

                    {/* Bottom Tab Controls (3 Floating Tabs) */}
                    <View style={styles.bottomTabControls}>
                        {tabs.map(tab => (
                            <TabButton 
                                key={tab.id}
                                icon={tab.icon}
                                label={tab.label}
                                onPress={() => handleTabPress(tab.id)}
                                isActive={tab.isActive}
                            />
                        ))}
                    </View>
                </View>
            </CameraView>

            {/* Floating Capture Button (Absolute position outside CameraView to float over everything) */}
            <View style={styles.centerCaptureWrapper}>
                <TouchableOpacity onPress={takePicture} style={styles.centerCaptureButton}>
                    {/* Placeholder for the inner camera icon */}
                    <Camera size={28} color="#FFF" /> 
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

// --- Styles ---

// Note: Re-calculating the camera style to be approximately 4:3, which is more rectangular.
const CAMERA_HEIGHT = width * 0.75; // 4:3 Aspect ratio

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    // Enforced 4:3 Aspect Ratio for the Camera View
    camera: {
        width: width,           
        height: CAMERA_HEIGHT,   
        alignSelf: 'center',    
        overflow: 'hidden',     
        flex: 1, // Let it fill the rest of the height below the SafeAreaView if needed
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
    },
    scannerHeader: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingTop: SPACING.m,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    focusArea: {
        width: width * 0.7,
        height: width * 0.7,
        alignSelf: 'center',
        justifyContent: 'space-between',
    },
    cornerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    corner: {
        width: 40,
        height: 40,
        borderWidth: 4, 
        borderRadius: 4,
    },
    topLeft: { borderTopWidth: 4, borderLeftWidth: 4, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 16 },
    topRight: { borderTopWidth: 4, borderRightWidth: 4, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 16 },
    bottomLeft: { borderBottomWidth: 4, borderLeftWidth: 4, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 16 },
    bottomRight: { borderBottomWidth: 4, borderRightWidth: 4, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 16 },
    focusLabel: {
        position: 'absolute',
        bottom: -30,
        alignSelf: 'center',
        fontWeight: '700',
        letterSpacing: 2,
        fontSize: 12,
    },
    
    // --- Floating Bottom Tab Controls (3 Buttons) ---
    bottomTabControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        // Pushing the tabs down from the camera area
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xl, 
        paddingTop: SPACING.m,
        backgroundColor: 'transparent', // Fully transparent background
    },
    tabButton: {
        flex: 1,
        marginHorizontal: SPACING.s, // Margin between buttons
        height: 70, // Slightly taller button for a better tap target
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        // Apply shadow/elevation for a "floating" effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3, 
    },
    tabButtonLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
        color: '#F5F5DC', // Cream/Light Gray color
    },
    
    // --- Center Capture Button (Floating Above Tabs) ---
    centerCaptureWrapper: {
        position: 'absolute',
        bottom: 150, // Adjust this value to position it correctly above the tabs
        width: '100%',
        alignItems: 'center',
        zIndex: 20, // Ensure it's above the camera view
    },
    centerCaptureButton: {
        width: 70, // Large button size
        height: 70,
        borderRadius: 35,
        backgroundColor: '#daefb3', // Bright Orange color
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 5,
        borderColor: 'rgba(255, 255, 255, 0.5)', // White border for separation/pop
        shadowColor: '#b5ddbd',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 15,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
});
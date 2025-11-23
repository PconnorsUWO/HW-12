import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Zap, ZapOff, Image as ImageIcon, Settings, User, ScanLine } from 'lucide-react-native';
import { AuthService } from '../services/auth';
import { COLORS, SPACING } from '../constants/theme';
import { FLASH_MODES, ROUTES, CAMERA_FACING, ERROR_MESSAGES, UI_TEXT, ANIMATION_DURATION, IMAGE_PICKER } from '../constants/types';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [flash, setFlash] = useState(FLASH_MODES.OFF);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const cameraRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFocused(prev => !prev);
        }, ANIMATION_DURATION.FOCUS_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>{ERROR_MESSAGES.NO_CAMERA_ACCESS}</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.text}>{UI_TEXT.GRANT_PERMISSION}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleFlash = () => {
        setFlash(current => (current === FLASH_MODES.OFF ? FLASH_MODES.ON : FLASH_MODES.OFF));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            setLoading(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    skipProcessing: true,
                });
                setLoading(false);
                navigation.navigate(ROUTES.RESULTS, { imageUri: photo.uri });
            } catch (error) {
                console.error(error);
                setLoading(false);
                Alert.alert(UI_TEXT.ERROR, ERROR_MESSAGES.PICTURE_FAILED);
            }
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: IMAGE_PICKER.ASPECT_RATIO,
            quality: IMAGE_PICKER.QUALITY,
        });

        if (!result.canceled) {
            navigation.navigate(ROUTES.RESULTS, { imageUri: result.assets[0].uri });
        }
    };

    const focusColor = isFocused ? COLORS.primary : COLORS.white;

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            // Navigation reset will be handled by App.js state change if we lift state up, 
            // but for now we can just reload or use a callback. 
            // Actually, since App.js checks isLoggedIn on mount, we need to trigger a re-check or reload.
            // For this quick fix, let's just use the navigation prop if possible or Updates.reloadAsync()
            // But better: let's just clear storage and navigate to Onboarding if possible, 
            // or rely on the user restarting the app.
            // A better approach is to pass a logout handler from App.js, but let's stick to simple for now.
            Alert.alert("Logged Out", "Please restart the app to log in again.", [
                { text: "OK" }
            ]);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={CAMERA_FACING.BACK}
                flash={flash}
                ref={cameraRef}
            />

            <SafeAreaView style={styles.overlay} pointerEvents="box-none">
                {/* Top Controls */}
                <View style={styles.topControls}>
                    <TouchableOpacity
                        onPress={toggleFlash}
                        style={styles.iconButton}
                    >
                        {flash === FLASH_MODES.ON ?
                            <Zap size={24} color={COLORS.primary} fill={COLORS.primary} /> :
                            <ZapOff size={24} color={COLORS.white} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
                        <User size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* Center Focus Area (Visual only) */}
                <View style={styles.focusArea} pointerEvents="none">
                    <View style={styles.cornerRow}>
                        <View style={[styles.corner, styles.topLeft, { borderColor: focusColor }]} />
                        <View style={[styles.corner, styles.topRight, { borderColor: focusColor }]} />
                    </View>

                    {isFocused && (
                        <View style={styles.scanLineContainer}>
                            <ScanLine size={48} color={COLORS.primary} style={{ opacity: 0.5 }} />
                        </View>
                    )}

                    <View style={styles.cornerRow}>
                        <View style={[styles.corner, styles.bottomLeft, { borderColor: focusColor }]} />
                        <View style={[styles.corner, styles.bottomRight, { borderColor: focusColor }]} />
                    </View>

                    <Text style={[styles.focusLabel, { color: focusColor }]}>
                        {isFocused ? "SCANNING..." : "ALIGN PRODUCT"}
                    </Text>
                </View>

                {/* Bottom Controls */}
                <View style={styles.bottomControls}>
                    <TouchableOpacity onPress={pickImage} style={styles.galleryButton}>
                        <ImageIcon size={28} color={COLORS.white} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={takePicture} style={styles.captureContainer}>
                        <View style={styles.captureButton}>
                            <View style={styles.captureInner} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton}>
                        <Settings size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.s,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.overlayMedium,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    focusArea: {
        width: width * 0.75,
        height: width * 0.75,
        alignSelf: 'center',
        justifyContent: 'space-between',
    },
    scanLineContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cornerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    corner: {
        width: 40,
        height: 40,
        borderWidth: 3,
        borderRadius: 8,
    },
    topLeft: { borderTopWidth: 3, borderLeftWidth: 3, borderRightWidth: 0, borderBottomWidth: 0 },
    topRight: { borderTopWidth: 3, borderRightWidth: 3, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeft: { borderBottomWidth: 3, borderLeftWidth: 3, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRight: { borderBottomWidth: 3, borderRightWidth: 3, borderLeftWidth: 0, borderTopWidth: 0 },
    focusLabel: {
        position: 'absolute',
        bottom: -40,
        alignSelf: 'center',
        fontWeight: '700',
        letterSpacing: 3,
        fontSize: 12,
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xl,
    },
    galleryButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        backgroundColor: COLORS.overlayMedium,
    },
    captureContainer: {
        padding: 4,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    captureButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: '#000',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    permissionText: {
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.m,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: 8,
    },
});

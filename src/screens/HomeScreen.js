import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Zap, ZapOff, Image as ImageIcon, Settings, User } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [flash, setFlash] = useState('off');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false); // New state for green lock-on
    const cameraRef = useRef(null);

    // Simulate "Lock-on" effect
    useEffect(() => {
        const interval = setInterval(() => {
            // Toggle focus state to simulate finding an object
            setIsFocused(prev => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
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

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            navigation.navigate('Results', { imageUri: result.assets[0].uri });
        }
    };

    // Dynamic Color based on focus state
    const focusColor = isFocused ? '#4ADE80' : 'rgba(255, 255, 255, 0.6)'; // Green or Semi-transparent White

    return (
        <SafeAreaView style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                flash={flash}
                ref={cameraRef}
            >
                <View style={styles.overlay}>
                    {/* Top Controls */}
                    <View style={styles.topControls}>
                        <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
                            {flash === 'on' ? <Zap size={24} color="#FFF" /> : <ZapOff size={24} color="#FFF" />}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <User size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Center Focus Area (Visual only) */}
                    <View style={styles.focusArea}>
                        <View style={styles.cornerRow}>
                            <View style={[styles.corner, styles.topLeft, { borderColor: focusColor }]} />
                            <View style={[styles.corner, styles.topRight, { borderColor: focusColor }]} />
                        </View>
                        <View style={styles.cornerRow}>
                            <View style={[styles.corner, styles.bottomLeft, { borderColor: focusColor }]} />
                            <View style={[styles.corner, styles.bottomRight, { borderColor: focusColor }]} />
                        </View>
                        {isFocused && (
                            <Text style={[styles.focusLabel, { color: focusColor }]}>DETECTED</Text>
                        )}
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.bottomControls}>
                        <TouchableOpacity onPress={pickImage} style={styles.galleryButton}>
                            <ImageIcon size={28} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconButton}>
                            <Settings size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        paddingVertical: SPACING.xl,
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        borderWidth: 4, // Slightly thinner than 6
        borderRadius: 4, // Less rounded (more squared)
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
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xl * 1.5,
    },
    galleryButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        borderColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFF',
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

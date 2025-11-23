export const COLORS = {
    background: '#000000', // True Black for OLED
    surface: '#121212', // Material Dark
    primary: '#CCFF00', // Neon Lime (CAL AI style)
    secondary: '#00E5FF', // Cyan
    text: '#FFFFFF',
    textSecondary: '#A1A1AA', // Zinc 400
    danger: '#FF453A', // iOS Red
    warning: '#FF9F0A', // iOS Orange
    success: '#30D158', // iOS Green
    border: '#27272A', // Zinc 800

    // Glassmorphism & Overlays
    focus: '#CCFF00', // Match primary
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0,0,0,0.6)',
    overlayLight: 'rgba(255, 255, 255, 0.1)',
    overlayMedium: 'rgba(0,0,0,0.4)',
    overlayDark: 'rgba(0,0,0,0.8)',

    // Card Styles
    cardBackground: 'rgba(30, 30, 30, 0.6)', // Glassy
    cardBackgroundLight: 'rgba(255,255,255,0.08)',
    borderLight: 'rgba(255,255,255,0.15)',

    // Gradients (helper objects, not strings)
    gradientPrimary: ['#CCFF00', '#9EFF00'],
    gradientDark: ['transparent', 'rgba(0,0,0,0.9)'],
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
};

export const FONTS = {
    regular: 'System',
    bold: 'System', // In a real app, we'd load custom fonts
};
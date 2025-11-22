import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, FlatList, Linking, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Send, MessageCircle, AlertCircle, TrendingUp, User, ChevronRight, Calendar, Globe } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

// Helper to format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function EducationScreen() {
    const insets = useSafeAreaInsets();
    const [question, setQuestion] = useState('');

    // Mock Data for Q&A
    const recentQuestions = [
        {
            id: '1',
            user: 'Sarah M.',
            question: 'Is aspartame actually harmful in diet sodas?',
            answer: 'Current research suggests aspartame is safe for most people in moderation. However, some individuals may be sensitive. It is always best to consult with a dietitian for personalized advice.',
            professional: 'Dr. Emily Chen, RD',
            time: '2h ago'
        },
        {
            id: '2',
            user: 'Mike T.',
            question: 'What are good alternatives to high-fructose corn syrup?',
            answer: 'Honey, maple syrup, and stevia are popular alternatives. Look for "no added sugar" labels or products sweetened with fruit juice.',
            professional: 'Mark Wilson, Nutritionist',
            time: '5h ago'
        }
    ];

    const [news, setNews] = useState([]);
    const [loadingNews, setLoadingNews] = useState(true);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            // Use local IP from api.js logic (hardcoded here for simplicity based on previous steps)
            // In a real app, export API_URL from api.js
            const response = await fetch('http://192.168.1.92:5001/news');
            const data = await response.json();
            if (Array.isArray(data)) {
                setNews(data);
            }
        } catch (error) {
            console.error("Failed to fetch news:", error);
        } finally {
            setLoadingNews(false);
        }
    };

    const openLink = (url) => {
        if (url) {
            Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
        }
    };

    const renderNewsCard = ({ item }) => (
        <TouchableOpacity style={styles.newsCard} onPress={() => openLink(item.url)}>
            <View style={styles.newsImageContainer}>
                {item.urlToImage ? (
                    <Image source={{ uri: item.urlToImage }} style={styles.newsImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.newsBadge, { backgroundColor: COLORS.surface }]}>
                        <Text style={styles.newsBadgeText}>RESEARCH</Text>
                    </View>
                )}
                <View style={styles.sourceBadge}>
                    <Text style={styles.sourceText}>{item.source?.name || 'Source'}</Text>
                </View>
            </View>
            <View style={styles.newsContent}>
                <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.metaRow}>
                    <Calendar size={12} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>{formatDate(item.publishedAt)}</Text>
                </View>
                <Text style={styles.newsSummary} numberOfLines={3}>{item.description || item.content}</Text>
                <View style={styles.readMoreRow}>
                    <Text style={styles.readMoreText}>Read Study</Text>
                    <ChevronRight size={16} color={COLORS.primary} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Education & Help</Text>
                    <Text style={styles.headerSubtitle}>Expert advice and latest health news</Text>
                </View>

                {/* Ask a Professional Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MessageCircle size={24} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Ask a Professional</Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        Have a specific question about an ingredient or diet? Ask our network of certified professionals.
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type your question here..."
                            placeholderTextColor={COLORS.textSecondary}
                            value={question}
                            onChangeText={setQuestion}
                            multiline
                        />
                        <TouchableOpacity style={styles.sendButton}>
                            <Send size={20} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Recent Q&A */}
                    <Text style={styles.subHeader}>Recent Community Questions</Text>
                    {recentQuestions.map(q => (
                        <View key={q.id} style={styles.qaCard}>
                            <View style={styles.qaHeader}>
                                <View style={styles.userRow}>
                                    <View style={styles.avatar}>
                                        <User size={16} color={COLORS.text} />
                                    </View>
                                    <Text style={styles.userName}>{q.user}</Text>
                                </View>
                                <Text style={styles.timeText}>{q.time}</Text>
                            </View>
                            <Text style={styles.questionText}>{q.question}</Text>
                            <View style={styles.answerContainer}>
                                <View style={styles.proBadge}>
                                    <Text style={styles.proBadgeText}>Pro Answer</Text>
                                </View>
                                <Text style={styles.answerText}>{q.answer}</Text>
                                <Text style={styles.proName}>- {q.professional}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Recent Research Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <TrendingUp size={24} color={COLORS.secondary} />
                        <Text style={styles.sectionTitle}>Recent Research</Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        Latest findings from verified universities and health organizations.
                    </Text>

                    {loadingNews ? (
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    ) : (
                        <FlatList
                            data={news}
                            renderItem={renderNewsCard}
                            keyExtractor={(item, index) => index.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.newsList}
                        />
                    )}
                </View>

                {/* Footer Spacer */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.m,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    headerSubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        marginBottom: SPACING.s,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    sectionDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING.s,
        alignItems: 'flex-end',
        marginBottom: SPACING.l,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        paddingHorizontal: SPACING.s,
        paddingVertical: SPACING.s,
        minHeight: 50,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    subHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    qaCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    qaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    timeText: {
        color: '#666',
        fontSize: 12,
    },
    questionText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: SPACING.m,
        lineHeight: 22,
    },
    answerContainer: {
        backgroundColor: 'rgba(204, 255, 0, 0.05)', // Very faint primary color
        borderRadius: 12,
        padding: SPACING.m,
        borderLeftWidth: 2,
        borderLeftColor: COLORS.primary,
    },
    proBadge: {
        backgroundColor: COLORS.primary,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: SPACING.s,
    },
    proBadgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    answerText: {
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: SPACING.s,
    },
    proName: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
    },
    // News Styles
    newsList: {
        paddingRight: SPACING.m,
        gap: SPACING.m,
    },
    newsCard: {
        width: 280,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    newsImageContainer: {
        height: 140,
        backgroundColor: '#333',
        justifyContent: 'center', // Changed from flex-end to center for placeholder
        alignItems: 'center',
        overflow: 'hidden',
    },
    newsImage: {
        width: '100%',
        height: '100%',
    },
    newsBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    newsBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    sourceBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    sourceText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    newsContent: {
        padding: SPACING.m,
    },
    newsTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        lineHeight: 22,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    metaText: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    newsSummary: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: SPACING.m,
    },
    readMoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readMoreText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});

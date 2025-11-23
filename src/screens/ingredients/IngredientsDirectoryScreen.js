import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, BookOpen } from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';
import BottomBar from '../../components/BottomBar';
import IngredientPopup from '../../components/IngredientPopup';
import ingredientsData from './data.json';

export default function IngredientsDirectoryScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [showIngredientPopup, setShowIngredientPopup] = useState(false);

    // Get category from tags (first tag that's not "Food Ingredient", or first tag if all are "Food Ingredient")
    const getCategory = (ingredient) => {
        if (!ingredient.tags || ingredient.tags.length === 0) {
            return 'Ingredient';
        }
        // Filter out generic "Food Ingredient" tag and return the first meaningful tag
        const meaningfulTags = ingredient.tags.filter(tag => tag !== 'Food Ingredient');
        return meaningfulTags.length > 0 ? meaningfulTags[0] : ingredient.tags[0];
    };

    const filteredIngredients = ingredientsData.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ingredient.tags && ingredient.tags.some(tag => 
            tag.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
        (ingredient.summary && ingredient.summary.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleIngredientPress = (ingredient) => {
        setSelectedIngredient(ingredient);
        setShowIngredientPopup(true);
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <BookOpen size={28} color={COLORS.primary} />
                        <Text style={styles.headerTitle}>Ingredients Directory</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search ingredients..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Ingredients List */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredIngredients.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No ingredients found</Text>
                            <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
                        </View>
                    ) : (
                        filteredIngredients.map((ingredient, index) => (
                            <TouchableOpacity
                                key={ingredient.id || index}
                                style={styles.ingredientCard}
                                onPress={() => handleIngredientPress(ingredient)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.ingredientHeader}>
                                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryText}>{getCategory(ingredient)}</Text>
                                    </View>
                                </View>
                                <Text style={styles.ingredientDescription} numberOfLines={2}>
                                    {ingredient.summary || 'No description available.'}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
            <BottomBar navigation={navigation} />
            <IngredientPopup
                visible={showIngredientPopup}
                onClose={() => {
                    setShowIngredientPopup(false);
                    setSelectedIngredient(null);
                }}
                data={selectedIngredient}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.overlayMedium,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        marginRight: SPACING.m,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.m,
        marginTop: SPACING.m,
        marginBottom: SPACING.s,
        borderRadius: 16,
        paddingHorizontal: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchIcon: {
        marginRight: SPACING.s,
    },
    searchInput: {
        flex: 1,
        height: 48,
        color: COLORS.white,
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.m,
        paddingBottom: 100, // Space for bottom bar
    },
    ingredientCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 16,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    ingredientHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    ingredientName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.white,
        flex: 1,
    },
    categoryBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.s,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.black,
        textTransform: 'uppercase',
    },
    ingredientDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
});



import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';
import IngredientPopup from './IngredientPopup';
import MOCK_INGREDIENTS from './dummy_data.json';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.l * 3) / 2; // 2 columns with padding

// Extract unique families from ingredients
const getFamilies = (ingredients) => {
    const families = new Set();
    ingredients.forEach(ing => {
        if (ing.family) families.add(ing.family);
    });
    return ['All', ...Array.from(families).sort()];
};

const IngredientCard = ({ ingredient, onPress }) => {
    const primaryTag = ingredient.tags && ingredient.tags.length > 0 ? ingredient.tags[0] : '';
    const avgGrade = ingredient.evidenceMap && ingredient.evidenceMap.length > 0
        ? ingredient.evidenceMap.reduce((sum, e) => {
            const gradeValue = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 }[e.grade] || 0;
            return sum + gradeValue;
        }, 0) / ingredient.evidenceMap.length
        : 0;

    const getGradeColor = (avg) => {
        if (avg >= 4.5) return COLORS.success;
        if (avg >= 3.5) return COLORS.warning;
        if (avg >= 2.5) return COLORS.textSecondary;
        return COLORS.danger;
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Card Header with gradient effect */}
            <View style={[styles.cardHeader, { backgroundColor: COLORS.cardBackground }]}>
                <View style={styles.cardId}>
                    <Text style={styles.cardIdText}>#{ingredient.id.slice(0, 6).toUpperCase()}</Text>
                </View>
                {avgGrade > 0 && (
                    <View style={[styles.gradeIndicator, { backgroundColor: getGradeColor(avgGrade) }]}>
                        <Text style={styles.gradeIndicatorText}>
                            {avgGrade >= 4.5 ? 'A' : avgGrade >= 3.5 ? 'B' : avgGrade >= 2.5 ? 'C' : 'D'}
                        </Text>
                    </View>
                )}
            </View>

            {/* Card Body */}
            <View style={styles.cardBody}>
                <View style={styles.cardImagePlaceholder}>
                    <Text style={styles.cardImageText}>{ingredient.name.charAt(0)}</Text>
                </View>
                <Text style={styles.cardName}>{ingredient.name}</Text>
                {primaryTag && (
                    <View style={styles.cardTag}>
                        <Text style={styles.cardTagText}>{primaryTag}</Text>
                    </View>
                )}
            </View>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
                <View style={styles.cardStats}>
                    <Text style={styles.cardStatText}>
                        {ingredient.evidenceMap?.length || 0} Effects
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function IngredientsLibraryScreen({ navigation }) {
    const [selectedFamily, setSelectedFamily] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [popupVisible, setPopupVisible] = useState(false);

    const families = useMemo(() => getFamilies(MOCK_INGREDIENTS), []);

    const filteredIngredients = useMemo(() => {
        return MOCK_INGREDIENTS.filter(ing => {
            const matchesFamily = selectedFamily === 'All' || ing.family === selectedFamily;
            const matchesSearch = searchQuery === '' || 
                ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (ing.tags && ing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
            return matchesFamily && matchesSearch;
        });
    }, [selectedFamily, searchQuery]);

    const openIngredient = (ingredient) => {
        setSelectedIngredient(ingredient);
        setPopupVisible(true);
    };

    const closePopup = () => {
        setPopupVisible(false);
        setSelectedIngredient(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ingredient Library</Text>
                <Text style={styles.headerSubtitle}>Explore ingredients and their effects</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color={COLORS.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search ingredients..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Family Filter */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {families.map((family) => (
                        <TouchableOpacity
                            key={family}
                            style={[
                                styles.filterChip,
                                selectedFamily === family && styles.filterChipActive
                            ]}
                            onPress={() => setSelectedFamily(family)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                selectedFamily === family && styles.filterChipTextActive
                            ]}>
                                {family}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Ingredients Grid */}
            <FlatList
                data={filteredIngredients}
                renderItem={({ item }) => (
                    <IngredientCard
                        ingredient={item}
                        onPress={() => openIngredient(item)}
                    />
                )}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No ingredients found</Text>
                    </View>
                }
            />

            {/* Ingredient Popup */}
            <IngredientPopup
                visible={popupVisible}
                ingredient={selectedIngredient}
                onClose={closePopup}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SPACING.l,
        paddingBottom: SPACING.m,
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
    searchContainer: {
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.m,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        gap: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
    },
    filterContainer: {
        marginBottom: SPACING.m,
    },
    filterScroll: {
        paddingHorizontal: SPACING.l,
        gap: SPACING.s,
    },
    filterChip: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: SPACING.s,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterChipText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: COLORS.black,
        fontWeight: '600',
    },
    listContent: {
        padding: SPACING.l,
        paddingTop: SPACING.m,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: SPACING.m,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.m,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.s,
        paddingHorizontal: SPACING.m,
    },
    cardId: {
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.s,
        paddingVertical: 2,
        borderRadius: 8,
    },
    cardIdText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        letterSpacing: 1,
    },
    gradeIndicator: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradeIndicatorText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    cardBody: {
        alignItems: 'center',
        padding: SPACING.m,
    },
    cardImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.s,
        borderWidth: 2,
        borderColor: COLORS.borderLight,
    },
    cardImageText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    cardName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    cardTag: {
        backgroundColor: COLORS.cardBackgroundLight,
        paddingHorizontal: SPACING.s,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    cardTagText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    cardFooter: {
        padding: SPACING.m,
        paddingTop: SPACING.s,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    cardStats: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    cardStatText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
});


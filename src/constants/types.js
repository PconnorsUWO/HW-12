// Flash modes
export const FLASH_MODES = {
    ON: 'on',
    OFF: 'off',
};

// Navigation routes
export const ROUTES = {
    RESULTS: 'Results',
    HOME: 'Home',
    WELCOME: 'Welcome',
};

// Camera facing
export const CAMERA_FACING = {
    BACK: 'back',
    FRONT: 'front',
};

// Modal types (for ResultsScreen)
export const MODAL_TYPES = {
    ANALYSIS: 'analysis',
    INGREDIENTS: 'ingredients',
    HARMFUL: 'harmful',
    EFFECTS: 'effects',
    COMBOS: 'combos',
    SOURCES: 'sources',
};

// Score thresholds
export const SCORE_THRESHOLDS = {
    HIGH: 80,
    MEDIUM: 50,
};

// Card titles
export const CARD_TITLES = {
    OVERALL_ANALYSIS: 'Overall Analysis',
    INGREDIENTS_LIST: 'Ingredients List',
    HARMFUL_COMPONENTS: 'Harmful Components',
    POTENTIAL_SIDE_EFFECTS: 'Potential Side Effects',
    HARMFUL_COMBINATIONS: 'Harmful Combinations',
    SCHOLARLY_SOURCES: 'Scholarly Sources',
    HEALTH_SCORE: 'Health Score',
};

// Labels
export const LABELS = {
    SEVERITY: 'Severity:',
    FREQUENCY: 'Frequency:',
    RISK: 'Risk:',
    SOURCE: 'Source #',
};

// Error messages
export const ERROR_MESSAGES = {
    ANALYSIS_FAILED: 'Failed to analyze image. Make sure the server is running.',
    NO_DATA: 'No data received',
    PICTURE_FAILED: 'Failed to take picture',
    NO_CAMERA_ACCESS: 'No access to camera',
};

// Loading messages
export const LOADING_MESSAGES = {
    ANALYZING: 'Analyzing Ingredients...',
    IDENTIFYING: 'Identifying additives & health risks',
    SCANNING: 'Scanning...',
};

// Empty state messages
export const EMPTY_STATES = {
    NO_HARMFUL_COMPONENTS: 'No major harmful components detected.',
    NO_SIDE_EFFECTS: 'No significant side effects reported.',
    NO_COMBINATIONS: 'No harmful combinations found.',
    NO_SOURCES: 'No specific sources cited.',
};

// UI Text
export const UI_TEXT = {
    ERROR: 'Error',
    DETECTED: 'DETECTED',
    GRANT_PERMISSION: 'Grant Permission',
};

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
    FAST: 200,
    NORMAL: 500,
    SLOW: 2000,
    FOCUS_INTERVAL: 3000,
};

// Animation values
export const ANIMATION_VALUES = {
    INITIAL_PROGRESS: 0,
    MID_PROGRESS: 0.7,
    FINAL_PROGRESS: 1,
    SLIDE_OFFSET: 20,
};

// Image picker settings
export const IMAGE_PICKER = {
    ASPECT_RATIO: [4, 3],
    QUALITY: 1,
};

// API Response Structure
// This defines the expected structure of the API response from /analyze endpoint
// The API should return an object with an 'analysis' property, or the data directly
export const API_RESPONSE_STRUCTURE = {
    // Overall health score (0-100)
    overallWeightedHealthScore: 'number',
    // Overall analysis text
    overallAnalysis: 'string',
    // Array of ingredients with name and function
    ingredients: [
        {
            name: 'string',
            function: 'string',
        }
    ],
    // Array of harmful components
    harmfulComponents: [
        {
            name: 'string',
            concern: 'string',
            severity: 'string',
        }
    ],
    // Array of side effects
    sideEffects: [
        {
            effect: 'string',
            frequency: 'string',
        }
    ],
    // Array of harmful combinations
    harmfulCombinations: [
        {
            combo: 'string',
            risk: 'string',
        }
    ],
    // Array of scholarly sources
    scholarlySources: [
        {
            citation: 'string',
            url: 'string', // optional
        }
    ],
};

// API Response Keys - for easy reference
export const API_RESPONSE_KEYS = {
    OVERALL_SCORE: 'overallWeightedHealthScore',
    OVERALL_ANALYSIS: 'overallAnalysis',
    INGREDIENTS: 'ingredients',
    HARMFUL_COMPONENTS: 'harmfulComponents',
    SIDE_EFFECTS: 'sideEffects',
    HARMFUL_COMBINATIONS: 'harmfulCombinations',
    SCHOLARLY_SOURCES: 'scholarlySources',
};


const MOCK_RESPONSE = {
    "appAssessment": "POOR",
    "overallWeightedHealthScore": 45,
    "worstSideEffectsSummary": [
        "The overwhelming combination of stimulants (caffeine, guarana, guayusa, green tea, and ginseng) creates a significant risk of cardiovascular and central nervous system overstimulation, potentially negating the mild beneficial effects.",
        "Chronic, cumulative consumption of multiple artificial sweeteners (Acesulfame Potassium and Sucralose) is associated with an elevated risk of gut microbiome disruption and possible metabolic concerns.",
        "The presence of the fat-soluble Vitamin A Palmitate alongside high-risk B-vitamins (Niacinamide/B3 and Pyridoxine HCl/B6) raises the potential for toxicity and accumulation over time with regular consumption."
    ],
    // NEW: Scientific Deep-Dive Data
    scientificAnalysis: {
        summary: "While convenient, this product contains additives that are currently under scrutiny in the scientific community. Occasional consumption is likely safe, but regular intake may pose risks.",
        drawbacks: [
            {
                title: "Metabolic Disruption",
                description: "High Fructose Corn Syrup has been linked to insulin resistance and non-alcoholic fatty liver disease.",
                confidence: "High",
                severity: "High"
            },
            {
                title: "Artificial Color Concerns",
                description: "Red 40 may cause hypersensitivity reactions and is being investigated for links to behavioral issues in children.",
                confidence: "Medium",
                severity: "Medium"
            }
        ],
        benefits: [
            {
                title: "Quick Energy Source",
                description: "Provides immediate caloric energy, though lacks sustained release.",
                confidence: "High",
                severity: "Low"
            }
        ],
        citations: [
            {
                title: "Consumption of high-fructose corn syrup in beverages may play a role in the epidemic of obesity",
                author: "Bray et al.",
                year: "2004",
                journal: "American Journal of Clinical Nutrition"
            },
            {
                title: "Artificial Food Colors and Attention-Deficit/Hyperactivity Symptoms",
                author: "Stevens et al.",
                year: "2011",
                journal: "Pediatrics"
            }
        ]
    },
    "badIngredientCombos": [
        {
            combo: "High Fructose Corn Syrup + Artificial Colors",
            reasoning: ["Increases hyperactivity in children", "Linked to obesity and diabetes"],
            potentialSideEffects: ["Hyperactivity", "Weight Gain"]
        },
        {
            "combo": "Caffeine, Guarana Extract, Guayusa Extract, Green Tea Extract (EGCG/Caffeine), Panax Ginseng Extract",
            "reasoning": [
                "This is a stack of multiple strong stimulants, where Guarana and Guayusa significantly contribute to total caffeine content, amplifying the effects of the added caffeine.",
                "The combination elevates cardiovascular strain and heightens the risk of acute central nervous system side effects common with overconsumption of stimulants."
            ],
            "potentialSideEffects": [
                "Severe heart palpitations or tachycardia.",
                "Increased blood pressure.",
                "Insomnia, extreme anxiety, and nervousness."
            ]
        },
        {
            "combo": "Acesulfame Potassium, Sucralose",
            "reasoning": [
                "The use of multiple non-nutritive, artificial sweeteners increases the cumulative exposure to compounds with limited long-term safety data.",
                "The combination raises concern for dose-dependent disruption of the gut microbiome, which is a significant factor in overall health."
            ],
            "potentialSideEffects": [
                "Gastrointestinal distress (bloating, gas).",
                "Potential negative alterations to the balance of gut flora.",
                "Headaches or migraines in sensitive individuals."
            ]
        },
        {
            "combo": "Vitamin A Palmitate, Pyridoxine Hydrochloride (Vit. B6), Niacinamide (Vit. B3)",
            "reasoning": [
                "Vitamin A is fat-soluble and can accumulate in the body, creating a toxicity risk (hypervitaminosis A) with chronic intake.",
                "Chronic high-dose intake of Pyridoxine (B6) is linked to peripheral neuropathy (nerve damage), and high Niacinamide (B3) can cause flushing and liver enzyme elevation."
            ],
            "potentialSideEffects": [
                "Hepatotoxicity (liver damage) from chronic Vitamin A accumulation.",
                "Peripheral neuropathy from high B6 doses.",
                "Severe skin flushing, nausea, and stomach irritation from Niacinamide."
            ]
        }
    ]
};

export const analyzeImage = async (imageUri) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_RESPONSE);
        }, 2000); // Simulate 2s network delay
    });
};

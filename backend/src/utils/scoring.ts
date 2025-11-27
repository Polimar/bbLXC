/**
 * Advanced Scoring System for BrainBrawler (Backend)
 * 
 * Scoring Formula:
 * - Correct Answer: BASE_POINTS + TIME_BONUS
 * - Wrong Answer: -WRONG_ANSWER_PENALTY
 * - No Answer (timeout): 0 points
 */

export interface ScoringConfig {
    basePoints: number;           // Base points for correct answer (default: 100)
    wrongAnswerPenalty: number;   // Points deducted for wrong answer (default: 25)
    maxTimeBonus: number;         // Maximum time bonus (default: 50)
}

export interface AnswerResult {
    isCorrect: boolean;
    timeUsed: number;
    timeLimit: number;
    points: number;
    breakdown: {
        basePoints: number;
        timeBonus: number;
        penalty: number;
        totalPoints: number;
    };
}

const DEFAULT_CONFIG: ScoringConfig = {
    basePoints: 100,
    wrongAnswerPenalty: 25,
    maxTimeBonus: 50
};

/**
 * Calculate points for an answer
 */
export function calculateScore(
    isCorrect: boolean,
    timeUsed: number,
    timeLimit: number,
    config: Partial<ScoringConfig> = {}
): AnswerResult {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Wrong answer penalty
    if (!isCorrect) {
        return {
            isCorrect: false,
            timeUsed,
            timeLimit,
            points: -finalConfig.wrongAnswerPenalty,
            breakdown: {
                basePoints: 0,
                timeBonus: 0,
                penalty: -finalConfig.wrongAnswerPenalty,
                totalPoints: -finalConfig.wrongAnswerPenalty
            }
        };
    }

    // Correct answer with time bonus
    const basePoints = finalConfig.basePoints;
    const timeBonus = calculateTimeBonus(timeUsed, timeLimit, finalConfig);
    const totalPoints = Math.round(basePoints + timeBonus);

    return {
        isCorrect: true,
        timeUsed,
        timeLimit,
        points: totalPoints,
        breakdown: {
            basePoints,
            timeBonus,
            penalty: 0,
            totalPoints
        }
    };
}

/**
 * Calculate time bonus based on response speed
 */
function calculateTimeBonus(
    timeUsed: number,
    timeLimit: number,
    config: ScoringConfig
): number {
    const timePercentage = (timeUsed / timeLimit) * 100;
    const basePoints = config.basePoints;

    let bonusPercentage = 0;

    if (timePercentage < 10) {
        bonusPercentage = 50;  // Lightning fast!
    } else if (timePercentage < 25) {
        bonusPercentage = 40;  // Very fast
    } else if (timePercentage < 40) {
        bonusPercentage = 30;  // Fast
    } else if (timePercentage < 60) {
        bonusPercentage = 20;  // Quick
    } else if (timePercentage < 80) {
        bonusPercentage = 10;  // Normal
    } else {
        bonusPercentage = 0;   // Slow
    }

    return Math.round((basePoints * bonusPercentage) / 100);
}

/**
 * Calculate streak bonus multiplier
 */
export function calculateStreakBonus(
    baseScore: number,
    streakCount: number
): number {
    if (streakCount <= 1) return baseScore;

    // Streak multiplier: 1.1x, 1.2x, 1.3x, etc. (max 2x at 10 streak)
    const multiplier = Math.min(1 + (streakCount - 1) * 0.1, 2.0);
    return Math.round(baseScore * multiplier);
}

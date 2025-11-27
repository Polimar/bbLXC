/**
 * Advanced Scoring System for BrainBrawler
 * 
 * Scoring Formula:
 * - Correct Answer: BASE_POINTS + TIME_BONUS - (used_time / total_time * MAX_TIME_PENALTY)
 * - Wrong Answer: -WRONG_ANSWER_PENALTY
 * - No Answer (timeout): 0 points
 * 
 * Time Bonus:
 * - Instant answer (< 2s): +50% bonus
 * - Fast answer (< 5s): +30% bonus
 * - Quick answer (< 10s): +15% bonus
 * - Normal answer: base points only
 */

export interface ScoringConfig {
    basePoints: number;           // Base points for correct answer (default: 100)
    wrongAnswerPenalty: number;   // Points deducted for wrong answer (default: 25)
    maxTimeBonus: number;         // Maximum time bonus percentage (default: 50)
    minTimeBonus: number;         // Minimum time bonus percentage (default: 0)
}

export interface AnswerResult {
    isCorrect: boolean;
    timeUsed: number;      // Time used in seconds
    timeLimit: number;     // Total time allowed in seconds
    points: number;        // Calculated points
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
    maxTimeBonus: 50,
    minTimeBonus: 0
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
 * 
 * Bonus tiers:
 * - < 10% of time used: +50% bonus
 * - < 25% of time used: +40% bonus
 * - < 40% of time used: +30% bonus
 * - < 60% of time used: +20% bonus
 * - < 80% of time used: +10% bonus
 * - >= 80% of time used: 0% bonus
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
        bonusPercentage = 50;
    } else if (timePercentage < 25) {
        bonusPercentage = 40;
    } else if (timePercentage < 40) {
        bonusPercentage = 30;
    } else if (timePercentage < 60) {
        bonusPercentage = 20;
    } else if (timePercentage < 80) {
        bonusPercentage = 10;
    } else {
        bonusPercentage = 0;
    }

    return Math.round((basePoints * bonusPercentage) / 100);
}

/**
 * Calculate streak bonus
 * Consecutive correct answers multiply the score
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

/**
 * Get score display with color coding
 */
export function getScoreDisplay(points: number): {
    text: string;
    color: string;
    emoji: string;
} {
    if (points >= 150) {
        return { text: `+${points}`, color: '#FFD700', emoji: '🔥' };
    } else if (points >= 100) {
        return { text: `+${points}`, color: '#4CAF50', emoji: '✨' };
    } else if (points > 0) {
        return { text: `+${points}`, color: '#8BC34A', emoji: '✓' };
    } else if (points === 0) {
        return { text: '0', color: '#9E9E9E', emoji: '⏱️' };
    } else {
        return { text: `${points}`, color: '#F44336', emoji: '✗' };
    }
}

/**
 * Format time for display
 */
export function formatTime(seconds: number): string {
    return `${seconds.toFixed(1)}s`;
}

/**
 * Get performance rating based on score
 */
export function getPerformanceRating(
    score: number,
    maxPossibleScore: number
): {
    rating: string;
    color: string;
    percentage: number;
} {
    const percentage = (score / maxPossibleScore) * 100;

    if (percentage >= 90) {
        return { rating: 'Perfect!', color: '#FFD700', percentage };
    } else if (percentage >= 75) {
        return { rating: 'Excellent', color: '#4CAF50', percentage };
    } else if (percentage >= 60) {
        return { rating: 'Good', color: '#8BC34A', percentage };
    } else if (percentage >= 40) {
        return { rating: 'Fair', color: '#FFC107', percentage };
    } else {
        return { rating: 'Needs Improvement', color: '#FF5722', percentage };
    }
}

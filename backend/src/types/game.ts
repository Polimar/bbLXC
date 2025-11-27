export interface Player {
    id: string;
    username: string;
    score: number;
    avatar?: string;
    isConnected: boolean;
}

export interface GameState {
    id: string;
    code: string;
    hostId: string;
    players: Player[];
    status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
    currentQuestionIndex: number;
    currentQuestion?: Question;
    timeRemaining: number;
    totalQuestions?: number;
}

export interface Question {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
    timeLimit: number;
    points: number;
}

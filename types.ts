// Fix: Exporting interfaces to make this file a module and define application types.
export interface BaseQuestion {
    id: number;
    type: 'multiple-choice' | 'essay';
    category?: string;
    question: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: 'multiple-choice';
    options: { [key: string]: string };
    answer: string;
}

export interface EssayQuestion extends BaseQuestion {
    type: 'essay';
}

export type Question = MultipleChoiceQuestion | EssayQuestion;

export interface CandidateResult {
    id: string;
    submissionDate: string;
    name: string;
    email: string;
    whatsapp: string;
    address: string;
    multipleChoiceAnswers: { [key: number]: string };
    essayAnswers: { [key: number]: string };
    score: number;
    totalPossibleScore: number;
    correctAnswersCount: number;
    incorrectAnswersCount: number;
}

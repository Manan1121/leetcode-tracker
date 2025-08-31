// src/types/index.ts
import { User, Problem, Submission, Review } from '@prisma/client';

export interface SubmissionWithProblem extends Submission {
  problem: Problem;
}

export interface SubmissionWithProblemAndReviews extends Submission {
  problem: Problem;
  reviews: Review[];
}

export interface UserWithPreferences extends User {
  emailNotifications: boolean;
  reviewHour: number;
  timezone: string;
}

export interface ReviewData {
  submissionId: string;
  difficulty: number;
  timeSpent?: number;
  notes?: string;
}

export interface EmailMetadata {
  problemCount?: number;
  emailId?: string;
  error?: string;
  [key: string]: unknown;
}
export interface Card {
  id: string;
  user_id: string;
  image_url: string;
  correct_char: string;
  confused_with: string[];
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  last_reviewed?: string;
  next_review: string;
  box: number;
  correct_count: number;
  incorrect_count: number;
}

export interface ReviewSession {
  id: string;
  user_id: string;
  date: string;
  cards_reviewed: number;
  correct_count: number;
  incorrect_count: number;
  duration_seconds: number;
}

export interface UserProgress {
  user_id: string;
  total_cards: number;
  active_cards: number;
  mastered_cards: number;
  streak_days: number;
  last_study_date: string;
  longest_streak: number;
  total_review_time: number;
  confusion_matrix: Record<string, Record<string, number>>;
}

export interface Settings {
  user_id: string;
  theme: "light" | "dark" | "system";
  daily_goal: number;
  show_hints: boolean;
  sound_enabled: boolean;
  last_compare_left_id?: string;
  last_compare_right_id?: string;
}

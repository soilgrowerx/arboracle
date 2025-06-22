export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  authorAvatar?: string;
  tags: string[];
  category: 'forestry' | 'ecology' | 'conservation' | 'identification' | 'management' | 'research';
  upvoteCount: number;
  downvoteCount: number;
  confidenceScore: number; // Calculated from votes (0-100)
  viewCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number; // in minutes
  featuredImage?: string;
  created_at: string;
  updated_at: string;
  isVerified: boolean; // Verified by experts
  sources?: string[]; // External references
}

export interface UserVote {
  userId: string;
  articleId: string;
  voteType: 'upvote' | 'downvote';
  timestamp: string;
}

export interface KnowledgeComment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  isExpert: boolean;
}

export interface KnowledgeSearch {
  query: string;
  category?: string;
  tags?: string[];
  difficulty?: string;
  sortBy?: 'relevance' | 'confidence' | 'recent' | 'popular';
}

export interface KnowledgeStats {
  totalArticles: number;
  totalViews: number;
  averageConfidence: number;
  topCategories: { category: string; count: number }[];
  expertArticles: number;
}

// Bodhi AI Integration Types
export interface BodhiQuery {
  id: string;
  question: string;
  userId: string;
  relatedArticles: string[]; // Article IDs that might be relevant
  aiResponse?: string; // Future AI response
  confidence?: number; // AI confidence in response
  created_at: string;
  isAnswered: boolean;
  category?: string;
}

export interface BodhiContext {
  userTrees: number;
  userExperience: 'beginner' | 'intermediate' | 'advanced';
  recentActivity: string[];
  location?: string;
  interests: string[];
}
export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  isbn?: string;
  description?: string;
  coverUrl?: string | null;
  addedAt: string;
}

export interface Shelf {
  id: string;
  userId: string;
  name: string;
  bookIds: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

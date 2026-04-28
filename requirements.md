### The BookShelf Project

## What you're building
A personal book catalogue where users can browse books, search by title/author/genre, add books to shelves (e.g. "Reading", "Finished", "Want to Read"), and leave reviews. Think of a simplified Goodreads.

## Monorepo structure
bookshelf/
├── apps/
│   ├── api/              # Express REST API
│   │   ├── src/
│   │   │   ├── routes/      # Route handlers
│   │   │   ├── services/    # Business logic
│   │   │   ├── data/        # JSON data store + access layer
│   │   │   └── middleware/   # Auth, validation, error handling
│   │   ├── tests/
│   │   └── package.json
│   └── web/              # React frontend
│       ├── src/
│       │   ├── components/  # UI components
│       │   ├── pages/       # Page-level components
│       │   ├── hooks/       # Custom hooks
│       │   └── lib/         # API client, utilities
│       ├── tests/
│       └── package.json
├── packages/
│   └── shared/           # Shared types and utilities
│       ├── src/
│       └── package.json
├── data/
│   ├── books.json        # Book catalogue (seed data provided)
│   ├── shelves.json      # User shelves
│   └── reviews.json      # Book reviews
├── package.json          # Root workspace config
├── CLAUDE.md             # Project context (you'll write this on Day 2)
└── README.md


### Data store
No database. All data lives in JSON files in the /data directory. The API reads and writes to these files through a data access layer that provides basic CRUD operations.

Seed data is provided with ~50 books across different genres. Here's the shape:

// data/books.json
[
  {
    "id": "book_001",
    "title": "The Pragmatic Programmer",
    "author": "David Thomas, Andrew Hunt",
    "genre": "Technology",
    "year": 1999,
    "isbn": "978-0135957059",
    "description": "A guide to software craftsmanship...",
    "coverUrl": null,
    "addedAt": "2025-01-15T10:30:00Z"
  }
]
 
// data/shelves.json
[
  {
    "id": "shelf_001",
    "userId": "user_001",
    "name": "Currently Reading",
    "bookIds": ["book_001", "book_003"],
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
 
// data/reviews.json
[
  {
    "id": "review_001",
    "bookId": "book_001",
    "userId": "user_001",
    "rating": 5,
    "text": "Essential reading for any developer...",
    "createdAt": "2025-01-20T14:00:00Z"
  }
]

## API endpoints (target spec)
You won't build all of these on Day 1 - this is the full spec you'll work towards across the week.
GET    /api/books              # List all books (with optional filters)
GET    /api/books/:id          # Get a single book (with reviews)
POST   /api/books              # Add a new book
PUT    /api/books/:id          # Update a book
DELETE /api/books/:id          # Remove a book
 
GET    /api/books/search?q=    # Search by title, author, or genre
 
GET    /api/shelves             # List user's shelves
POST   /api/shelves             # Create a shelf
POST   /api/shelves/:id/books   # Add a book to a shelf
DELETE /api/shelves/:id/books/:bookId  # Remove from shelf
 
GET    /api/books/:id/reviews   # Get reviews for a book
POST   /api/books/:id/reviews   # Add a review
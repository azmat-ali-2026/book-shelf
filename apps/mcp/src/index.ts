import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

interface Book {
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

interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text?: string;
  createdAt: string;
}

interface Shelf {
  id: string;
  userId: string;
  name: string;
  bookIds: string[];
  createdAt: string;
}

const DATA_DIR = path.resolve(__dirname, "../../../data");

const loadJson = <T>(filename: string): T[] => {
  const raw = fs.readFileSync(path.join(DATA_DIR, filename), "utf-8");
  return JSON.parse(raw) as T[];
};

const server = new McpServer({
  name: "bookshelf",
  version: "1.0.0",
});

server.registerTool(
  "list_books",
  { description: "List all books in the BookShelf library" },
  () => {
    const books = loadJson<Book>("books.json");
    if (books.length === 0) {
      return { content: [{ type: "text", text: "No books found." }] };
    }
    const lines = books.map(
      (b) => `[${b.id}] "${b.title}" by ${b.author} (${b.year}) — ${b.genre}`
    );
    return {
      content: [
        {
          type: "text",
          text: `${books.length} book(s) in the library:\n\n${lines.join("\n")}`,
        },
      ],
    };
  }
);

server.registerTool(
  "query_books",
  {
    description: "Search books by title, author, genre, or description",
    inputSchema: { term: z.string().describe("Search term to match against title, author, genre, or description") },
  },
  ({ term }) => {
    const books = loadJson<Book>("books.json");
    const lower = term.toLowerCase();
    const matches = books.filter(
      (b) =>
        b.title.toLowerCase().includes(lower) ||
        b.author.toLowerCase().includes(lower) ||
        b.genre.toLowerCase().includes(lower) ||
        (b.description ?? "").toLowerCase().includes(lower)
    );

    if (matches.length === 0) {
      return { content: [{ type: "text", text: `No books found matching "${term}".` }] };
    }

    const lines = matches.map(
      (b) => `[${b.id}] "${b.title}" by ${b.author} (${b.year}) — ${b.genre}`
    );
    return {
      content: [
        {
          type: "text",
          text: `Found ${matches.length} book(s) matching "${term}":\n\n${lines.join("\n")}`,
        },
      ],
    };
  }
);

server.registerTool(
  "get_book_stats",
  { description: "Get aggregate statistics about the BookShelf library" },
  () => {
    const books = loadJson<Book>("books.json");
    const reviews = loadJson<Review>("reviews.json");
    const shelves = loadJson<Shelf>("shelves.json");

    const genreCounts: Record<string, number> = {};
    for (const book of books) {
      genreCounts[book.genre] = (genreCounts[book.genre] ?? 0) + 1;
    }

    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => `  ${genre}: ${count}`)
      .join("\n");

    const years = books.map((b) => b.year).filter((y) => y > 0);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(2) : "N/A";

    const totalShelfSlots = shelves.reduce((sum, s) => sum + s.bookIds.length, 0);

    const stats = [
      `Total books:    ${books.length}`,
      `Total reviews:  ${reviews.length}`,
      `Total shelves:  ${shelves.length}`,
      `Avg rating:     ${avgRating}`,
      `Year range:     ${minYear} – ${maxYear}`,
      `Books on shelves: ${totalShelfSlots}`,
      `\nTop genres:\n${topGenres}`,
    ].join("\n");

    return { content: [{ type: "text", text: stats }] };
  }
);

const transport = new StdioServerTransport();
server.connect(transport).catch((err: unknown) => {
  process.stderr.write(`MCP server error: ${String(err)}\n`);
  process.exit(1);
});

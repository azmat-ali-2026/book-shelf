import { app } from './app';

const PORT = process.env['PORT'] ? Number(process.env['PORT']) : 3000;

app.listen(PORT, () => {
  console.log(`BookShelf API running on http://localhost:${PORT}`);
});

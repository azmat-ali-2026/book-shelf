import fs from 'fs';
import path from 'path';

function getDataDir(): string {
  return (
    process.env['DATA_DIR'] ??
    path.resolve(__dirname, '..', '..', '..', '..', 'data')
  );
}

export class FileStore<T extends { id: string }> {
  private records: Map<string, T>;
  private readonly filePath: string;

  constructor(fileName: string) {
    this.filePath = path.join(getDataDir(), fileName);
    const raw = fs.readFileSync(this.filePath, 'utf-8');
    const arr = JSON.parse(raw) as T[];
    this.records = new Map(arr.map((r) => [r.id, r] as [string, T]));
  }

  getAll(): T[] {
    return [...this.records.values()];
  }

  getById(id: string): T | undefined {
    return this.records.get(id);
  }

  save(record: T): T {
    this.records.set(record.id, record);
    this.flush();
    return record;
  }

  delete(id: string): boolean {
    const existed = this.records.delete(id);
    if (existed) this.flush();
    return existed;
  }

  private flush(): void {
    fs.writeFileSync(
      this.filePath,
      JSON.stringify([...this.records.values()], null, 2),
    );
  }
}

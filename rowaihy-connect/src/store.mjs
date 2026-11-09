import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
export class Store {
  constructor(path) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, document TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), document TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS runs_project_time ON runs(project_id,created_at);
    `);
    for (const row of this.db.prepare("SELECT id,document FROM runs").all()) {
      const run = JSON.parse(row.document);
      if (['running','queued'].includes(run.status)) { run.status = 'interrupted'; run.finishedAt = new Date().toISOString(); this.writeRun(run); }
    }
  }
  listProjects() { return this.db.prepare('SELECT document FROM projects ORDER BY created_at DESC,id DESC').all().map(x => JSON.parse(x.document)); }
  getProject(id) { const row = this.db.prepare('SELECT document FROM projects WHERE id=?').get(id); return row ? JSON.parse(row.document) : null; }
  saveProject(document, id = randomUUID()) {
    const previous = this.getProject(id);
    const createdAt = previous?.createdAt ?? new Date().toISOString();
    const project = { ...document, id, createdAt, updatedAt: new Date().toISOString() };
    this.db.prepare('INSERT INTO projects(id,document,created_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document').run(id, JSON.stringify(project), createdAt);
    return project;
  }
  deleteProject(id) {
    if (!this.getProject(id)) return false;
    if (this.hasOpenRun(id)) throw new Error('أوقف اختبارات المشروع قبل حذفه');
    this.db.exec('BEGIN');
    try { this.db.prepare('DELETE FROM runs WHERE project_id=?').run(id); this.db.prepare('DELETE FROM projects WHERE id=?').run(id); this.db.exec('COMMIT'); }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
    return true;
  }
  listRuns(projectId) {
    const rows = projectId ? this.db.prepare('SELECT document FROM runs WHERE project_id=? ORDER BY created_at DESC,rowid DESC LIMIT 200').all(projectId)
      : this.db.prepare('SELECT document FROM runs ORDER BY created_at DESC,rowid DESC LIMIT 200').all();
    return rows.map(x => JSON.parse(x.document));
  }
  getRun(id) { const row = this.db.prepare('SELECT document FROM runs WHERE id=?').get(id); return row ? JSON.parse(row.document) : null; }
  createRun(project) {
    const run = { id: randomUUID(), projectId: project.id, project: structuredClone(project), status: 'queued', createdAt: new Date().toISOString(), startedAt: null, finishedAt: null, results: [], error: null };
    this.db.prepare('INSERT INTO runs(id,project_id,document,created_at) VALUES(?,?,?,?)').run(run.id, project.id, JSON.stringify(run), run.createdAt);
    return run;
  }
  writeRun(run) { this.db.prepare('UPDATE runs SET document=? WHERE id=?').run(JSON.stringify(run), run.id); return run; }
  startRun(id) { const run = this.getRun(id); if (run?.status !== 'queued') return; run.status = 'running'; run.startedAt = new Date().toISOString(); this.writeRun(run); }
  addResult(id, result) { const run = this.getRun(id); if (run?.status !== 'running') return; run.results.push(result); this.writeRun(run); }
  finishRun(id, status, error = null) { const run = this.getRun(id); if (!run || !['running','queued'].includes(run.status)) return; run.status = status; run.error = error; run.finishedAt = new Date().toISOString(); this.writeRun(run); }
  hasOpenRun(projectId) { return Boolean(this.db.prepare("SELECT 1 FROM runs WHERE project_id=? AND json_extract(document,'$.status') IN ('queued','running') LIMIT 1").get(projectId)); }
  close() { this.db.close(); }
}

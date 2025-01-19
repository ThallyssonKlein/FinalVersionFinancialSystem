import { Pool } from 'pg';
import Config from "@config/index";

export default class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {}

  connect(): void {
    const config = new Config().getConfig();
    this.pool = new Pool({
      user: config.db.user,
      host: config.db.host,
      database: config.db.database,
      password: config.db.password,
      port: config.db.port,
      idleTimeoutMillis: 30000
    });
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  getPool(): Pool {
    return this.pool;
  }
}
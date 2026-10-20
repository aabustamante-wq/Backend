import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: mysql.Pool | undefined;

  async onModuleInit() {
    // Read variables checking both DB_HOST and DB_Host casing
    const host = (process.env.DB_HOST || process.env.DB_Host)?.trim();
    const rawPort = process.env.DB_PORT || process.env.DB_Port;
    const port = rawPort ? Number(rawPort) : undefined;
    const user = (process.env.DB_USER || process.env.DB_User)?.trim();
    const password = process.env.DB_PASSWORD || process.env.DB_Password;
    const database = (process.env.DB_NAME || process.env.DB_Name || 'defaultdb').trim();

    if (!host || !port || !user || !password) {
      throw new Error(
        'Missing database environment variables. Check Render Environment settings.',
      );
    }

    this.logger.log(`Connecting to database host: ${host}:${port}...`);

    this.pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    try {
      const connection = await this.pool.getConnection();
      this.logger.log('Successfully connected to Aiven MySQL database.');
      connection.release();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Database connection failed: ${message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  getPool(): mysql.Pool {
    if (!this.pool) {
      throw new Error('Database pool has not been initialized.');
    }

    return this.pool;
  }
}

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';

import * as mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;

  async onModuleInit(): Promise<void> {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 10580),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'defaultdb',

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,

      ssl: {
        ca: fs.readFileSync(
          path.join(process.cwd(), 'certs', 'ca.pem'),
          'utf8',
        ),
        rejectUnauthorized: true,
      },
    });

    try {
      await this.pool.query('SELECT 1');
      this.logger.log('MySQL connected successfully');
    } catch (error) {
      await this.pool.end();
      throw error;
    }
  }

  getPool(): Pool {
    return this.pool;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('MySQL connection closed');
    }
  }
}

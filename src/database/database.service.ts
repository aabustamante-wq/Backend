
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService
  implements OnModuleInit, OnModuleDestroy
{
  private pool: mysql.Pool;

  constructor() {
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME;
    const port = Number(process.env.DB_PORT || 3306);

    if (!host || !user || !password || !database) {
      throw new Error(
        'Missing database environment variables. Check Render Environment settings.',
      );
    }

    this.pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 15000,
      ssl: process.env.DB_SSL_CA
        ? {
            ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n'),
            rejectUnauthorized: true,
          }
        : { rejectUnauthorized: true },
    });
  }

  async onModuleInit() {
    try {
      await this.pool.query('SELECT 1');
      console.log('Connected to MySQL database successfully.');
    } catch (error) {
      console.error('MySQL connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  getPool(): mysql.Pool {
    return this.pool;
  }
}

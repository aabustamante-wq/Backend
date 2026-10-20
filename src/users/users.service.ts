import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // CREATE USER
  async createUser(
    username: string,
    password: string,
    role: string = 'user',
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await this.pool().execute(
      `INSERT INTO users (username, password, role)
       VALUES (?, ?, ?)`,
      [username, hashedPassword, role],
    );

    return result;
  }

  // FIND USER BY USERNAME
  async findByUsername(username: string) {
    const [rows] = await this.pool().execute(
      `SELECT id, username, password, role, refresh_token
       FROM users
       WHERE username = ?`,
      [username],
    );

    return (rows as any[])[0];
  }

  // FIND USER BY ID
  async findById(id: number) {
    const [rows] = await this.pool().execute(
      `SELECT id, username, role, created_at
       FROM users
       WHERE id = ?`,
      [id],
    );

    return (rows as any[])[0];
  }

  // GET ALL USERS
  async getAll() {
    const [rows] = await this.pool().execute(
      `SELECT id, username, role, created_at
       FROM users`,
    );

    return rows;
  }

  // UPDATE USER
  async updateUser(id: number, data: any) {
    const username = data.username;
    const role = data.role;

    const [result] = await this.pool().execute(
      `UPDATE users
       SET username = ?, role = ?
       WHERE id = ?`,
      [username, role, id],
    );

    return result;
  }

  // DELETE USER
  async deleteUser(id: number) {
    const [result] = await this.pool().execute(
      `DELETE FROM users WHERE id = ?`,
      [id],
    );

    return result;
  }

  // FIND USER BY REFRESH TOKEN
  async findByRefreshToken(refreshToken: string) {
    const [rows] = await this.pool().execute(
      `SELECT id, username, role
       FROM users
       WHERE refresh_token = ?`,
      [refreshToken],
    );

    return (rows as any[])[0];
  }

  // SET REFRESH TOKEN
  async setRefreshToken(
    id: number,
    refreshToken: any,
  ) {
    const [result] = await this.pool().execute(
      `UPDATE users
       SET refresh_token = ?
       WHERE id = ?`,
      [refreshToken, id],
    );

    return result;
  }
}
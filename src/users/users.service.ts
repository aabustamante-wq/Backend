import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  // GET all users
  async findAll() {
    const [rows]: any = await this.pool.query(
      'SELECT id, username, role, created_at FROM users',
    );
    return rows;
  }

  // Alias for backward compatibility
  async getAll() {
    return this.findAll();
  }

  // GET user by ID
  async findOne(id: number) {
    const [rows]: any = await this.pool.query(
      'SELECT id, username, role, created_at FROM users WHERE id = ?',
      [id],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return rows[0];
  }

  // Alias for backward compatibility
  async findById(id: number) {
    return this.findOne(id);
  }

  // FIND USER BY USERNAME
  async findByUsername(username: string) {
    const [rows]: any = await this.pool.query(
      `SELECT id, username, password, role, refresh_token
       FROM users
       WHERE username = ?`,
      [username],
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  // POST create user
  async create(data: any) {
    const { username, password, role = 'user' } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const [result]: any = await this.pool.execute(
        `INSERT INTO users (username, password, role)
         VALUES (?, ?, ?)`,
        [username, hashedPassword, role],
      );

      return {
        id: result.insertId,
        username,
        role,
      };
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new ConflictException(`Username '${username}' is already taken`);
      }
      throw error;
    }
  }

  // Alias supporting individual arguments or object payload
  async createUser(usernameOrData: any, password?: string, role: string = 'user') {
    if (typeof usernameOrData === 'object') {
      return this.create(usernameOrData);
    }
    return this.create({ username: usernameOrData, password, role });
  }

  // PUT update user
  async update(id: number, data: any) {
    const { username, role } = data;

    try {
      const [result]: any = await this.pool.execute(
        `UPDATE users
         SET username = ?, role = ?
         WHERE id = ?`,
        [username, role, id],
      );

      if (result.affectedRows === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return this.findOne(id);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new ConflictException(`Username '${username}' is already taken`);
      }
      throw error;
    }
  }

  // Alias for backward compatibility
  async updateUser(id: number, data: any) {
    return this.update(id, data);
  }

  // DELETE user
  async remove(id: number): Promise<boolean> {
    const [result]: any = await this.pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return true;
  }

  // Alias for backward compatibility
  async deleteUser(id: number): Promise<boolean> {
    return this.remove(id);
  }

  // FIND USER BY REFRESH TOKEN
  async findByRefreshToken(refreshToken: string) {
    const [rows]: any = await this.pool.query(
      `SELECT id, username, role
       FROM users
       WHERE refresh_token = ?`,
      [refreshToken],
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  // SET REFRESH TOKEN
  async setRefreshToken(id: number, refreshToken: any) {
    const [result]: any = await this.pool.execute(
      `UPDATE users
       SET refresh_token = ?
       WHERE id = ?`,
      [refreshToken, id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return result;
  }
}
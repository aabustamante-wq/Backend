import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RestaurantService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  // GET all restaurants
  async findAll() {
    const [rows] = await this.pool.query('SELECT * FROM restaurant');
    return rows;
  }

  // GET restaurant by ID
  async findOne(id: number) {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM restaurant WHERE restaurant_id = ?',
      [id],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return rows[0];
  }

  // POST create restaurant
  async create(data: any) {
    const {
      restaurant_name,
      restaurant_location,
      restaurant_phone,
      restaurant_opening_time,
      restaurant_closing_time,
    } = data;

    const [result]: any = await this.pool.execute(
      `INSERT INTO restaurant
      (
        restaurant_name,
        restaurant_location,
        restaurant_phone,
        restaurant_opening_time,
        restaurant_closing_time
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        restaurant_name,
        restaurant_location,
        restaurant_phone,
        restaurant_opening_time,
        restaurant_closing_time,
      ],
    );

    return {
      restaurant_id: result.insertId,
      ...data,
    };
  }

  // PUT update restaurant
  async update(id: number, data: any) {
    const {
      restaurant_name,
      restaurant_location,
      restaurant_phone,
      restaurant_opening_time,
      restaurant_closing_time,
    } = data;

    const [result]: any = await this.pool.execute(
      `UPDATE restaurant
       SET restaurant_name = ?,
           restaurant_location = ?,
           restaurant_phone = ?,
           restaurant_opening_time = ?,
           restaurant_closing_time = ?
       WHERE restaurant_id = ?`,
      [
        restaurant_name,
        restaurant_location,
        restaurant_phone,
        restaurant_opening_time,
        restaurant_closing_time,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return this.findOne(id);
  }

  // DELETE restaurant
  async remove(id: number): Promise<boolean> {
    const [result]: any = await this.pool.execute(
      'DELETE FROM restaurant WHERE restaurant_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return true;
  }
}
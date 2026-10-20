import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RestaurantService {
  constructor(private readonly db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async findAll() {
    const [rows] = await this.pool().query(
      'SELECT * FROM restaurant'
    );

    return rows;
  }

  async findOne(id: number) {
    const [rows] = await this.pool().query(
      'SELECT * FROM restaurant WHERE restaurant_id = ?',
      [id],
    );

    return rows;
  }

  async create(data: any) {
    const {
      restaurant_name,
      restaurant_location,
      restaurant_phone,
      restaurant_opening_time,
      restaurant_closing_time,
    } = data;

    const [result] = await this.pool().execute(
      `INSERT INTO restaurant
      (restaurant_name, restaurant_location, restaurant_phone, restaurant_opening_time, restaurant_closing_time)
      VALUES (?, ?, ?, ?, ?)`,
      [
        restaurant_name,
        restaurant_location,
        restaurant_phone,
        restaurant_opening_time,
        restaurant_closing_time,
      ],
    );

    return result;
  }

  async update(id: number, data: any) {
    const {
      restaurant_name,
      restaurant_location,
      restaurant_phone,
      restaurant_opening_time,
      restaurant_closing_time,
    } = data;

    const [result] = await this.pool().execute(
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

    return result;
  }

  async remove(id: number) {
    const [result] = await this.pool().execute(
      'DELETE FROM restaurant WHERE restaurant_id = ?',
      [id],
    );

    return result;
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FoodItemService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  // GET all food items
  async findAll() {
    const [rows] = await this.pool.query('SELECT * FROM FOOD_ITEM');
    return rows;
  }

  // GET food item by ID
  async findOne(id: number) {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM FOOD_ITEM WHERE food_id = ?',
      [id],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Food item with ID ${id} not found`);
    }

    return rows[0];
  }

  // POST create food item
  async create(data: any) {
    const {
      name,
      info,
      price,
      availability,
      restaurant_id,
    } = data;

    const [result]: any = await this.pool.execute(
      `INSERT INTO FOOD_ITEM
      (
        name,
        info,
        price,
        availability,
        restaurant_id
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        info,
        price,
        availability,
        restaurant_id,
      ],
    );

    return {
      food_id: result.insertId,
      ...data,
    };
  }

  // PUT update food item
  async update(id: number, data: any) {
    const {
      name,
      info,
      price,
      availability,
      restaurant_id,
    } = data;

    const [result]: any = await this.pool.execute(
      `UPDATE FOOD_ITEM
       SET name = ?,
           info = ?,
           price = ?,
           availability = ?,
           restaurant_id = ?
       WHERE food_id = ?`,
      [
        name,
        info,
        price,
        availability,
        restaurant_id,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Food item with ID ${id} not found`);
    }

    return this.findOne(id);
  }

  // DELETE food item
  async remove(id: number): Promise<boolean> {
    const [result]: any = await this.pool.execute(
      'DELETE FROM FOOD_ITEM WHERE food_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Food item with ID ${id} not found`);
    }

    return true;
  }
}
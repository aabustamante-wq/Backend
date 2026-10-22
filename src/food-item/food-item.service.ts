import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FoodItemService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  // GET all food items
  async findAll() {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM food_item',
    );

    return rows;
  }

  async getAll() {
    return this.findAll();
  }

  // GET food item by ID
  async findOne(id: number) {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM food_item WHERE food_id = ?',
      [id],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(
        `Food item with ID ${id} not found`,
      );
    }

    return rows[0];
  }

  async findById(id: number) {
    return this.findOne(id);
  }

  // POST create food item
  async create(data: any) {
    // Safely extract properties to prevent passing `undefined` to SQL queries
    const name = data.name ?? data.food_name ?? null;
    const info = data.info ?? data.food_info ?? null;
    const price = data.price ?? data.food_price ?? null;
    const availability = data.availability ?? data.food_availability ?? 1;
    const restaurant_id = data.restaurant_id ?? null;

    if (!restaurant_id) {
      throw new BadRequestException('restaurant_id is required');
    }

    try {
      const [result]: any = await this.pool.execute(
        `INSERT INTO food_item
          (name, info, price, availability, restaurant_id)
         VALUES (?, ?, ?, ?, ?)`,
        [name, info, price, availability, restaurant_id],
      );

      return {
        food_id: result.insertId,
        name,
        info,
        price,
        availability,
        restaurant_id,
      };
    } catch (error: any) {
      if (
        error.code === 'ER_NO_REFERENCED_ROW_2' ||
        error.errno === 1452
      ) {
        throw new BadRequestException(
          `Restaurant with ID ${restaurant_id} does not exist`,
        );
      }

      throw error;
    }
  }

  // PUT update food item
  async update(id: number, data: any) {
    const name = data.name ?? data.food_name ?? null;
    const info = data.info ?? data.food_info ?? null;
    const price = data.price ?? data.food_price ?? null;
    const availability = data.availability ?? data.food_availability ?? 1;
    const restaurant_id = data.restaurant_id ?? null;

    try {
      const [result]: any = await this.pool.execute(
        `UPDATE food_item
         SET name = ?,
             info = ?,
             price = ?,
             availability = ?,
             restaurant_id = ?
         WHERE food_id = ?`,
        [name, info, price, availability, restaurant_id, id],
      );

      if (result.affectedRows === 0) {
        await this.findOne(id);
      }

      return this.findOne(id);
    } catch (error: any) {
      if (
        error.code === 'ER_NO_REFERENCED_ROW_2' ||
        error.errno === 1452
      ) {
        throw new BadRequestException(
          `Restaurant with ID ${restaurant_id} does not exist`,
        );
      }

      throw error;
    }
  }

  async updateFoodItem(id: number, data: any) {
    return this.update(id, data);
  }

  // DELETE food item
  async remove(id: number): Promise<boolean> {
    const [result]: any = await this.pool.execute(
      'DELETE FROM food_item WHERE food_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(
        `Food item with ID ${id} not found`,
      );
    }

    return true;
  }

  async deleteFoodItem(id: number): Promise<boolean> {
    return this.remove(id);
  }
}
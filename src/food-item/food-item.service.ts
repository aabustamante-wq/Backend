
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

  // GET: All food items
  async findAll() {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM food_item',
    );
    return rows;
  }

  // GET: Food item by ID
  async findOne(id: number) {
    const [rows]: any = await this.pool.execute(
      'SELECT * FROM food_item WHERE food_id = ?',
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(
        `Food item ${id} not found`,
      );
    }

    return rows[0];
  }

  // POST: Create food item
  async create(data: any) {
    const {
      food_name,
      food_info,
      food_price,
      food_availability = 'Available',
      restaurant_id,
    } = data;

    if (
      !food_name ||
      !food_info ||
      food_price === undefined ||
      food_price === null ||
      food_price === ''
    ) {
      throw new BadRequestException(
        'Food name, information, and price are required',
      );
    }

    const price = Number(food_price);
    const restaurantId = Number(restaurant_id);

    if (!Number.isFinite(price) || price < 0) {
      throw new BadRequestException(
        'Food price must be a non-negative number',
      );
    }

    if (
      restaurant_id === undefined ||
      restaurant_id === null ||
      restaurant_id === '' ||
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0
    ) {
      throw new BadRequestException(
        'A valid restaurant_id is required',
      );
    }

    try {
      const [result]: any = await this.pool.execute(
        `INSERT INTO food_item
          (food_name, food_info, food_price,
           food_availability, restaurant_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          food_name,
          food_info,
          price,
          food_availability,
          restaurantId,
        ],
      );

      return this.findOne(result.insertId);
    } catch (error: any) {
      if (error.errno === 1452) {
        throw new BadRequestException(
          `Restaurant ${restaurantId} does not exist`,
        );
      }
      throw error;
    }
  }

  // PUT: Update food item
  async update(id: number, data: any) {
    await this.findOne(id);

    const {
      food_name,
      food_info,
      food_price,
      food_availability = 'Available',
      restaurant_id,
    } = data;

    if (
      !food_name ||
      !food_info ||
      food_price === undefined ||
      food_price === null ||
      food_price === ''
    ) {
      throw new BadRequestException(
        'Food name, information, and price are required',
      );
    }

    const price = Number(food_price);
    const restaurantId = Number(restaurant_id);

    if (!Number.isFinite(price) || price < 0) {
      throw new BadRequestException(
        'Food price must be a non-negative number',
      );
    }

    if (
      restaurant_id === undefined ||
      restaurant_id === null ||
      restaurant_id === '' ||
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0
    ) {
      throw new BadRequestException(
        'A valid restaurant_id is required',
      );
    }

    try {
      await this.pool.execute(
        `UPDATE food_item
         SET food_name = ?,
             food_info = ?,
             food_price = ?,
             food_availability = ?,
             restaurant_id = ?
         WHERE food_id = ?`,
        [
          food_name,
          food_info,
          price,
          food_availability,
          restaurantId,
          id,
        ],
      );

      return this.findOne(id);
    } catch (error: any) {
      if (error.errno === 1452) {
        throw new BadRequestException(
          `Restaurant ${restaurantId} does not exist`,
        );
      }
      throw error;
    }
  }

  // DELETE: Return true if successfully deleted
  async remove(id: number): Promise<boolean> {
    const [result]: any = await this.pool.execute(
      'DELETE FROM food_item WHERE food_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(
        `Food item ${id} not found`,
      );
    }

    return true;
  }
}

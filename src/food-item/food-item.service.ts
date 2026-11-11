import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FoodItemService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  /**
   * Normalizes input into database-compatible boolean/tinyint (1 / 0).
   * Change returned values to 'Available' / 'Unavailable' if your database column is VARCHAR.
   */
  private parseAvailability(availability: any): number {
    if (typeof availability === 'boolean') {
      return availability ? 1 : 0;
    }
    if (typeof availability === 'number') {
      return availability !== 0 ? 1 : 0;
    }
    if (typeof availability === 'string') {
      const normalized = availability.trim().toLowerCase();
      if (['available', 'true', '1'].includes(normalized)) {
        return 1;
      }
      if (['unavailable', 'false', '0'].includes(normalized)) {
        return 0;
      }
    }
    return 1; // Default fallback to 1 (available)
  }

  // GET: All food items
  async findAll() {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM food_item',
    );
    return rows;
  }

  // GET: Food item by ID
  async findOne(id: number | string) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new BadRequestException('Invalid food ID');
    }

    const [rows]: any = await this.pool.execute(
      'SELECT * FROM food_item WHERE food_id = ?',
      [numericId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Food item ${numericId} not found`);
    }

    return rows[0];
  }

  // POST: Create food item
  async create(data: any) {
    const {
      food_name,
      food_info,
      food_price,
      food_availability,
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

    const availability = this.parseAvailability(food_availability);

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
          availability,
          restaurantId,
        ],
      );

      return this.findOne(result.insertId);
    } catch (error: any) {
      this.handleDatabaseError(error, restaurantId);
    }
  }

  // PUT: Update food item
  async update(id: number | string, data: any) {
    const numericId = Number(id);
    await this.findOne(numericId);

    const {
      food_name,
      food_info,
      food_price,
      food_availability,
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

    const availability = this.parseAvailability(food_availability);

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
          availability,
          restaurantId,
          numericId,
        ],
      );

      return this.findOne(numericId);
    } catch (error: any) {
      this.handleDatabaseError(error, restaurantId);
    }
  }

  // DELETE: Return true if successfully deleted
  async remove(id: number | string): Promise<boolean> {
    const numericId = Number(id);
    const [result]: any = await this.pool.execute(
      'DELETE FROM food_item WHERE food_id = ?',
      [numericId],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Food item ${numericId} not found`);
    }

    return true;
  }

  // Centralized MySQL error handling
  private handleDatabaseError(error: any, restaurantId: number) {
    // Foreign Key constraint failure
    if (
      error.errno === 1452 ||
      error.code === 'ER_NO_REFERENCED_ROW_2' ||
      error.code === 'ER_NO_REFERENCED_ROW'
    ) {
      throw new BadRequestException(
        `Restaurant ${restaurantId} does not exist`,
      );
    }

    // Data truncation / incorrect integer type failure
    if (
      error.errno === 1366 ||
      error.errno === 1265 ||
      error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD'
    ) {
      throw new BadRequestException(
        `Invalid data format supplied for a database column.`,
      );
    }

    // Throw standard HTTP 500 with actual error message for debugging
    throw new InternalServerErrorException(
      error.message || 'Database execution failed',
    );
  }
}
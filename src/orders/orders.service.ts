import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  // GET all orders
  async findAll() {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM orders ORDER BY orders_id DESC',
    );
    return rows;
  }

  async getAll() {
    return this.findAll();
  }

  // GET order by ID
  async findOne(id: number | string) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new BadRequestException('Invalid order ID');
    }

    const [rows]: any = await this.pool.execute(
      'SELECT * FROM orders WHERE orders_id = ?',
      [numericId],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Order with ID ${numericId} not found`);
    }

    return rows[0];
  }

  async findById(id: number | string) {
    return this.findOne(id);
  }

  // POST create order
  async create(data: any) {
    // Tinatanggap pareho ang order_date / orders_date, total_amount / orders_total_amount
    const orders_date =
      data.orders_date ??
      data.order_date ??
      new Date().toISOString().slice(0, 10);

    const orders_total_amount = Number(
      data.orders_total_amount ?? data.total_amount ?? 0,
    );

    const orders_status =
      data.orders_status ?? data.order_status ?? 'Pending';

    const customer_id = data.customer_id ? Number(data.customer_id) : null;
    const restaurant_id = data.restaurant_id ? Number(data.restaurant_id) : null;

    if (!customer_id || !restaurant_id) {
      throw new BadRequestException(
        'Both customer_id and restaurant_id are required and cannot be null',
      );
    }

    if (isNaN(orders_total_amount) || orders_total_amount < 0) {
      throw new BadRequestException(
        'orders_total_amount must be a non-negative number',
      );
    }

    try {
      const [result]: any = await this.pool.execute(
        `INSERT INTO orders
          (orders_date, orders_status, orders_total_amount, customer_id, restaurant_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orders_date,
          orders_status,
          orders_total_amount,
          customer_id,
          restaurant_id,
        ],
      );

      return this.findOne(result.insertId);
    } catch (error: any) {
      this.handleDatabaseError(error, customer_id, restaurant_id);
    }
  }

  // PUT update order
  async update(id: number | string, data: any) {
    const numericId = Number(id);
    await this.findOne(numericId);

    const orders_date = data.orders_date ?? data.order_date ?? null;
    const orders_total_amount =
      data.orders_total_amount !== undefined || data.total_amount !== undefined
        ? Number(data.orders_total_amount ?? data.total_amount)
        : null;
    const orders_status = data.orders_status ?? data.order_status ?? null;
    const customer_id = data.customer_id ? Number(data.customer_id) : null;
    const restaurant_id = data.restaurant_id ? Number(data.restaurant_id) : null;

    try {
      await this.pool.execute(
        `UPDATE orders
         SET orders_date = COALESCE(?, orders_date),
             orders_status = COALESCE(?, orders_status),
             orders_total_amount = COALESCE(?, orders_total_amount),
             customer_id = COALESCE(?, customer_id),
             restaurant_id = COALESCE(?, restaurant_id)
         WHERE orders_id = ?`,
        [
          orders_date,
          orders_status,
          orders_total_amount,
          customer_id,
          restaurant_id,
          numericId,
        ],
      );

      return this.findOne(numericId);
    } catch (error: any) {
      this.handleDatabaseError(error, customer_id, restaurant_id);
    }
  }

  async updateOrder(id: number | string, data: any) {
    return this.update(id, data);
  }

  // DELETE order
  async remove(id: number | string): Promise<boolean> {
    const numericId = Number(id);
    const [result]: any = await this.pool.execute(
      'DELETE FROM orders WHERE orders_id = ?',
      [numericId],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Order with ID ${numericId} not found`);
    }

    return true;
  }

  async deleteOrder(id: number | string): Promise<boolean> {
    return this.remove(id);
  }

  // Centralized Error Handler para sa MySQL Exceptions
  private handleDatabaseError(error: any, customerId?: any, restaurantId?: any) {
    if (
      error.code === 'ER_NO_REFERENCED_ROW_2' ||
      error.code === 'ER_NO_REFERENCED_ROW' ||
      error.errno === 1452
    ) {
      throw new BadRequestException(
        `Referenced customer_id (${customerId}) or restaurant_id (${restaurantId}) does not exist in database`,
      );
    }

    if (error.code === 'ER_BAD_NULL_ERROR' || error.errno === 1048) {
      throw new BadRequestException(
        'Missing required fields. customer_id and restaurant_id cannot be null.',
      );
    }

    throw new InternalServerErrorException(
      error.message || 'Database operation failed',
    );
  }
}
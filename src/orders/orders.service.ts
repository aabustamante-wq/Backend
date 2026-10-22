import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
    const [rows]: any = await this.pool.query('SELECT * FROM orders');
    return rows;
  }

  async getAll() {
    return this.findAll();
  }

  // GET order by ID
  async findOne(id: number) {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM orders WHERE orders_id = ?',
      [id],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return rows[0];
  }

  async findById(id: number) {
    return this.findOne(id);
  }

  // POST create order
  async create(data: any) {
    // Convert undefined values to null or defaults to satisfy mysql2 driver requirements
    const order_date = data.order_date ?? new Date().toISOString().slice(0, 19).replace('T', ' ');
    const total_amount = data.total_amount ?? 0;
    const order_status = data.order_status ?? 'Pending';
    const customer_id = data.customer_id ?? null;
    const restaurant_id = data.restaurant_id ?? null;

    try {
      const [result]: any = await this.pool.execute(
        `INSERT INTO orders
          (order_date, total_amount, order_status, customer_id, restaurant_id)
         VALUES (?, ?, ?, ?, ?)`,
        [order_date, total_amount, order_status, customer_id, restaurant_id],
      );

      return {
        orders_id: result.insertId,
        order_date,
        total_amount,
        order_status,
        customer_id,
        restaurant_id,
      };
    } catch (error: any) {
      if (
        error.code === 'ER_NO_REFERENCED_ROW_2' ||
        error.errno === 1452
      ) {
        throw new BadRequestException(
          'Referenced customer_id or restaurant_id does not exist in database',
        );
      }
      throw error;
    }
  }

  // PUT update order
  async update(id: number, data: any) {
    const order_date = data.order_date ?? null;
    const total_amount = data.total_amount ?? null;
    const order_status = data.order_status ?? null;
    const customer_id = data.customer_id ?? null;
    const restaurant_id = data.restaurant_id ?? null;

    try {
      const [result]: any = await this.pool.execute(
        `UPDATE orders
         SET order_date = COALESCE(?, order_date),
             total_amount = COALESCE(?, total_amount),
             order_status = COALESCE(?, order_status),
             customer_id = COALESCE(?, customer_id),
             restaurant_id = COALESCE(?, restaurant_id)
         WHERE orders_id = ?`,
        [order_date, total_amount, order_status, customer_id, restaurant_id, id],
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
          'Referenced customer_id or restaurant_id does not exist in database',
        );
      }
      throw error;
    }
  }

  async updateOrder(id: number, data: any) {
    return this.update(id, data);
  }

  // DELETE order
  async remove(id: number): Promise<boolean> {
    const [result]: any = await this.pool.execute(
      'DELETE FROM orders WHERE orders_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return true;
  }

  async deleteOrder(id: number): Promise<boolean> {
    return this.remove(id);
  }
}
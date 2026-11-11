import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OrderItemService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  // GET all order items
  async findAll() {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM ORDER_ITEM ORDER BY order_item_id DESC',
    );
    return rows;
  }

  async getAll() {
    return this.findAll();
  }

  // GET order item by ID
  async findOne(id: number | string) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new BadRequestException('Invalid order item ID');
    }

    const [rows]: any = await this.pool.execute(
      'SELECT * FROM ORDER_ITEM WHERE order_item_id = ?',
      [numericId],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Order item with ID ${numericId} not found`);
    }

    return rows[0];
  }

  async findById(id: number | string) {
    return this.findOne(id);
  }

  // POST create order item
  async create(data: any) {
    const orders_id = data.orders_id ? Number(data.orders_id) : null;
    const food_id = data.food_id ? Number(data.food_id) : null;
    const order_quantity = Number(data.order_quantity ?? 1);
    const order_unit_price = Number(data.order_unit_price ?? 0);

    const order_subtotal =
      data.order_subtotal !== undefined
        ? Number(data.order_subtotal)
        : order_quantity * order_unit_price;

    if (!orders_id || !food_id) {
      throw new BadRequestException(
        'Both orders_id and food_id are required and cannot be null',
      );
    }

    if (isNaN(order_quantity) || order_quantity <= 0) {
      throw new BadRequestException('order_quantity must be a positive integer');
    }

    try {
      const [result]: any = await this.pool.execute(
        `INSERT INTO ORDER_ITEM
          (order_quantity, order_unit_price, order_subtotal, orders_id, food_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          order_quantity,
          order_unit_price,
          order_subtotal,
          orders_id,
          food_id,
        ],
      );

      return this.findOne(result.insertId);
    } catch (error: any) {
      this.handleDatabaseError(error, orders_id, food_id);
    }
  }

  // PUT update order item
  async update(id: number | string, data: any) {
    const numericId = Number(id);
    await this.findOne(numericId);

    const orders_id = data.orders_id ? Number(data.orders_id) : null;
    const food_id = data.food_id ? Number(data.food_id) : null;
    const order_quantity =
      data.order_quantity !== undefined ? Number(data.order_quantity) : null;
    const order_unit_price =
      data.order_unit_price !== undefined ? Number(data.order_unit_price) : null;
    const order_subtotal =
      data.order_subtotal !== undefined ? Number(data.order_subtotal) : null;

    try {
      await this.pool.execute(
        `UPDATE ORDER_ITEM
         SET order_quantity = COALESCE(?, order_quantity),
             order_unit_price = COALESCE(?, order_unit_price),
             order_subtotal = COALESCE(?, order_subtotal),
             orders_id = COALESCE(?, orders_id),
             food_id = COALESCE(?, food_id)
         WHERE order_item_id = ?`,
        [
          order_quantity,
          order_unit_price,
          order_subtotal,
          orders_id,
          food_id,
          numericId,
        ],
      );

      return this.findOne(numericId);
    } catch (error: any) {
      this.handleDatabaseError(error, orders_id, food_id);
    }
  }

  // DELETE order item
  async remove(id: number | string): Promise<boolean> {
    const numericId = Number(id);
    const [result]: any = await this.pool.execute(
      'DELETE FROM ORDER_ITEM WHERE order_item_id = ?',
      [numericId],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Order item with ID ${numericId} not found`);
    }

    return true;
  }

  // Centralized Error Handler for MySQL Exceptions
  private handleDatabaseError(error: any, ordersId?: any, foodId?: any) {
    if (
      error.code === 'ER_NO_REFERENCED_ROW_2' ||
      error.code === 'ER_NO_REFERENCED_ROW' ||
      error.errno === 1452
    ) {
      throw new BadRequestException(
        `Referenced orders_id (${ordersId}) or food_id (${foodId}) does not exist in database`,
      );
    }

    if (error.code === 'ER_NO_SUCH_TABLE' || error.errno === 1146) {
      throw new InternalServerErrorException(
        'Table ORDER_ITEM does not exist in database. Check table name casing.',
      );
    }

    if (error.code === 'ER_BAD_NULL_ERROR' || error.errno === 1048) {
      throw new BadRequestException(
        'Missing required fields. orders_id and food_id cannot be null.',
      );
    }

    throw new InternalServerErrorException(
      error.message || 'Database operation failed',
    );
  }
}
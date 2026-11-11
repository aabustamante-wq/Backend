import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
    const [rows]: any = await this.pool.query('SELECT * FROM order_item');
    return rows;
  }

  // GET order item by ID
  async findOne(id: number) {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM order_item WHERE order_item_id = ?',
      [id],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Order item with ID ${id} not found`);
    }

    return rows[0];
  }

  // POST create order item
  async create(data: any) {
    // Support both schema-defined keys and alternative request payload keys
    const orders_id = data.orders_id ?? data.order_id ?? null;
    const food_id = data.food_id ?? data.food_item_id ?? null;
    const order_quantity = data.order_quantity ?? data.quantity ?? 1;
    const order_unit_price = data.order_unit_price ?? data.price ?? 0;
    const order_subtotal =
      data.order_subtotal ??
      data.subtotal ??
      order_quantity * order_unit_price;

    try {
      const [result]: any = await this.pool.execute(
        `INSERT INTO order_item
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

      return {
        order_item_id: result.insertId,
        order_quantity,
        order_unit_price,
        order_subtotal,
        orders_id,
        food_id,
      };
    } catch (error: any) {
      if (
        error.code === 'ER_NO_REFERENCED_ROW_2' ||
        error.errno === 1452
      ) {
        throw new BadRequestException(
          `Invalid reference: orders_id (${orders_id}) or food_id (${food_id}) does not exist in the database`,
        );
      }
      throw error;
    }
  }

  // PUT update order item
  async update(id: number, data: any) {
    const orders_id = data.orders_id ?? data.order_id ?? null;
    const food_id = data.food_id ?? data.food_item_id ?? null;
    const order_quantity = data.order_quantity ?? data.quantity ?? null;
    const order_unit_price = data.order_unit_price ?? data.price ?? null;
    const order_subtotal =
      data.order_subtotal ??
      data.subtotal ??
      (order_quantity && order_unit_price
        ? order_quantity * order_unit_price
        : null);

    try {
      const [result]: any = await this.pool.execute(
        `UPDATE order_item
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
          id,
        ],
      );

      if (result.affectedRows === 0) {
        throw new NotFoundException(`Order item with ID ${id} not found`);
      }

      return this.findOne(id);
    } catch (error: any) {
      if (
        error.code === 'ER_NO_REFERENCED_ROW_2' ||
        error.errno === 1452
      ) {
        throw new BadRequestException(
          `Invalid reference: orders_id (${orders_id}) or food_id (${food_id}) does not exist in the database`,
        );
      }
      throw error;
    }
  }

  // DELETE order item
  async remove(id: number): Promise<boolean> {
    const [result]: any = await this.pool.execute(
      'DELETE FROM order_item WHERE order_item_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Order item with ID ${id} not found`);
    }

    return true;
  }
}
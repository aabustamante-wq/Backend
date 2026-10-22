import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OrderItemService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  // GET all order items
  async findAll() {
    const [rows] = await this.pool.query('SELECT * FROM order_item');
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
    const {
      quantity,
      price,
      orders_id,
      food_item_id,
    } = data;

    try {
      const [result]: any = await this.pool.execute(
        `INSERT INTO order_item
        (
          quantity,
          price,
          orders_id,
          food_item_id
        )
        VALUES (?, ?, ?, ?)`,
        [
          quantity,
          price,
          orders_id,
          food_item_id,
        ],
      );

      return {
        order_item_id: result.insertId,
        ...data,
      };
    } catch (error: any) {
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
        throw new BadRequestException(
          `Invalid reference: order ID ${orders_id} or food item ID ${food_item_id} does not exist`,
        );
      }
      throw error;
    }
  }

  // PUT update order item
  async update(id: number, data: any) {
    const {
      quantity,
      price,
      orders_id,
      food_item_id,
    } = data;

    try {
      const [result]: any = await this.pool.execute(
        `UPDATE order_item
         SET quantity = ?,
             price = ?,
             orders_id = ?,
             food_item_id = ?
         WHERE order_item_id = ?`,
        [
          quantity,
          price,
          orders_id,
          food_item_id,
          id,
        ],
      );

      if (result.affectedRows === 0) {
        throw new NotFoundException(`Order item with ID ${id} not found`);
      }

      return this.findOne(id);
    } catch (error: any) {
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
        throw new BadRequestException(
          `Invalid reference: order ID ${orders_id} or food item ID ${food_item_id} does not exist`,
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
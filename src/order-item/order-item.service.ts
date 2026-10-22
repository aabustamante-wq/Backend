import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OrderItemService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  // GET all order items
  async findAll() {
    const [rows] = await this.pool.query('SELECT * FROM ORDER_ITEM');
    return rows;
  }

  // GET order item by ID
  async findOne(id: number) {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM ORDER_ITEM WHERE order_item_id = ?',
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

    const [result]: any = await this.pool.execute(
      `INSERT INTO ORDER_ITEM
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
  }

  // PUT update order item
  async update(id: number, data: any) {
    const {
      quantity,
      price,
      orders_id,
      food_item_id,
    } = data;

    const [result]: any = await this.pool.execute(
      `UPDATE ORDER_ITEM
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
  }

  // DELETE order item
  async remove(id: number): Promise<boolean> {
    const [result]: any = await this.pool.execute(
      'DELETE FROM ORDER_ITEM WHERE order_item_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Order item with ID ${id} not found`);
    }

    return true;
  }
}
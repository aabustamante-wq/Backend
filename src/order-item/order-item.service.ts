
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

@Injectable()
export class OrderItemService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      'SELECT * FROM ORDER_ITEM',
    );
    return rows;
  }

  async findOne(id: number) {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      'SELECT * FROM ORDER_ITEM WHERE order_item_id = ?',
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Order item not found');
    }

    return rows[0];
  }

  async create(body: any) {
    const [result] = await this.db.getPool().execute<ResultSetHeader>(
      `INSERT INTO ORDER_ITEM
       (quantity, price, orders_id, food_item_id)
       VALUES (?, ?, ?, ?)`,
      [body.quantity, body.price, body.orders_id, body.food_item_id],
    );

    return {
      message: 'Order item created',
      order_item_id: result.insertId,
    };
  }

  async update(id: number, body: any) {
    await this.findOne(id);

    await this.db.getPool().execute<ResultSetHeader>(
      `UPDATE ORDER_ITEM
       SET quantity = ?, price = ?, orders_id = ?, food_item_id = ?
       WHERE order_item_id = ?`,
      [body.quantity, body.price, body.orders_id, body.food_item_id, id],
    );

    return { message: 'Order item updated' };
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.db.getPool().execute<ResultSetHeader>(
      'DELETE FROM ORDER_ITEM WHERE order_item_id = ?',
      [id],
    );

    return { message: 'Order item deleted' };
  }
}

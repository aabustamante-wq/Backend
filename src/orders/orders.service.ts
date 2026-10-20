
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      'SELECT * FROM orders',
    );
    return rows;
  }

  async findOne(id: number) {
    const [rows] = await this.db.getPool().execute<RowDataPacket[]>(
      'SELECT * FROM orders WHERE orders_id = ?',
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Order not found');
    }

    return rows[0];
  }

  async create(body: any) {
    const [result] = await this.db.getPool().execute<ResultSetHeader>(
      `INSERT INTO orders
       (orders_date, orders_status, orders_total_amount, customer_id, restaurant_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        body.orders_date,
        body.orders_status,
        body.orders_total_amount,
        body.customer_id,
        body.restaurant_id,
      ],
    );

    return {
      message: 'Order created',
      orders_id: result.insertId,
    };
  }

  async update(id: number, body: any) {
    await this.findOne(id);

    await this.db.getPool().execute<ResultSetHeader>(
      `UPDATE orders
       SET orders_date = ?, orders_status = ?,
           orders_total_amount = ?, customer_id = ?, restaurant_id = ?
       WHERE orders_id = ?`,
      [
        body.orders_date,
        body.orders_status,
        body.orders_total_amount,
        body.customer_id,
        body.restaurant_id,
        id,
      ],
    );

    return { message: 'Order updated' };
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.db.getPool().execute<ResultSetHeader>(
      'DELETE FROM orders WHERE orders_id = ?',
      [id],
    );

    return { message: 'Order deleted' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  // GET all orders
  async findAll() {
    const [rows] = await this.pool.query('SELECT * FROM orders');
    return rows;
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

  // POST create order
  async create(data: any) {
    const {
      orders_date,
      orders_status,
      orders_total_amount,
      customer_id,
      restaurant_id,
    } = data;

    const [result]: any = await this.pool.execute(
      `INSERT INTO orders
      (
        orders_date,
        orders_status,
        orders_total_amount,
        customer_id,
        restaurant_id
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        orders_date,
        orders_status,
        orders_total_amount,
        customer_id,
        restaurant_id,
      ],
    );

    return {
      orders_id: result.insertId,
      ...data,
    };
  }

  // PUT update order
  async update(id: number, data: any) {
    const {
      orders_date,
      orders_status,
      orders_total_amount,
      customer_id,
      restaurant_id,
    } = data;

    const [result]: any = await this.pool.execute(
      `UPDATE orders
       SET orders_date = ?,
           orders_status = ?,
           orders_total_amount = ?,
           customer_id = ?,
           restaurant_id = ?
       WHERE orders_id = ?`,
      [
        orders_date,
        orders_status,
        orders_total_amount,
        customer_id,
        restaurant_id,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.findOne(id);
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
}
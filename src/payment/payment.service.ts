import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PaymentService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  // GET all payments
  async findAll() {
    const [rows] = await this.pool.query('SELECT * FROM PAYMENT');
    return rows;
  }

  // GET payment by ID
  async findOne(id: number) {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM PAYMENT WHERE payment_id = ?',
      [id],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return rows[0];
  }

  // POST create payment
  async create(data: any) {
    const {
      payment_method,
      payment_date,
      payment_amount,
      payment_status,
      orders_id,
    } = data;

    const [result]: any = await this.pool.execute(
      `INSERT INTO PAYMENT
      (
        payment_method,
        payment_date,
        payment_amount,
        payment_status,
        orders_id
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        payment_method,
        payment_date,
        payment_amount,
        payment_status,
        orders_id,
      ],
    );

    return {
      payment_id: result.insertId,
      ...data,
    };
  }

  // PUT update payment
  async update(id: number, data: any) {
    const {
      payment_method,
      payment_date,
      payment_amount,
      payment_status,
      orders_id,
    } = data;

    const [result]: any = await this.pool.execute(
      `UPDATE PAYMENT
       SET payment_method = ?,
           payment_date = ?,
           payment_amount = ?,
           payment_status = ?,
           orders_id = ?
       WHERE payment_id = ?`,
      [
        payment_method,
        payment_date,
        payment_amount,
        payment_status,
        orders_id,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return this.findOne(id);
  }

  // DELETE payment
  async remove(id: number): Promise<boolean> {
    const [result]: any = await this.pool.execute(
      'DELETE FROM PAYMENT WHERE payment_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return true;
  }
}
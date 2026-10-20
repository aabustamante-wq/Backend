
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

@Injectable()
export class PaymentService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const [rows] = await this.db.getPool().execute(
      'SELECT * FROM PAYMENT',
    );
    return rows;
  }

  async findOne(id: number) {
    const [rows] = await this.db.getPool().execute(
      'SELECT * FROM PAYMENT WHERE payment_id = ?', [id],
    );
    const data = rows as RowDataPacket[];
    if (!data.length) throw new NotFoundException('Payment not found');
    return data[0];
  }

  async create(body: any) {
    const [result] = await this.db.getPool().execute(
      `INSERT INTO PAYMENT
       (payment_method, payment_date, payment_amount, payment_status, orders_id)
       VALUES (?, ?, ?, ?, ?)`,
      [body.payment_method, body.payment_date, body.payment_amount,
       body.payment_status, body.orders_id],
    );
    return {
      message: 'Payment created',
      payment_id: (result as ResultSetHeader).insertId,
    };
  }

  async update(id: number, body: any) {
    await this.findOne(id);
    await this.db.getPool().execute(
      `UPDATE PAYMENT SET payment_method=?, payment_date=?,
       payment_amount=?, payment_status=?, orders_id=?
       WHERE payment_id=?`,
      [body.payment_method, body.payment_date, body.payment_amount,
       body.payment_status, body.orders_id, id],
    );
    return { message: 'Payment updated' };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.getPool().execute(
      'DELETE FROM PAYMENT WHERE payment_id = ?', [id],
    );
    return { message: 'Payment deleted' };
  }
}

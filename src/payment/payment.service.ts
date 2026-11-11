import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PaymentService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  // GET all payments
  async findAll() {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM PAYMENT ORDER BY payment_id DESC',
    );
    return rows;
  }

  async getAll() {
    return this.findAll();
  }

  // GET payment by ID
  async findOne(id: number | string) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new BadRequestException('Invalid payment ID');
    }

    const [rows]: any = await this.pool.execute(
      'SELECT * FROM PAYMENT WHERE payment_id = ?',
      [numericId],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Payment with ID ${numericId} not found`);
    }

    return rows[0];
  }

  async findById(id: number | string) {
    return this.findOne(id);
  }

  // POST create payment
  async create(data: any) {
    const orders_id = data.orders_id ? Number(data.orders_id) : null;
    const payment_amount = Number(data.payment_amount ?? 0);
    const payment_method = data.payment_method ?? 'Cash';
    const payment_status = data.payment_status ?? 'Pending';
    const payment_date =
      data.payment_date ?? new Date().toISOString().slice(0, 10);

    if (!orders_id) {
      throw new BadRequestException('orders_id is required and cannot be null');
    }

    if (isNaN(payment_amount) || payment_amount <= 0) {
      throw new BadRequestException('payment_amount must be a positive number');
    }

    try {
      const [result]: any = await this.pool.execute(
        `INSERT INTO PAYMENT
          (payment_method, payment_date, payment_amount, payment_status, orders_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          payment_method,
          payment_date,
          payment_amount,
          payment_status,
          orders_id,
        ],
      );

      return this.findOne(result.insertId);
    } catch (error: any) {
      this.handleDatabaseError(error, orders_id);
    }
  }

  // PUT update payment
  async update(id: number | string, data: any) {
    const numericId = Number(id);
    await this.findOne(numericId);

    const orders_id = data.orders_id ? Number(data.orders_id) : null;
    const payment_amount =
      data.payment_amount !== undefined ? Number(data.payment_amount) : null;
    const payment_method = data.payment_method ?? null;
    const payment_status = data.payment_status ?? null;
    const payment_date = data.payment_date ?? null;

    try {
      await this.pool.execute(
        `UPDATE PAYMENT
         SET payment_method = COALESCE(?, payment_method),
             payment_date = COALESCE(?, payment_date),
             payment_amount = COALESCE(?, payment_amount),
             payment_status = COALESCE(?, payment_status),
             orders_id = COALESCE(?, orders_id)
         WHERE payment_id = ?`,
        [
          payment_method,
          payment_date,
          payment_amount,
          payment_status,
          orders_id,
          numericId,
        ],
      );

      return this.findOne(numericId);
    } catch (error: any) {
      this.handleDatabaseError(error, orders_id);
    }
  }

  // DELETE payment
  async remove(id: number | string): Promise<boolean> {
    const numericId = Number(id);
    const [result]: any = await this.pool.execute(
      'DELETE FROM PAYMENT WHERE payment_id = ?',
      [numericId],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Payment with ID ${numericId} not found`);
    }

    return true;
  }

  // Centralized Error Handler for MySQL Exceptions
  private handleDatabaseError(error: any, ordersId?: any) {
    if (
      error.code === 'ER_NO_REFERENCED_ROW_2' ||
      error.code === 'ER_NO_REFERENCED_ROW' ||
      error.errno === 1452
    ) {
      throw new BadRequestException(
        `Referenced orders_id (${ordersId}) does not exist in the database`,
      );
    }

    if (error.code === 'ER_NO_SUCH_TABLE' || error.errno === 1146) {
      throw new InternalServerErrorException(
        'Table PAYMENT does not exist in database.',
      );
    }

    if (error.code === 'ER_BAD_NULL_ERROR' || error.errno === 1048) {
      throw new BadRequestException(
        'Missing required fields. orders_id cannot be null.',
      );
    }

    throw new InternalServerErrorException(
      error.message || 'Database operation failed',
    );
  }
}
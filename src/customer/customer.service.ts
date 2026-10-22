import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CustomerService {
  constructor(private readonly db: DatabaseService) {}

  private get pool() {
    return this.db.getPool();
  }

  // GET all customers
  async findAll() {
    const [rows] = await this.pool.query('SELECT * FROM customer');
    return rows;
  }

  // GET customer by ID
  async findOne(id: number) {
    const [rows]: any = await this.pool.query(
      'SELECT * FROM customer WHERE customer_id = ?',
      [id],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return rows[0];
  }

  // POST create customer
  async create(data: any) {
    const {
      customer_firstname,
      customer_lastname,
      customer_email,
      customer_phone,
      customer_address,
    } = data;

    const [result]: any = await this.pool.execute(
      `INSERT INTO customer
      (
        customer_firstname,
        customer_lastname,
        customer_email,
        customer_phone,
        customer_address
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        customer_firstname,
        customer_lastname,
        customer_email,
        customer_phone,
        customer_address,
      ],
    );

    return {
      customer_id: result.insertId,
      ...data,
    };
  }

  // PUT update customer
  async update(id: number, data: any) {
    const {
      customer_firstname,
      customer_lastname,
      customer_email,
      customer_phone,
      customer_address,
    } = data;

    const [result]: any = await this.pool.execute(
      `UPDATE customer
       SET customer_firstname = ?,
           customer_lastname = ?,
           customer_email = ?,
           customer_phone = ?,
           customer_address = ?
       WHERE customer_id = ?`,
      [
        customer_firstname,
        customer_lastname,
        customer_email,
        customer_phone,
        customer_address,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return this.findOne(id);
  }

  // DELETE customer
  async remove(id: number): Promise<boolean> {
    const [result]: any = await this.pool.execute(
      'DELETE FROM customer WHERE customer_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return true;
  }
}
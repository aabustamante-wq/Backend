import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CustomerService {
  constructor(private readonly db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // GET all customers
  async findAll() {
    const [rows] = await this.pool().query(
      'SELECT * FROM customer'
    );

    return rows;
  }

  // GET customer by ID
  async findOne(id: number) {
    const [rows] = await this.pool().query(
      'SELECT * FROM customer WHERE customer_id = ?',
      [id]
    );

    return rows;
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

    const [result] = await this.pool().execute(
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
      ]
    );

    return result;
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

    const [result] = await this.pool().execute(
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
      ]
    );

    return result;
  }

  // DELETE customer
  async remove(id: number) {
    const [result] = await this.pool().execute(
      'DELETE FROM customer WHERE customer_id = ?',
      [id]
    );

    return result;
  }
}
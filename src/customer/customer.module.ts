import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  controllers: [CustomerController], // <--- Required for NestJS to register /customer routes
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {} // <--- Must have 'export' keyword
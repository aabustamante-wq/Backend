import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { DatabaseModule } from '../database/database.module'; // 1. Import DatabaseModule

@Module({
  imports: [DatabaseModule], // 2. Add to imports array
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
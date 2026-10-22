import { Controller, Delete, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    const result = await this.customerService.remove(id);
    return (
      typeof result === 'object' &&
      result !== null &&
      'affectedRows' in (result as object) &&
      Number((result as { affectedRows?: unknown }).affectedRows) > 0
    );
  }
}
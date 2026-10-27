
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FoodItemService } from './food-item.service';

@Controller('food-item')
export class FoodItemController {
  constructor(
    private readonly foodItemService: FoodItemService,
  ) {}

  @Get()
  findAll() {
    return this.foodItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.foodItemService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.foodItemService.create(data);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.foodItemService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.foodItemService.remove(id);
  }
}

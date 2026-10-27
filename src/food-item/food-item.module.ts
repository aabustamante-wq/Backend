
import { Module } from '@nestjs/common';
import { FoodItemController } from './food-item.controller';
import { FoodItemService } from './food-item.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FoodItemController],
  providers: [FoodItemService],
  exports: [FoodItemService],
})
export class FoodItemModule {}

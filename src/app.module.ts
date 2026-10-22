import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { FoodItemModule } from './food-item/food-item.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemModule } from './order-item/order-item.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    RestaurantModule,
    FoodItemModule,
    OrdersModule,
    OrderItemModule,
    PaymentModule,
  ],
})
export class AppModule {}
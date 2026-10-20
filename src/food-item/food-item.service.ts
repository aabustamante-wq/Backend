import { Injectable } from '@nestjs/common';

@Injectable()
export class FoodItemService {
  findAll() {
    return 'All food items';
  }

  findOne(id: number) {
    return `Food item ${id}`;
  }

  create(data: any) {
    return data;
  }

  update(id: number, data: any) {
    return { id, ...data };
  }

  remove(id: number) {
    return { message: `Food item ${id} deleted` };
  }
}
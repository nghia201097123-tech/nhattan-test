import { Expose } from 'class-transformer';

export class ActivityLog {
  @Expose({ name: 'restaurant_id' })
  restaurant_id: number = 0;

  @Expose({ name: 'restaurant_brand_id' })
  restaurant_brand_id: number = 0;

  @Expose({ name: 'branch_id' })
  branch_id: number = 0;

  @Expose({ name: 'act_employee_id' })
  act_employee_id: number = 0;

  @Expose({ name: 'act_employee_name' })
  act_employee_name: string = '';

  @Expose({ name: 'header' })
  header: string = '';

  @Expose({ name: 'full_name' })
  full_name: string = '';

  @Expose({ name: 'user_name' })
  user_name: string = '';

  @Expose({ name: 'object_id' })
  object_id: number | null = null;

  @Expose({ name: 'type' })
  type: number = 0;

  @Expose({ name: 'object_type' })
  object_type: number = 0;

  @Expose({ name: 'content' })
  content: string = '';

  @Expose({ name: 'json_data_before' })
  json_data_before: string = '';

  @Expose({ name: 'json_data_after' })
  json_data_after: string = '';

  @Expose({ name: 'time' })
  time: string;

  constructor() {
    this.time = this.getDatabaseTimeString(new Date());
  }

  private getDatabaseTimeString(date: Date): string {
    return date.toISOString();
  }
}

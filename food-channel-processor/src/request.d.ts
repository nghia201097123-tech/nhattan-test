// request.d.ts
import { EmployeeEntity } from './v1/employee/entity/employee.entity';

declare module 'express' {
  export interface Request {
    user?: EmployeeEntity;
  }
}

// request.d.ts
import { EmployeeEntity } from './v1/employee/entity/employee.entity.ts';

declare module 'express' {
  export interface Request {
    user?: any;
  }
}

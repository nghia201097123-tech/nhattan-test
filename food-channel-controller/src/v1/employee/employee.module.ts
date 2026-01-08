import { Module } from '@nestjs/common';
import { EmployeeEntity } from './entity/employee.entity';

@Module({     
            imports: [EmployeeEntity], 
            
            controllers: [],
            providers: [],
            exports : []
        }
    )
export class EmployeeModule {}

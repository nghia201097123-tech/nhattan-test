// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { Client, ClientGrpc } from '@nestjs/microservices';
// import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
// import { grpcClientJavaElasticSearch } from '../grpc/client/elastic-client-options';
// import { EmployeeServiceClient } from '../grpc/interfaces/employee';
// import { EmployeeEntity } from './entity/employee.entity';

// @Injectable()
// export class EmployeeService implements OnModuleInit{
//     @Client(grpcClientJavaElasticSearch)
//     private readonly grpcClientJavaElasticSearch: ClientGrpc;

//     private grpcJavaElasticSearchService: EmployeeServiceClient;

//     onModuleInit() {
//         this.grpcJavaElasticSearchService = this.grpcClientJavaElasticSearch.getService<EmployeeServiceClient>('EmployeeService');
//     }

//     async findById(user_id : number ): Promise<EmployeeEntity> {

//         let result = await lastValueFrom(this.grpcJavaElasticSearchService.findById(
//             {
//                 employee_id: user_id
//             }
//         ));
 
//         let data = new EmployeeEntity(result.data);

//         return data;
//     }

// }

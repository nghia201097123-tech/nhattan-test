// import { Inject, Injectable } from "@nestjs/common";
// import { ClientProxy } from "@nestjs/microservices";

// @Injectable()
// export class RmqClientService {
//   constructor(
//     @Inject("APP_FOOD_CHANNEL_QUEUE") private readonly client: ClientProxy
//   ) {}

//   async sendMessage(pattern: string, message: any) {    
//     return this.client.send(pattern, message).toPromise(); // Sử dụng `send()` và trả về Promise
//   }
// }

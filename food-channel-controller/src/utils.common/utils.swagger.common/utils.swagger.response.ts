import { ApiProperty } from "@nestjs/swagger";

export class SwaggerResponse<T> {
    @ApiProperty()
    status: number;
  
    @ApiProperty()
    message: string;
  
    data: T[];
  }
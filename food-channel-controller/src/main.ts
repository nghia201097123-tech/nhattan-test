import {
  HttpException,
  HttpStatus,
  LogLevel,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as os from "os";
import * as dotenv from 'dotenv';

import * as fs from 'fs';
import { AppModule } from "./app.module";
import { grpcServerOptions } from "./v4/grpc/server/grpc-server.options";
import { ExceptionResponseDetail } from "./utils.common/utils.exception.common/utils.exception.common";
import { MicroserviceOptions } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
const envConfig = dotenv.parse(fs.readFileSync(".env"));


async function bootstrap() {
  process.env.uv_threadpool_size = os.cpus().length.toString();
  const app = await NestFactory.create(AppModule, {
    logger: process.env.CONFIG_LOGGER_LEVEL.split(",").filter(
      (level: string): level is LogLevel => {
        return ["log", "error", "warn", "debug", "verbose"].includes(
          level as LogLevel
        );
      }
    ),
  });

  app.connectMicroservice<MicroserviceOptions>(grpcServerOptions);

  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle("HỆ THỐNG CHANNEL FOOD")
    .setDescription("HỆ THỐNG CHANNEL FOOD")
    .setVersion("version 2.0.0")
    .setBasePath("/doc")
    .addBearerAuth({
      description: `Truyền Basic_secret phù hợp`,
      name: "Authorization",
      type: "http",
      in: "Header",
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("doc", app, document);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.setGlobalPrefix("/api");

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        throw new HttpException(
          new ExceptionResponseDetail(
            HttpStatus.BAD_REQUEST,
            Object.values(validationErrors[0].constraints)[0]
          ),
          HttpStatus.OK
        );
      },
    })
  );

  app.enableCors();
  await app.listen(process.env.SERVICE_PORT, "0.0.0.0");

  let moment = require("moment-timezone");
  console.log(moment().tz("Asia/Ho_Chi_Minh").format());

  console.log(
    "Ho Chi Minh TimeZone:",
    moment().tz("Asia/Ho_Chi_Minh").format("DD-MM-YYYY HH:MM:SS")
  );

  if (["local","beta", "staging"].includes(process.env.CONFIG_ENV_MODE)) {
    for (const k in envConfig) {
    console.log(`${k}=${envConfig[k]}`);
  }
} 

  // console.log(`
  //   ==============================TECHRES CHANNEL FOOD CONTROLLER=============================
  //   CONFIG_KAFKA_HOST : ${process.env.CONFIG_KAFKA_HOST},
  //   CONFIG_KAFKA_PORT : ${process.env.CONFIG_KAFKA_PORT},

  //   CONFIG_GRPC_NODEJS_FOOD_CHANNEL_VALIDATOR_HOST : ${process.env.CONFIG_GRPC_NODEJS_FOOD_CHANNEL_VALIDATOR_HOST},
  //   CONFIG_GRPC_NODEJS_FOOD_CHANNEL_VALIDATOR_PORT : ${process.env.CONFIG_GRPC_NODEJS_FOOD_CHANNEL_VALIDATOR_PORT},

  //   CONFIG_GRPC_NODEJS_FOOD_CHANNEL_PROCESSOR_HOST : ${process.env.CONFIG_GRPC_NODEJS_FOOD_CHANNEL_PROCESSOR_HOST},
  //   CONFIG_GRPC_NODEJS_FOOD_CHANNEL_PROCESSOR_PORT : ${process.env.CONFIG_GRPC_NODEJS_FOOD_CHANNEL_PROCESSOR_PORT},

  //   CONFIG_GRPC_JAVA_NET_TECHRES_OAUTH_HOST : ${process.env.CONFIG_GRPC_JAVA_NET_TECHRES_OAUTH_HOST},
  //   CONFIG_GRPC_JAVA_NET_TECHRES_OAUTH_PORT : ${process.env.CONFIG_GRPC_JAVA_NET_TECHRES_OAUTH_PORT},

  //   ==============================TECHRES CHANNEL FOOD CONTROLLER==============================`);
  // console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();

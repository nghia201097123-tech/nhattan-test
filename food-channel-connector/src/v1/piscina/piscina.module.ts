import { Module } from "@nestjs/common";
import { PiscinaController } from "./piscina.controller";
import { PiscinaService } from "./piscina.service";
import { BullModule } from "@nestjs/bull";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "workerQueue",
    }),
  ],
  controllers: [PiscinaController],
  providers: [PiscinaService],
  exports: [PiscinaService],
})
export class PiscinaModule {}

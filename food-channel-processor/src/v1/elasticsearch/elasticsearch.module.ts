import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { CustomElasticsearchService } from "./elasticsearch.service";

@Module({
    imports: [
        ElasticsearchModule.register({
            node: `http://${process.env.CONFIG_ELASTICSEARCH_HOST}:${process.env.CONFIG_ELASTICSEARCH_PORT}`,
            auth: {
              username: process.env.CONFIG_ELASTICSEARCH_USERNAME,
              password: process.env.CONFIG_ELASTICSEARCH_PASSWORD,
            },
            maxRetries: 5,
            requestTimeout: 10000,
            // sniffOnStart: true
      }),
    ],
    providers: [CustomElasticsearchService],
    exports: [CustomElasticsearchService],
  })
  export class CustomElasticsearchModule {}
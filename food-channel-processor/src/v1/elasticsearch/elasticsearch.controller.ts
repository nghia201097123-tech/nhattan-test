// // src/elasticsearch/elasticsearch.controller.ts
// import { Controller, Get, Post, Body, Query } from '@nestjs/common';
// import { CustomElasticsearchService } from './elasticsearch.service';

// @Controller('elasticsearch')
// export class ElasticsearchController {
//   constructor(private readonly elasticsearchService: CustomElasticsearchService) {}

//   @Post('index')
//   async indexDocument(
//     @Body() body: { index: string; id: string; document: Record<string, any> }
//   ) {
//     const { index, id, document } = body;
//     return this.elasticsearchService.indexData(index, id, document);
//   }

//   @Get('search')
//   async searchDocument(
//     @Query('index') index: string,
//     @Query('field') field: string,
//     @Query('value') value: string
//   ) {
//     return this.elasticsearchService.search(index, field, value);
//   }

//   @Get('search-by-ids')
//     async searchByIds(
//     @Query('index') index: string,
//     @Query('ids') ids: string // ví dụ: "12114,12115,12116"
//     ) {
//     const idArray = ids.split(',').map((id) => id.trim());
//     return this.elasticsearchService.findByIds(index, idArray);
//     }
// }

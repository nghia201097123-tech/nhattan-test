// src/elasticsearch/elasticsearch.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class CustomElasticsearchService {
  private readonly logger = new Logger(CustomElasticsearchService.name);

  constructor(private readonly elasticsearchService: NestElasticsearchService) {}

  async indexData(index: string, id: string, document: Record<string, any>) {
    try {
      return await this.elasticsearchService.index({
        index,
        id,
        document,
      });
    } catch (error) {
      this.logger.error(`Error indexing document: ${error.message}`);
      throw error;
    }
  }

  async search(index: string, field: string, value: string) {
    try {
      const result = await this.elasticsearchService.search({
        index,
        query: {
          match: {
            [field]: value,
          },
        },
      });

      return result.hits.hits;
    } catch (error) {
      this.logger.error(`Error searching document: ${error.message}`);
      throw error;
    }
  }

  async findFoodsByIds(index: string, ids: number[]) : Promise<any[]>{      

    const result = await this.elasticsearchService.search({
      index,
      query: {
        terms: {
          id: ids,
        },
      },
      "_source": ["id", "is_allow_print_stamp"],
      size: 10000
    });
    
    return result.hits.hits.map((hit) => hit._source);
  }

  async findBranchFoodMapByFoodIds(index: string,branchId : number, foodIds: number[]) : Promise<any[]>{

    const result = await this.elasticsearchService.search({
      index,
      query: {
        bool: {
          must: [
            { match: { branch_id: branchId } },
            { terms: { food_id: foodIds } }
          ]
        }
      },
      _source: ["food_id", "restaurant_kitchen_place_id"],
      size: 10000
    });    
    
    return result.hits.hits.map((hit) => hit._source);
  }

  async findBranchById(index: string,branchId : number) : Promise<any>{

    const result = await this.elasticsearchService.search({
      index,
      query: {
        bool: {
          must: [
            { match: { id: branchId } },
          ]
        }
      },
      _source: ["id","restaurant_id", "restaurant_brand_id"],
    });    
    
    const hits = result.hits.hits;
    return hits.length > 0 ? hits[0]._source : null;  }
}

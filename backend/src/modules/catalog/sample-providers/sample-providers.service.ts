import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SampleProvider, ProviderType } from './entities/sample-provider.entity';
import { CreateSampleProviderDto } from './dto/create-sample-provider.dto';
import { UpdateSampleProviderDto } from './dto/update-sample-provider.dto';
import { QuerySampleProviderDto } from './dto/query-sample-provider.dto';
import { createPaginatedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class SampleProvidersService {
  constructor(
    @InjectRepository(SampleProvider)
    private readonly repository: Repository<SampleProvider>,
  ) {}

  async findAll(query: QuerySampleProviderDto) {
    const { page, limit, search, sortBy, sortOrder, type } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('provider');

    if (type) {
      queryBuilder.andWhere('provider.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere(
        '(provider.name ILIKE :search OR provider.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy(`provider.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  async findById(id: string): Promise<SampleProvider> {
    const provider = await this.repository.findOne({ where: { id } });

    if (!provider) {
      throw new NotFoundException('Sample provider not found');
    }

    return provider;
  }

  async create(dto: CreateSampleProviderDto, userId: string): Promise<SampleProvider> {
    const existing = await this.repository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException('Provider code already exists');
    }

    const provider = this.repository.create({
      ...dto,
      createdBy: userId,
    });

    return this.repository.save(provider);
  }

  async update(id: string, dto: UpdateSampleProviderDto): Promise<SampleProvider> {
    const provider = await this.findById(id);

    if (dto.code && dto.code !== provider.code) {
      const existing = await this.repository.findOne({ where: { code: dto.code } });
      if (existing) {
        throw new BadRequestException('Provider code already exists');
      }
    }

    Object.assign(provider, dto);
    return this.repository.save(provider);
  }

  async remove(id: string): Promise<void> {
    const provider = await this.findById(id);
    provider.isActive = false;
    await this.repository.save(provider);
  }
}

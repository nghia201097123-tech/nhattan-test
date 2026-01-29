import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Sample } from '../collection/entities/sample.entity';
import {
  SeedCardConfigDto,
  SeedCardDataDto,
} from './dto/seed-card.dto';

@Injectable()
export class SeedCardService {
  constructor(
    @InjectRepository(Sample)
    private readonly sampleRepository: Repository<Sample>,
  ) {}

  async getSampleForCard(sampleId: string): Promise<SeedCardDataDto> {
    const sample = await this.sampleRepository.findOne({
      where: { id: sampleId },
      relations: [
        'variety',
        'category',
        'location',
        'location.parent',
        'location.parent.parent',
        'provider',
        'currentWarehouse',
        'currentLocation',
      ],
    });

    if (!sample) {
      throw new NotFoundException(`Sample with ID ${sampleId} not found`);
    }

    return this.mapToCardData(sample);
  }

  async getSamplesForCards(sampleIds: string[]): Promise<SeedCardDataDto[]> {
    const samples = await this.sampleRepository.find({
      where: { id: In(sampleIds) },
      relations: [
        'variety',
        'category',
        'location',
        'location.parent',
        'location.parent.parent',
        'provider',
        'currentWarehouse',
        'currentLocation',
      ],
    });

    return samples.map((sample) => this.mapToCardData(sample));
  }

  async getCardPreview(sampleId: string, config: SeedCardConfigDto = {}) {
    const cardData = await this.getSampleForCard(sampleId);
    return {
      data: cardData,
      config: this.mergeWithDefaultConfig(config),
    };
  }

  async getCardsPreview(sampleIds: string[], config: SeedCardConfigDto = {}) {
    const cardsData = await this.getSamplesForCards(sampleIds);
    return {
      data: cardsData,
      config: this.mergeWithDefaultConfig(config),
    };
  }

  async generateQRCodeData(sampleId: string): Promise<string> {
    const sample = await this.sampleRepository.findOne({
      where: { id: sampleId },
      select: ['id', 'code', 'varietyName', 'categoryId'],
    });

    if (!sample) {
      throw new NotFoundException(`Sample with ID ${sampleId} not found`);
    }

    // Generate QR code data as JSON string
    const qrData = {
      id: sample.id,
      code: sample.code,
      type: 'SEED_SAMPLE',
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(qrData);
  }

  async getDefaultConfig(): Promise<SeedCardConfigDto> {
    return {
      showCode: true,
      showVarietyName: true,
      showCategory: true,
      showCollectionDate: true,
      showLocation: true,
      showProvider: true,
      showScientificName: false,
      showGerminationRate: true,
      showExpiryDate: true,
      showStorageLocation: false,
      showQRCode: true,
      qrCodeSize: 80,
      cardTitle: 'THẺ GIỐNG',
      cardWidth: 85,
      cardHeight: 54,
    };
  }

  async getSamplesForPrint(query: {
    search?: string;
    categoryId?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, categoryId, warehouseId, page = 1, limit = 20 } = query;

    const queryBuilder = this.sampleRepository
      .createQueryBuilder('sample')
      .leftJoinAndSelect('sample.variety', 'variety')
      .leftJoinAndSelect('sample.category', 'category')
      .leftJoinAndSelect('sample.location', 'location')
      .leftJoinAndSelect('sample.provider', 'provider')
      .leftJoinAndSelect('sample.currentWarehouse', 'currentWarehouse')
      .leftJoinAndSelect('sample.currentLocation', 'currentLocation');

    if (search) {
      queryBuilder.andWhere(
        '(sample.code ILIKE :search OR sample.varietyName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('sample.categoryId = :categoryId', { categoryId });
    }

    if (warehouseId) {
      queryBuilder.andWhere('sample.currentWarehouseId = :warehouseId', { warehouseId });
    }

    const skip = (page - 1) * limit;
    queryBuilder
      .orderBy('sample.code', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((sample) => this.mapToCardData(sample)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private mapToCardData(sample: Sample): SeedCardDataDto {
    // Build location string
    let locationStr = '';
    if (sample.location) {
      const parts = [];
      if (sample.location.parent?.parent?.name) {
        parts.push(sample.location.parent.parent.name);
      }
      if (sample.location.parent?.name) {
        parts.push(sample.location.parent.name);
      }
      if (sample.location.name) {
        parts.push(sample.location.name);
      }
      locationStr = parts.join(', ');
    }

    // Build storage location string
    let storageLocationStr = '';
    if (sample.currentWarehouse) {
      storageLocationStr = sample.currentWarehouse.name;
      if (sample.currentLocation) {
        storageLocationStr += ` - ${sample.currentLocation.name}`;
      }
    }

    // Generate QR code data
    const qrCodeData = JSON.stringify({
      id: sample.id,
      code: sample.code,
      type: 'SEED_SAMPLE',
    });

    return {
      id: sample.id,
      code: sample.code,
      varietyName: sample.varietyName || sample.variety?.name || '',
      categoryName: sample.category?.name || '',
      scientificName: sample.scientificName,
      collectionDate: sample.collectionDate,
      location: locationStr,
      providerName: sample.providerName || sample.provider?.name || '',
      germinationRate: sample.lastGerminationRate,
      expiryDate: sample.expiryDate,
      storageLocation: storageLocationStr,
      qrCodeData,
    };
  }

  private mergeWithDefaultConfig(config: SeedCardConfigDto): SeedCardConfigDto {
    return {
      showCode: config.showCode ?? true,
      showVarietyName: config.showVarietyName ?? true,
      showCategory: config.showCategory ?? true,
      showCollectionDate: config.showCollectionDate ?? true,
      showLocation: config.showLocation ?? true,
      showProvider: config.showProvider ?? true,
      showScientificName: config.showScientificName ?? false,
      showGerminationRate: config.showGerminationRate ?? true,
      showExpiryDate: config.showExpiryDate ?? true,
      showStorageLocation: config.showStorageLocation ?? false,
      showQRCode: config.showQRCode ?? true,
      qrCodeSize: config.qrCodeSize ?? 80,
      logoUrl: config.logoUrl,
      cardTitle: config.cardTitle ?? 'THẺ GIỐNG',
      cardWidth: config.cardWidth ?? 85,
      cardHeight: config.cardHeight ?? 54,
    };
  }
}

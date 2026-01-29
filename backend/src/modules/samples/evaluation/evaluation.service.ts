import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SampleEvaluation } from './entities/sample-evaluation.entity';
import { EvaluationResult } from './entities/evaluation-result.entity';
import { Sample } from '../collection/entities/sample.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { PaginationDto, createPaginatedResult } from '../../../common/dto/pagination.dto';
import { SampleStatus } from '../../../shared/constants/sample-status.constant';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(SampleEvaluation)
    private readonly repository: Repository<SampleEvaluation>,
    @InjectRepository(EvaluationResult)
    private readonly resultRepository: Repository<EvaluationResult>,
    @InjectRepository(Sample)
    private readonly sampleRepository: Repository<Sample>,
  ) {}

  async findAll(query: PaginationDto) {
    const { page, limit, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('evaluation')
      .leftJoinAndSelect('evaluation.sample', 'sample')
      .leftJoinAndSelect('evaluation.evaluator', 'evaluator');

    queryBuilder
      .orderBy(`evaluation.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  async getPendingEvaluations(): Promise<Sample[]> {
    // Get samples that need evaluation (IN_STORAGE and past next_evaluation_date)
    return this.sampleRepository
      .createQueryBuilder('sample')
      .leftJoinAndSelect('sample.category', 'category')
      .where('sample.status = :status', { status: SampleStatus.IN_STORAGE })
      .andWhere('sample.nextEvaluationDate <= :today', { today: new Date() })
      .orderBy('sample.nextEvaluationDate', 'ASC')
      .getMany();
  }

  async getBySampleId(sampleId: string): Promise<SampleEvaluation[]> {
    return this.repository.find({
      where: { sampleId },
      relations: ['evaluator', 'results'],
      order: { evaluationDate: 'DESC' },
    });
  }

  async findById(id: string): Promise<SampleEvaluation> {
    const evaluation = await this.repository.findOne({
      where: { id },
      relations: ['sample', 'evaluator', 'results'],
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }

    return evaluation;
  }

  async create(dto: CreateEvaluationDto, userId: string): Promise<SampleEvaluation> {
    const { results, ...evaluationData } = dto;

    const evaluation = this.repository.create({
      ...evaluationData,
      createdBy: userId,
    });

    const savedEvaluation = await this.repository.save(evaluation);

    // Save results
    if (results && results.length > 0) {
      const evaluationResults = results.map((r) =>
        this.resultRepository.create({
          ...r,
          evaluationId: savedEvaluation.id,
        }),
      );
      await this.resultRepository.save(evaluationResults);
    }

    // Update sample
    await this.sampleRepository.update(dto.sampleId, {
      lastEvaluationDate: dto.evaluationDate,
      lastGerminationRate: dto.germinationRate,
      status: SampleStatus.EVALUATED,
    });

    return this.findById(savedEvaluation.id);
  }

  async update(id: string, dto: UpdateEvaluationDto): Promise<SampleEvaluation> {
    const evaluation = await this.findById(id);
    Object.assign(evaluation, dto);
    return this.repository.save(evaluation);
  }

  async remove(id: string): Promise<void> {
    const evaluation = await this.findById(id);
    await this.resultRepository.delete({ evaluationId: id });
    await this.repository.remove(evaluation);
  }
}

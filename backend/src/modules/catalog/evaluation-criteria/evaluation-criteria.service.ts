import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationCriteria } from './entities/evaluation-criteria.entity';
import { EvaluationStage } from './entities/evaluation-stage.entity';
import { CriteriaScore } from './entities/criteria-score.entity';

@Injectable()
export class EvaluationCriteriaService {
  constructor(
    @InjectRepository(EvaluationCriteria)
    private criteriaRepository: Repository<EvaluationCriteria>,
    @InjectRepository(EvaluationStage)
    private stageRepository: Repository<EvaluationStage>,
    @InjectRepository(CriteriaScore)
    private scoreRepository: Repository<CriteriaScore>,
  ) {}

  // ========== STAGES ==========
  async findAllStages(): Promise<EvaluationStage[]> {
    return this.stageRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findStageById(id: string): Promise<EvaluationStage> {
    const stage = await this.stageRepository.findOne({
      where: { id },
      relations: ['criteria'],
    });
    if (!stage) throw new NotFoundException('Stage not found');
    return stage;
  }

  async createStage(data: Partial<EvaluationStage>): Promise<EvaluationStage> {
    const existing = await this.stageRepository.findOne({ where: { code: data.code } });
    if (existing) throw new BadRequestException('Stage code already exists');
    const stage = this.stageRepository.create(data);
    return this.stageRepository.save(stage);
  }

  async updateStage(id: string, data: Partial<EvaluationStage>): Promise<EvaluationStage> {
    const stage = await this.findStageById(id);
    Object.assign(stage, data);
    return this.stageRepository.save(stage);
  }

  async deleteStage(id: string): Promise<void> {
    const stage = await this.findStageById(id);
    const criteriaCount = await this.criteriaRepository.count({ where: { stageId: id } });
    if (criteriaCount > 0) {
      throw new BadRequestException('Cannot delete stage with criteria');
    }
    await this.stageRepository.remove(stage);
  }

  // ========== CRITERIA ==========
  async findAllCriteria(stageId?: string): Promise<EvaluationCriteria[]> {
    const where: any = {};
    if (stageId) where.stageId = stageId;
    return this.criteriaRepository.find({
      where,
      relations: ['stage', 'scores'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findCriteriaById(id: string): Promise<EvaluationCriteria> {
    const criteria = await this.criteriaRepository.findOne({
      where: { id },
      relations: ['stage', 'scores'],
    });
    if (!criteria) throw new NotFoundException('Criteria not found');
    return criteria;
  }

  async createCriteria(data: Partial<EvaluationCriteria>): Promise<EvaluationCriteria> {
    const existing = await this.criteriaRepository.findOne({ where: { code: data.code } });
    if (existing) throw new BadRequestException('Criteria code already exists');
    const criteria = this.criteriaRepository.create(data);
    return this.criteriaRepository.save(criteria);
  }

  async updateCriteria(id: string, data: Partial<EvaluationCriteria>): Promise<EvaluationCriteria> {
    const criteria = await this.findCriteriaById(id);
    Object.assign(criteria, data);
    return this.criteriaRepository.save(criteria);
  }

  async deleteCriteria(id: string): Promise<void> {
    const criteria = await this.findCriteriaById(id);
    await this.scoreRepository.delete({ criteriaId: id });
    await this.criteriaRepository.remove(criteria);
  }

  // ========== SCORES ==========
  async findScoresByCriteria(criteriaId: string): Promise<CriteriaScore[]> {
    return this.scoreRepository.find({
      where: { criteriaId },
      order: { sortOrder: 'ASC', minScore: 'ASC' },
    });
  }

  async createScore(data: Partial<CriteriaScore>): Promise<CriteriaScore> {
    const score = this.scoreRepository.create(data);
    return this.scoreRepository.save(score);
  }

  async updateScore(id: string, data: Partial<CriteriaScore>): Promise<CriteriaScore> {
    const score = await this.scoreRepository.findOne({ where: { id } });
    if (!score) throw new NotFoundException('Score not found');
    Object.assign(score, data);
    return this.scoreRepository.save(score);
  }

  async deleteScore(id: string): Promise<void> {
    await this.scoreRepository.delete(id);
  }

  async updateScoresByCriteria(criteriaId: string, scores: Partial<CriteriaScore>[]): Promise<CriteriaScore[]> {
    await this.scoreRepository.delete({ criteriaId });
    const newScores = scores.map((s, i) =>
      this.scoreRepository.create({ ...s, criteriaId, sortOrder: i })
    );
    return this.scoreRepository.save(newScores);
  }
}

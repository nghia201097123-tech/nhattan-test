import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EvaluationCriteriaService } from './evaluation-criteria.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Evaluation Criteria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/evaluation-criteria')
export class EvaluationCriteriaController {
  constructor(private readonly service: EvaluationCriteriaService) {}

  // ========== STAGES ==========
  @Get('stages')
  @ApiOperation({ summary: 'Get all evaluation stages' })
  async getAllStages() {
    return this.service.findAllStages();
  }

  @Get('stages/:id')
  @ApiOperation({ summary: 'Get stage by id' })
  async getStageById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findStageById(id);
  }

  @Post('stages')
  @ApiOperation({ summary: 'Create evaluation stage' })
  async createStage(@Body() data: any) {
    return this.service.createStage(data);
  }

  @Put('stages/:id')
  @ApiOperation({ summary: 'Update evaluation stage' })
  async updateStage(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) {
    return this.service.updateStage(id, data);
  }

  @Delete('stages/:id')
  @ApiOperation({ summary: 'Delete evaluation stage' })
  async deleteStage(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.deleteStage(id);
    return { message: 'Stage deleted successfully' };
  }

  // ========== CRITERIA ==========
  @Get()
  @ApiOperation({ summary: 'Get all criteria' })
  async getAllCriteria(@Query('stageId') stageId?: string) {
    return this.service.findAllCriteria(stageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get criteria by id' })
  async getCriteriaById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findCriteriaById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create criteria' })
  async createCriteria(@Body() data: any) {
    return this.service.createCriteria(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update criteria' })
  async updateCriteria(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) {
    return this.service.updateCriteria(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete criteria' })
  async deleteCriteria(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.deleteCriteria(id);
    return { message: 'Criteria deleted successfully' };
  }

  // ========== SCORES ==========
  @Get(':id/scores')
  @ApiOperation({ summary: 'Get scores by criteria' })
  async getScoresByCriteria(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findScoresByCriteria(id);
  }

  @Put(':id/scores')
  @ApiOperation({ summary: 'Update scores for criteria' })
  async updateScores(@Param('id', ParseUUIDPipe) id: string, @Body('scores') scores: any[]) {
    return this.service.updateScoresByCriteria(id, scores);
  }
}

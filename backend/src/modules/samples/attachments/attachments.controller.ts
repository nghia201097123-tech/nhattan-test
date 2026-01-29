import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Samples - Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('samples/:sampleId/attachments')
export class AttachmentsController {
  constructor(private readonly service: AttachmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get sample attachments' })
  async findAll(@Param('sampleId', ParseUUIDPipe) sampleId: string) {
    return this.service.findBySampleId(sampleId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        description: { type: 'string' },
      },
    },
  })
  async upload(
    @Param('sampleId', ParseUUIDPipe) sampleId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.upload(sampleId, file, userId);
  }

  @Delete(':attachmentId')
  @ApiOperation({ summary: 'Delete attachment' })
  async remove(
    @Param('sampleId', ParseUUIDPipe) sampleId: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ) {
    return this.service.remove(attachmentId);
  }
}

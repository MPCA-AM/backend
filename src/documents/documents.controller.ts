import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { DocumentsService } from './documents.service';

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Public()
  @Get('uas-request-form')
  @ApiProduces('application/pdf')
  async uasRequestForm(@Query('download') download: string | undefined, @Res() response: Response) {
    const { document, stream } = await this.documents.getUasRequestForm();
    const disposition = download === '1' ? 'attachment' : 'inline';
    response.setHeader('Content-Type', document.mimeType);
    response.setHeader('Content-Length', String(document.sizeBytes));
    response.setHeader('Content-Disposition', `${disposition}; filename="${document.fileName}"`);
    response.setHeader('Cache-Control', 'public, max-age=3600');
    stream.pipe(response);
  }
}

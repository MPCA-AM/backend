import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Repository } from 'typeorm';
import { DocumentEntity } from './document.entity';

const UAS_FORM_CODE = 'FORM-ACM-DRG-UAS-001';
const UAS_FORM_FILE = 'formulaire-demande-uas.pdf';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documents: Repository<DocumentEntity>,
  ) {}

  private get storagePath() {
    return join(process.cwd(), 'storage', 'documents', UAS_FORM_FILE);
  }

  async getUasRequestForm() {
    if (!existsSync(this.storagePath)) {
      throw new NotFoundException('Le formulaire UAS est absent du stockage du serveur.');
    }

    const file = statSync(this.storagePath);
    let document = await this.documents.findOneBy({ code: UAS_FORM_CODE });
    if (!document) {
      document = this.documents.create({
        code: UAS_FORM_CODE,
        title: 'Formulaire de demande d’autorisation temporaire d’exploitation UAS',
        fileName: UAS_FORM_FILE,
        mimeType: 'application/pdf',
        sizeBytes: file.size,
      });
    } else if (document.sizeBytes !== file.size) {
      document.sizeBytes = file.size;
    }
    document = await this.documents.save(document);

    return { document, stream: createReadStream(this.storagePath) };
  }
}

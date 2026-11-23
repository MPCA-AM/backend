import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Catalogue des documents réglementaires servis par l'API. */
@Entity({ name: 'documents' })
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column()
  fileName: string;

  @Column({ default: 'application/pdf' })
  mimeType: string;

  @Column({ type: 'bigint' })
  sizeBytes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

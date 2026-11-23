import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aerodrome } from './aerodrome.entity';
import { Piste } from './piste.entity';
import { CreateAerodromeDto } from './dto/create-aerodrome.dto';
import { CreatePisteDto } from './dto/create-piste.dto';

@Injectable()
export class AerodromesService {
  constructor(
    @InjectRepository(Aerodrome)
    private readonly aerodromeRepo: Repository<Aerodrome>,
    @InjectRepository(Piste)
    private readonly pisteRepo: Repository<Piste>,
  ) {}

  async findAll(): Promise<Aerodrome[]> {
    return this.aerodromeRepo.find({
      relations: { pistes: true },
      order: { nom: 'ASC' },
    });
  }

  async findById(id: string): Promise<Aerodrome> {
    const aerodrome = await this.aerodromeRepo.findOne({
      where: { id },
      relations: { pistes: true },
    });
    if (!aerodrome) {
      throw new NotFoundException(`Aérodrome ${id} introuvable`);
    }
    return aerodrome;
  }

  async create(dto: CreateAerodromeDto): Promise<Aerodrome> {
    const aerodrome = this.aerodromeRepo.create(dto);
    return this.aerodromeRepo.save(aerodrome);
  }

  async update(id: string, dto: Partial<CreateAerodromeDto>): Promise<Aerodrome> {
    await this.findById(id);
    await this.aerodromeRepo.update(id, dto);
    return this.findById(id);
  }

  async delete(id: string): Promise<{ message: string }> {
    const aerodrome = await this.findById(id);
    await this.aerodromeRepo.remove(aerodrome);
    return { message: 'Aérodrome supprimé avec succès' };
  }

  async addPiste(aerodromeId: string, dto: CreatePisteDto): Promise<Piste> {
    const aerodrome = await this.findById(aerodromeId);
    const piste = this.pisteRepo.create({
      ...dto,
      aerodrome,
    });
    return this.pisteRepo.save(piste);
  }

  async deletePiste(pisteId: string): Promise<{ message: string }> {
    const piste = await this.pisteRepo.findOne({ where: { id: pisteId } });
    if (!piste) {
      throw new NotFoundException(`Piste ${pisteId} introuvable`);
    }
    await this.pisteRepo.remove(piste);
    return { message: 'Piste supprimée avec succès' };
  }
}

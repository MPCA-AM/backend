import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aeronef, AeronefStatut } from './aeronef.entity';
import { CreateAeronefDto, UpdatePositionDto } from './dto/create-aeronef.dto';

@Injectable()
export class AeronefsService {
  constructor(
    @InjectRepository(Aeronef)
    private readonly aeronefRepo: Repository<Aeronef>,
  ) {}

  findAll(): Promise<Aeronef[]> {
    return this.aeronefRepo.find({ order: { immatriculation: 'ASC' } });
  }

  findEnVol(): Promise<Aeronef[]> {
    return this.aeronefRepo.find({
      where: { statut: AeronefStatut.EN_VOL },
      order: { updatedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Aeronef> {
    const plane = await this.aeronefRepo.findOne({ where: { id } });
    if (!plane) {
      throw new NotFoundException(`Aéronef ${id} introuvable`);
    }
    return plane;
  }

  create(dto: CreateAeronefDto): Promise<Aeronef> {
    const plane = this.aeronefRepo.create(dto);
    return this.aeronefRepo.save(plane);
  }

  async update(id: string, dto: Partial<CreateAeronefDto>): Promise<Aeronef> {
    await this.findById(id);
    await this.aeronefRepo.update(id, dto);
    return this.findById(id);
  }

  async updatePosition(id: string, dto: UpdatePositionDto): Promise<Aeronef> {
    await this.findById(id);
    await this.aeronefRepo.update(id, dto);
    return this.findById(id);
  }

  async delete(id: string): Promise<{ message: string }> {
    const plane = await this.findById(id);
    await this.aeronefRepo.remove(plane);
    return { message: 'Aéronef supprimé avec succès' };
  }
}

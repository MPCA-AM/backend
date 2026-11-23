import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aerodrome, AerodromeStatut } from '../aerodromes/aerodrome.entity';
import { Aeronef, AeronefStatut } from '../aeronefs/aeronef.entity';
import { User } from '../users/user.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Aerodrome)
    private readonly aerodromeRepo: Repository<Aerodrome>,
    @InjectRepository(Aeronef)
    private readonly aeronefRepo: Repository<Aeronef>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getPublicStats() {
    const totalAerodromes = await this.aerodromeRepo.count();
    const totalAeronefs = await this.aeronefRepo.count();
    const enVol = await this.aeronefRepo.count({
      where: { statut: AeronefStatut.EN_VOL },
    });

    return {
      aerodromes: totalAerodromes,
      aeronefs: totalAeronefs,
      enVol,
      regions: 22,
    };
  }

  async getDashboardStats() {
    const totalAerodromes = await this.aerodromeRepo.count();
    const activeAerodromes = await this.aerodromeRepo.count({
      where: { statut: AerodromeStatut.ACTIF },
    });
    const totalAeronefs = await this.aeronefRepo.count();
    const enVolAeronefs = await this.aeronefRepo.count({
      where: { statut: AeronefStatut.EN_VOL },
    });
    const totalUsers = await this.userRepo.count();

    const aeronefsByCategorie = await this.aeronefRepo
      .createQueryBuilder('a')
      .select('a.categorie', 'categorie')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.categorie')
      .getRawMany();

    const aerodromesByType = await this.aerodromeRepo
      .createQueryBuilder('apt')
      .select('apt.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('apt.type')
      .getRawMany();

    return {
      aerodromes: {
        total: totalAerodromes,
        actifs: activeAerodromes,
        parType: aerodromesByType,
      },
      aeronefs: {
        total: totalAeronefs,
        enVol: enVolAeronefs,
        parCategorie: aeronefsByCategorie,
      },
      users: {
        total: totalUsers,
      },
    };
  }
}

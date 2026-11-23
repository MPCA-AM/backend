import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(data: { email: string; password: string; nom?: string }): Promise<User> {
    const saved = await this.repo.save(this.repo.create(data));
    return (await this.findById(saved.id))!;
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByEmailWithPassword(email: string) {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  findByIdWithRefreshToken(id: string) {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id })
      .getOne();
  }

  findByValidResetToken(tokenHash: string) {
    return this.repo.findOne({
      where: { resetPasswordTokenHash: tokenHash, resetPasswordExpires: MoreThan(new Date()) },
    });
  }

  setRefreshTokenHash(id: string, hash: string | null) {
    return this.repo.update(id, { refreshTokenHash: hash });
  }

  setResetToken(id: string, tokenHash: string, expires: Date) {
    return this.repo.update(id, {
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: expires,
    });
  }

  /** Change le mot de passe, invalide le token de reset et la session (refresh token). */
  updatePassword(id: string, passwordHash: string) {
    return this.repo.update(id, {
      password: passwordHash,
      resetPasswordTokenHash: null,
      resetPasswordExpires: null,
      refreshTokenHash: null,
    });
  }

  async updateRole(id: string, role: Role) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    user.role = role;
    return this.repo.save(user);
  }

  async update(id: string, dto: UpdateUserDto, adminId: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (id === adminId && (dto.role !== undefined && dto.role !== Role.ADMIN || dto.isActive === false)) {
      throw new BadRequestException('Vous ne pouvez pas retirer vos propres droits administrateur ni désactiver votre compte');
    }

    if (dto.email && dto.email !== user.email) {
      if (await this.findByEmail(dto.email)) {
        throw new ConflictException('Cette adresse e-mail est déjà utilisée');
      }
      user.email = dto.email;
    }
    if (dto.nom !== undefined) user.nom = dto.nom.trim();
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    return this.repo.save(user);
  }

  async remove(id: string, adminId: string) {
    if (id === adminId) {
      throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte');
    }
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    await this.repo.remove(user);
    return { message: 'Utilisateur supprimé' };
  }
}

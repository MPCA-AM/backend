import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashSha256(valeur: string): string {
  return createHash('sha256').update(valeur).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existe = await this.usersService.findByEmail(dto.email);
    if (existe) {
      throw new ConflictException('Cette adresse e-mail est déjà utilisée');
    }

    const motDePasseHash = await argon2.hash(dto.password);
    const user = await this.usersService.create({
      email: dto.email,
      password: motDePasseHash,
      nom: dto.nom,
    });

    const tokens = await this.generateAndStoreTokens(user);
    return { user, ...tokens };
  }

  async validateUser(email: string, motDePasse: string): Promise<User | null> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || !user.isActive) {
      return null;
    }

    const correspond = await argon2.verify(user.password, motDePasse);
    if (!correspond) {
      return null;
    }

    const { password, ...utilisateurSansMotDePasse } = user;
    return utilisateurSansMotDePasse as User;
  }

  async login(user: User) {
    const tokens = await this.generateAndStoreTokens(user);
    return { user, ...tokens };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersService.findByIdWithRefreshToken(userId);
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new ForbiddenException('Accès refusé');
    }

    const valide = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!valide) {
      throw new ForbiddenException('Accès refusé');
    }

    return this.generateAndStoreTokens(user);
  }

  async logout(userId: string) {
    await this.usersService.setRefreshTokenHash(userId, null);
    return { message: 'Déconnexion réussie' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && user.isActive) {
      const token = randomBytes(32).toString('hex');
      const hash = hashSha256(token);
      const expiration = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await this.usersService.setResetToken(user.id, hash, expiration);
      await this.mailService.sendPasswordReset(user.email, token);
    }
    return { message: 'Si un compte existe pour cette adresse, un e-mail a été envoyé.' };
  }

  async resetPassword(token: string, nouveauMotDePasse: string) {
    const hash = hashSha256(token);
    const user = await this.usersService.findByValidResetToken(hash);
    if (!user) {
      throw new BadRequestException('Lien invalide ou expiré');
    }

    const passwordHash = await argon2.hash(nouveauMotDePasse);
    await this.usersService.updatePassword(user.id, passwordHash);
    return { message: 'Mot de passe modifié avec succès' };
  }

  private async generateAndStoreTokens(user: Pick<User, 'id' | 'email' | 'role'>) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const accessExpires = this.config.get('JWT_ACCESS_EXPIRES', '15m');

    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    const refreshExpires = this.config.get('JWT_REFRESH_EXPIRES', '7d');

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpires as JwtSignOptions['expiresIn'],
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpires as JwtSignOptions['expiresIn'],
    });

    const refreshHash = await argon2.hash(refreshToken);
    await this.usersService.setRefreshTokenHash(user.id, refreshHash);

    return { accessToken, refreshToken };
  }
}
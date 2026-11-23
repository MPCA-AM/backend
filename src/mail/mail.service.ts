import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    const port = Number(this.config.get('MAIL_PORT', 587));
    const user = this.config.get<string>('MAIL_USER');
    this.transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST'),
      port,
      secure: port === 465,
      auth: user ? { user, pass: this.config.get('MAIL_PASSWORD') } : undefined,
    });
  }

  async sendPasswordReset(to: string, token: string) {
    const link = `${this.config.get('FRONTEND_URL')}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: this.config.get('MAIL_FROM'),
      to,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p><a href="${link}">Cliquez ici pour choisir un nouveau mot de passe</a></p>
        <p>Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>`,
    });
  }
}
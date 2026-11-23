import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { StatsService } from './stats.service';

@ApiTags('Statistiques')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Public()
  @Get('public')
  getPublic() {
    return this.statsService.getPublicStats();
  }

  @ApiBearerAuth()
  @Roles(Role.EDITEUR, Role.ADMIN)
  @Get('dashboard')
  getDashboard() {
    return this.statsService.getDashboardStats();
  }
}

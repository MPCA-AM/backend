import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AeronefsService } from './aeronefs.service';
import { CreateAeronefDto, UpdatePositionDto } from './dto/create-aeronef.dto';

@ApiTags('Aéronefs')
@Controller('aeronefs')
export class AeronefsController {
  constructor(private readonly aeronefsService: AeronefsService) {}

  @Public()
  @Get()
  findAll() {
    return this.aeronefsService.findAll();
  }

  @Public()
  @Get('en-vol')
  findEnVol() {
    return this.aeronefsService.findEnVol();
  }

  @Public()
  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.aeronefsService.findById(id);
  }

  @ApiBearerAuth()
  @Roles(Role.EDITEUR, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateAeronefDto) {
    return this.aeronefsService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.EDITEUR, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateAeronefDto>,
  ) {
    return this.aeronefsService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.EDITEUR, Role.ADMIN)
  @Patch(':id/position')
  updatePosition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.aeronefsService.updatePosition(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.aeronefsService.delete(id);
  }
}

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
import { AerodromesService } from './aerodromes.service';
import { CreateAerodromeDto } from './dto/create-aerodrome.dto';
import { CreatePisteDto } from './dto/create-piste.dto';

@ApiTags('Aérodromes')
@Controller('aerodromes')
export class AerodromesController {
  constructor(private readonly aerodromesService: AerodromesService) {}

  @Public()
  @Get()
  findAll() {
    return this.aerodromesService.findAll();
  }

  @Public()
  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.aerodromesService.findById(id);
  }

  @ApiBearerAuth()
  @Roles(Role.EDITEUR, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateAerodromeDto) {
    return this.aerodromesService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.EDITEUR, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateAerodromeDto>,
  ) {
    return this.aerodromesService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.aerodromesService.delete(id);
  }

  @ApiBearerAuth()
  @Roles(Role.EDITEUR, Role.ADMIN)
  @Post(':id/pistes')
  addPiste(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePisteDto,
  ) {
    return this.aerodromesService.addPiste(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete('pistes/:pisteId')
  deletePiste(@Param('pisteId', ParseUUIDPipe) pisteId: string) {
    return this.aerodromesService.deletePiste(pisteId);
  }
}

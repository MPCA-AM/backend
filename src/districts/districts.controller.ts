import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { DistrictsService } from './districts.service';

@ApiTags('Districts')
@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Public()
  @Get()
  findAll() {
    return this.districtsService.findAll();
  }
}

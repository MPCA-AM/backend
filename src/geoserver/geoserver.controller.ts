import { BadRequestException, Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GeoserverService } from './geoserver.service';

@ApiTags('GeoServer')
@ApiBearerAuth()
@Controller('geoserver')
export class GeoserverController {
  constructor(private readonly geoserverService: GeoserverService) {}

  @Post('shapefiles')
  @Roles(Role.ADMIN, Role.EDITEUR)
  @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: 50 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Archive .zip OU les 4 fichiers Shapefile (.shp, .shx, .dbf, .prj)',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archive .zip (compatibilité)',
        },
        layerName: {
          type: 'string',
        },
      },
    },
  })
  uploadShapefile(
    @UploadedFiles()
    files: Array<{ originalname: string; buffer: Buffer }> = [],
    @Body('layerName') layerName?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'Veuillez sélectionner une archive .zip ou les 4 fichiers Shapefile (.shp, .shx, .dbf, .prj).',
      );
    }
    return this.geoserverService.publishShapefile(files, layerName);
  }
}


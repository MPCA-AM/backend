import { BadRequestException } from '@nestjs/common';

jest.mock('@nestjs/config', () => ({
  ConfigService: class MockConfigService {
    get = jest.fn((key: string, defaultVal?: string) => defaultVal || 'mock');
    getOrThrow = jest.fn(() => 'mock');
  },
}));

import { GeoserverController } from './geoserver.controller';
import { GeoserverService } from './geoserver.service';

describe('GeoserverController & GeoserverService Shapefile Validation', () => {
  let controller: GeoserverController;
  let service: GeoserverService;

  beforeEach(() => {
    const mockConfig = {
      get: jest.fn((key: string, defaultVal?: string) => defaultVal || 'mock'),
      getOrThrow: jest.fn(() => 'mock'),
    } as any;

    service = new GeoserverService(mockConfig);
    controller = new GeoserverController(service);
  });

  it('should throw BadRequestException when no files are uploaded', () => {
    expect(() => controller.uploadShapefile([])).toThrow(BadRequestException);
  });

  it('should throw BadRequestException when direct shapefile misses required companion files', async () => {
    const incompleteFiles = [
      { originalname: 'zones.shp', buffer: Buffer.from('mock-shp') },
      { originalname: 'zones.dbf', buffer: Buffer.from('mock-dbf') },
    ];

    await expect(service.publishShapefile(incompleteFiles)).rejects.toThrow(
      /Les 4 fichiers \(\.shp, \.shx, \.dbf, \.prj\) sont obligatoires pour un import direct\. Fichier\(s\) manquant\(s\) : \.shx, \.prj/
    );
  });

  it('should throw BadRequestException when direct shapefile misses only .prj', async () => {
    const missingPrj = [
      { originalname: 'zones.shp', buffer: Buffer.from('mock-shp') },
      { originalname: 'zones.shx', buffer: Buffer.from('mock-shx') },
      { originalname: 'zones.dbf', buffer: Buffer.from('mock-dbf') },
    ];

    await expect(service.publishShapefile(missingPrj)).rejects.toThrow(
      /Les 4 fichiers \(\.shp, \.shx, \.dbf, \.prj\) sont obligatoires pour un import direct\. Fichier\(s\) manquant\(s\) : \.prj/
    );
  });

  it('should throw BadRequestException when direct shapefile has mismatched base names', async () => {
    const mismatchedFiles = [
      { originalname: 'zones.shp', buffer: Buffer.from('mock-shp') },
      { originalname: 'routes.shx', buffer: Buffer.from('mock-shx') },
      { originalname: 'zones.dbf', buffer: Buffer.from('mock-dbf') },
      { originalname: 'zones.prj', buffer: Buffer.from('mock-prj') },
    ];

    await expect(service.publishShapefile(mismatchedFiles)).rejects.toThrow(
      /Les 4 fichiers \(\.shp, \.shx, \.dbf, \.prj\) doivent avoir le même nom de base/
    );
  });
});

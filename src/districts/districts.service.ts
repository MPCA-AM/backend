import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type DistrictMapFeature = {
  id: string;
  district: string;
  region: string | null;
  geometry: { coordinates?: unknown } | null;
};

@Injectable()
export class DistrictsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<DistrictMapFeature[]> {
    return this.dataSource.query(`
      SELECT
        gid::text AS id,
        district,
        region,
        ST_AsGeoJSON(geom)::json AS geometry
      FROM district
      WHERE geom IS NOT NULL
      ORDER BY district, region
    `) as Promise<DistrictMapFeature[]>;
  }
}

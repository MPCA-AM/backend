import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile, spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

@Injectable()
export class GeoserverService {
  constructor(private readonly config: ConfigService) {}

  async publishShapefile(
    filesInput:
      | { originalname: string; buffer: Buffer }
      | Array<{ originalname: string; buffer: Buffer }>,
    requestedLayerName?: string,
  ) {
    const files = Array.isArray(filesInput) ? filesInput : [filesInput];
    if (!files.length) {
      throw new BadRequestException('Aucun fichier fourni.');
    }

    const isZip = files.length === 1 && /\.zip$/i.test(files[0].originalname);

    const temporaryDirectory = await fs.mkdtemp(join(tmpdir(), 'aviation-shp-'));
    try {
      let shapefilePath: string;
      let defaultLayerName: string;

      if (isZip) {
        const file = files[0];
        if (!file?.buffer?.length || !file.buffer.subarray(0, 2).equals(Buffer.from('PK'))) {
          throw new BadRequestException('Le fichier doit être une archive Shapefile .zip valide.');
        }

        defaultLayerName = file.originalname.replace(/\.zip$/i, '');
        const archivePath = join(temporaryDirectory, 'upload.zip');
        const extractedDirectory = join(temporaryDirectory, 'extracted');
        await fs.mkdir(extractedDirectory);
        await fs.writeFile(archivePath, file.buffer);
        await execFileAsync('powershell.exe', [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          `Expand-Archive -LiteralPath '${archivePath.replace(/'/g, "''")}' -DestinationPath '${extractedDirectory.replace(/'/g, "''")}' -Force`,
        ]);
        const found = await this.findShapefile(extractedDirectory);
        if (!found) throw new BadRequestException('L’archive ne contient aucun fichier .shp.');
        shapefilePath = found;
      } else {
        // Mode fichiers directs : les 4 fichiers .shp, .shx, .dbf, .prj sont obligatoires
        const requiredExts = ['shp', 'shx', 'dbf', 'prj'] as const;
        type ReqExt = (typeof requiredExts)[number];

        const filesByExt = new Map<ReqExt, { originalname: string; buffer: Buffer }>();
        const otherFiles: Array<{ ext: string; originalname: string; buffer: Buffer }> = [];

        for (const f of files) {
          const match = f.originalname.match(/\.([a-zA-Z0-9]+)$/);
          const ext = (match ? match[1] : '').toLowerCase();
          if (requiredExts.includes(ext as ReqExt)) {
            filesByExt.set(ext as ReqExt, f);
          } else if (ext) {
            otherFiles.push({ ext, originalname: f.originalname, buffer: f.buffer });
          }
        }

        const missing = requiredExts.filter((ext) => !filesByExt.has(ext));
        if (missing.length > 0) {
          throw new BadRequestException(
            `Les 4 fichiers (.shp, .shx, .dbf, .prj) sont obligatoires pour un import direct. Fichier(s) manquant(s) : ${missing.map((e) => '.' + e).join(', ')}`,
          );
        }

        // Vérifier la cohérence des noms de base
        const getBase = (name: string, ext: string) =>
          name.replace(new RegExp(`\\.${ext}$`, 'i'), '').trim().toLowerCase();

        const shpBase = getBase(filesByExt.get('shp')!.originalname, 'shp');
        const differing = requiredExts.filter(
          (ext) => getBase(filesByExt.get(ext)!.originalname, ext) !== shpBase,
        );

        if (differing.length > 0) {
          throw new BadRequestException(
            `Les 4 fichiers (.shp, .shx, .dbf, .prj) doivent avoir le même nom de base. Noms discordants détectés pour : ${differing.map((e) => '.' + e).join(', ')}`,
          );
        }

        defaultLayerName = filesByExt.get('shp')!.originalname.replace(/\.shp$/i, '');

        // Écrire les 4 fichiers avec un nom sécurisé et homogène
        const safeBase = 'shapefile_import';
        for (const ext of requiredExts) {
          const item = filesByExt.get(ext)!;
          await fs.writeFile(join(temporaryDirectory, `${safeBase}.${ext}`), item.buffer);
        }

        // Copier les éventuels fichiers annexes (ex: .cpg)
        for (const item of otherFiles) {
          await fs.writeFile(join(temporaryDirectory, `${safeBase}.${item.ext}`), item.buffer);
        }

        shapefilePath = join(temporaryDirectory, `${safeBase}.shp`);
      }

      const sourceName = requestedLayerName?.trim() || defaultLayerName;
      const layerName = sourceName
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '_')
        .replace(/^_+|_+$/g, '');

      if (!layerName) {
        throw new BadRequestException('Le nom de la couche est invalide.');
      }

      await this.importIntoPostgis(shapefilePath, layerName);
      await this.publishPostgisTable(layerName);

      const baseUrl = this.geoserverUrl;
      const workspace = this.workspace;
      const qualifiedName = `${workspace}:${layerName}`;
      return {
        message: `Couche ${qualifiedName} importée dans PostGIS et publiée avec succès.`,
        name: qualifiedName,
        title: layerName.replaceAll('_', ' '),
        wmsUrl: `${baseUrl}/${workspace}/wms`,
        wfsUrl: `${baseUrl}/${workspace}/ows?service=WFS&request=GetFeature&typeName=${encodeURIComponent(qualifiedName)}&outputFormat=application/json`,
      };
    } finally {
      await fs.rm(temporaryDirectory, { recursive: true, force: true });
    }
  }

  private get workspace() { return this.config.get<string>('GEOSERVER_WORKSPACE') || 'Aviation'; }
  private get geoserverUrl() { return (this.config.get<string>('GEOSERVER_URL') || 'http://localhost:8080/geoserver').replace(/\/$/, ''); }
  private get datastore() { return this.config.get<string>('GEOSERVER_DATASTORE') || 'aviation_madagascar'; }

  private async findShapefile(directory: string): Promise<string | null> {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        const found = await this.findShapefile(path);
        if (found) return found;
      } else if (/\.shp$/i.test(entry.name)) return path;
    }
    return null;
  }

  private async importIntoPostgis(shapefile: string, layerName: string) {
    const host = this.config.get<string>('DB_HOST', 'localhost');
    const port = this.config.get<string>('DB_PORT', '5432');
    const database = this.config.getOrThrow<string>('DB_NAME');
    const username = this.config.getOrThrow<string>('DB_USERNAME');
    const password = this.config.getOrThrow<string>('DB_PASSWORD');
    try {
      await execFileAsync('psql', ['-v', 'ON_ERROR_STOP=1', '-h', host, '-p', port, '-U', username, '-d', database, '-c', `DROP TABLE IF EXISTS public."${layerName}" CASCADE;`], { env: { ...process.env, PGPASSWORD: password } });
    } catch (error: any) {
      throw new BadGatewayException(`Préparation de la table PostGIS impossible : ${error.stderr?.trim() || error.message}`);
    }
    const converter = spawn('shp2pgsql', ['-c', '-I', '-W', 'UTF-8', '-s', '4326', shapefile, `public.${layerName}`], { stdio: ['ignore', 'pipe', 'pipe'] });
    const psql = spawn('psql', ['-v', 'ON_ERROR_STOP=1', '-h', host, '-p', port, '-U', username, '-d', database], { env: { ...process.env, PGPASSWORD: password }, stdio: ['pipe', 'ignore', 'pipe'] });
    const errors: string[] = [];
    converter.stderr.on('data', (data) => errors.push(data.toString()));
    psql.stderr.on('data', (data) => errors.push(data.toString()));
    converter.stdout.pipe(psql.stdin);
    try {
      await Promise.all([this.waitForProcess(converter), this.waitForProcess(psql)]);
    } catch (error: any) {
      throw new BadGatewayException(`Import PostGIS impossible : ${errors.join(' ').trim() || error.message}`);
    }
  }

  private waitForProcess(process: ReturnType<typeof spawn>) {
    return new Promise<void>((resolve, reject) => {
      process.once('error', reject);
      process.once('close', (code) => code === 0 ? resolve() : reject(new Error(`Code de sortie ${code}`)));
    });
  }

  private async publishPostgisTable(layerName: string) {
    const username = this.config.get<string>('GEOSERVER_USERNAME') || 'admin';
    const password = this.config.get<string>('GEOSERVER_PASSWORD') || 'geoserver';
    const endpoint = `${this.geoserverUrl}/rest/workspaces/${encodeURIComponent(this.workspace)}/datastores/${encodeURIComponent(this.datastore)}/featuretypes`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureType: { name: layerName, nativeName: layerName, title: basename(layerName).replaceAll('_', ' '), srs: 'EPSG:4326', enabled: true } }),
    }).catch(() => { throw new BadGatewayException('GeoServer est inaccessible sur localhost:8080.'); });
    if (!response.ok && response.status !== 409) {
      const details = (await response.text()).replace(/<[^>]+>/g, ' ').trim();
      throw new BadGatewayException(details || `Publication GeoServer impossible (${response.status}).`);
    }
  }
}

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as argon2 from 'argon2';
import { User } from '../../users/user.entity';
import { Role } from '../../common/enums/role.enum';
import { Aerodrome, AerodromeType, AerodromeStatut } from '../../aerodromes/aerodrome.entity';
import { Piste, RevetementType } from '../../aerodromes/piste.entity';
import { Aeronef, AeronefCategorie, AeronefStatut } from '../../aeronefs/aeronef.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'hackermode',
  database: process.env.DB_NAME || 'aviation_madagascar',
  entities: [User, Aerodrome, Piste, Aeronef],
  synchronize: true,
});

async function runSeed() {
  await AppDataSource.initialize();
  console.log('Connecté à PostgreSQL pour l\'injection des données...');

  const userRepo = AppDataSource.getRepository(User);
  const aeroRepo = AppDataSource.getRepository(Aerodrome);
  const pisteRepo = AppDataSource.getRepository(Piste);
  const planeRepo = AppDataSource.getRepository(Aeronef);

  // 1. Utilisateurs démo par rôle
  const adminPassword = await argon2.hash('admin1234');
  const editeurPassword = await argon2.hash('editeur1234');
  const userPassword = await argon2.hash('client1234');

  await userRepo.upsert(
    [
      {
        email: 'admin@aviation.mg',
        nom: 'Administrateur Principal',
        password: adminPassword,
        role: Role.ADMIN,
        isActive: true,
      },
      {
        email: 'editeur@aviation.mg',
        nom: 'Éditeur Cartographe DGAC',
        password: editeurPassword,
        role: Role.EDITEUR,
        isActive: true,
      },
      {
        email: 'client@aviation.mg',
        nom: 'Client Pilote / Visiteur',
        password: userPassword,
        role: Role.UTILISATEUR,
        isActive: true,
      },
    ],
    ['email'],
  );
  console.log('✓ Utilisateurs démo créés (admin, editeur, client)');

  // 2. Aérodromes majeurs de Madagascar
  const aerodromesData = [
    {
      nom: 'Antananarivo / Ivato',
      code_oaci: 'FMMI',
      code_iata: 'TNR',
      latitude: -18.7969,
      longitude: 47.4788,
      altitude: 1279,
      type: AerodromeType.INTERNATIONAL,
      statut: AerodromeStatut.ACTIF,
      region: 'Analamanga',
      ville: 'Antananarivo',
      gestionnaire: 'Ravinala Airports',
      piste: {
        designation: '11/29',
        longueur: 3100,
        largeur: 45,
        revetement: RevetementType.ASPHALTE,
      },
    },
    {
      nom: 'Nosy-Be / Fascène',
      code_oaci: 'FMNN',
      code_iata: 'NOS',
      latitude: -13.3121,
      longitude: 48.3148,
      altitude: 11,
      type: AerodromeType.INTERNATIONAL,
      statut: AerodromeStatut.ACTIF,
      region: 'Diana',
      ville: 'Nosy-Be',
      gestionnaire: 'Ravinala Airports',
      piste: {
        designation: '05/23',
        longueur: 2190,
        largeur: 45,
        revetement: RevetementType.ASPHALTE,
      },
    },
    {
      nom: 'Toamasina / Ambalamanasy',
      code_oaci: 'FMMT',
      code_iata: 'TMM',
      latitude: -18.1095,
      longitude: 49.3923,
      altitude: 7,
      type: AerodromeType.NATIONAL,
      statut: AerodromeStatut.ACTIF,
      region: 'Atsinanana',
      ville: 'Toamasina',
      gestionnaire: 'ADEMA',
      piste: {
        designation: '01/19',
        longueur: 2200,
        largeur: 30,
        revetement: RevetementType.ASPHALTE,
      },
    },
    {
      nom: 'Mahajanga / Amborovy',
      code_oaci: 'FMMN',
      code_iata: 'MJN',
      latitude: -15.6681,
      longitude: 46.3512,
      altitude: 27,
      type: AerodromeType.NATIONAL,
      statut: AerodromeStatut.ACTIF,
      region: 'Boeny',
      ville: 'Mahajanga',
      gestionnaire: 'ADEMA',
      piste: {
        designation: '14/32',
        longueur: 2200,
        largeur: 45,
        revetement: RevetementType.ASPHALTE,
      },
    },
    {
      nom: 'Toliara',
      code_oaci: 'FMST',
      code_iata: 'TLE',
      latitude: -23.3834,
      longitude: 43.7285,
      altitude: 9,
      type: AerodromeType.NATIONAL,
      statut: AerodromeStatut.ACTIF,
      region: 'Atsimo-Andrefana',
      ville: 'Toliara',
      gestionnaire: 'ADEMA',
      piste: {
        designation: '04/22',
        longueur: 2000,
        largeur: 30,
        revetement: RevetementType.ASPHALTE,
      },
    },
    {
      nom: 'Tolagnaro / Fort-Dauphin',
      code_oaci: 'FMSD',
      code_iata: 'FTU',
      latitude: -25.0381,
      longitude: 46.9562,
      altitude: 9,
      type: AerodromeType.NATIONAL,
      statut: AerodromeStatut.ACTIF,
      region: 'Anosy',
      ville: 'Tolagnaro',
      gestionnaire: 'ADEMA',
      piste: {
        designation: '08/26',
        longueur: 1580,
        largeur: 30,
        revetement: RevetementType.ASPHALTE,
      },
    },
    {
      nom: 'Morondava',
      code_oaci: 'FMSO',
      code_iata: 'MOQ',
      latitude: -20.2847,
      longitude: 44.3176,
      altitude: 9,
      type: AerodromeType.REGIONAL,
      statut: AerodromeStatut.ACTIF,
      region: 'Menabe',
      ville: 'Morondava',
      gestionnaire: 'ADEMA',
      piste: {
        designation: '10/28',
        longueur: 1500,
        largeur: 30,
        revetement: RevetementType.ASPHALTE,
      },
    },
    {
      nom: 'Antsiranana / Arrachart',
      code_oaci: 'FMND',
      code_iata: 'DIE',
      latitude: -12.3494,
      longitude: 49.2917,
      altitude: 105,
      type: AerodromeType.NATIONAL,
      statut: AerodromeStatut.ACTIF,
      region: 'Diana',
      ville: 'Antsiranana',
      gestionnaire: 'ADEMA',
      piste: {
        designation: '13/31',
        longueur: 1500,
        largeur: 30,
        revetement: RevetementType.ASPHALTE,
      },
    },
  ];

  for (const item of aerodromesData) {
    const { piste, ...aptFields } = item;
    let apt = await aeroRepo.findOne({ where: { code_oaci: aptFields.code_oaci } });
    if (!apt) {
      apt = await aeroRepo.save(aeroRepo.create(aptFields));
      await pisteRepo.save(
        pisteRepo.create({
          ...piste,
          aerodrome: apt,
        }),
      );
    }
  }
  console.log('✓ 8 Aérodromes et pistes enregistrés');

  // 3. Aéronefs démo
  const planesData = [
    {
      immatriculation: '5R-EAA',
      type_aeronef: 'ATR 72-600',
      compagnie: 'Madagascar Airlines',
      categorie: AeronefCategorie.COMMERCIAL,
      statut: AeronefStatut.EN_VOL,
      latitude: -16.5,
      longitude: 47.8,
      altitude: 18000,
      vitesse: 480,
      cap: 25,
      aeroport_depart: 'FMMI',
      aeroport_arrivee: 'FMNN',
    },
    {
      immatriculation: '5R-MGA',
      type_aeronef: 'Boeing 737-800',
      compagnie: 'Madagascar Airlines',
      categorie: AeronefCategorie.COMMERCIAL,
      statut: AeronefStatut.AU_SOL,
      latitude: -18.7969,
      longitude: 47.4788,
      altitude: 0,
      vitesse: 0,
      cap: 110,
      aeroport_depart: 'FMMI',
      aeroport_arrivee: 'FMMT',
    },
    {
      immatriculation: '5R-MKL',
      type_aeronef: 'Cessna 208 Caravan',
      compagnie: 'Tsaradia Privé',
      categorie: AeronefCategorie.PRIVE,
      statut: AeronefStatut.EN_VOL,
      latitude: -21.5,
      longitude: 44.0,
      altitude: 8500,
      vitesse: 300,
      cap: 200,
      aeroport_depart: 'FMSO',
      aeroport_arrivee: 'FMST',
    },
    {
      immatriculation: '5R-SAR',
      type_aeronef: 'Eurocopter AS350 Écureuil',
      compagnie: 'Secours Aérien Malgache',
      categorie: AeronefCategorie.HELICOPTERE,
      statut: AeronefStatut.AU_SOL,
      latitude: -18.7969,
      longitude: 47.4788,
      altitude: 0,
      vitesse: 0,
      cap: 0,
      aeroport_depart: 'FMMI',
      aeroport_arrivee: 'FMMI',
    },
  ];

  for (const plane of planesData) {
    const existing = await planeRepo.findOne({
      where: { immatriculation: plane.immatriculation },
    });
    if (!existing) {
      await planeRepo.save(planeRepo.create(plane));
    }
  }
  console.log('✓ 4 Aéronefs démo enregistrés');

  await AppDataSource.destroy();
  console.log('Seed terminé avec succès !');
}

runSeed().catch((err) => {
  console.error('Erreur lors du seed :', err);
  process.exit(1);
});

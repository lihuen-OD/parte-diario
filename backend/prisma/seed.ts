import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { ROLES } from '../src/types/roles';

const prisma = new PrismaClient();

const trabajadores = [
  'CAÑETE, Luis A',
  'INGLES, Alexander',
  'MARTIN, Guillermo',
  'MARTIN, Santiago',
  'RODRIGUEZ, Sebastian',
  'VILLAGRA, Tomas',
  'DERKAEZ, Ignacio',
];

const actividades = [
  'Plantación',
  'Poda',
  'Raleo',
  'Cosecha',
  'Reposición',
  'Carpida / Control de malezas',
  'Aplicación de herbicida',
  'Limpieza de calles',
  'Alambrado / Cerco',
  'Riego',
  'Mantenimiento de maquinaria',
  'Carga y descarga',
  'Vivero',
  'Quema controlada',
  'Otros',
];

const predios = [
  'APENDICE 1',
  'APENDICE 2',
  'PALMERAS OESTE',
  'PALMERAS ESQUINA',
  'PALOMAS ESTE',
  'PALOMAS OESTE',
  'PALOMAS NORTE',
  'ARROCERA',
  'ARVEJAS',
  'BASURAL',
  'CASCO',
  'HERMES 1',
  'HERMES 2',
  'LAS TIPAS 1',
  'LAS TIPAS 2',
  'LH OESTE 7',
  'LH OESTE 7.1',
  'LH OESTE 7.2',
  'LH OESTE 8',
  'LH OESTE 9',
  'LH OESTE 10',
  'LH OESTE 11',
  'LH OESTE 11.1',
  'LH ESTE 1',
  'LH NORTE 2',
  'LH NORTE 3',
  'LH NORTE 4',
  'LH NORTE 5',
  'LH NORTE 14',
  'LH NORTE 15',
  'LH NORTE 16',
  'LH CENTRO 1',
  'LH CENTRO 2',
  'LH ALTA TENSION',
  'VIRGEN CENTRO',
  'VIRGEN NORTE',
  'VIRGEN SUR',
  'PUNTA',
  'RECUERDO',
  'TRIGAL',
  'YONNI',
  'SELINA',
  'LAGUNITA',
  'LA PICADA 1',
  'LA PICADA 2',
  'LA PICADA 3',
  'PICABUEY',
  'NADINE 2',
];

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const workerPassword = await bcrypt.hash('worker123', 10);

  await prisma.usuario.upsert({
    where: { email: 'admin@partediario.com' },
    create: {
      nombre: 'Administrador',
      email: 'admin@partediario.com',
      password: adminPassword,
      rol: ROLES.ADMIN,
      activo: true,
    },
    update: {
      nombre: 'Administrador',
      password: adminPassword,
      rol: ROLES.ADMIN,
      activo: true,
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'worker@partediario.com' },
    create: {
      nombre: 'Cargador de Partes',
      email: 'worker@partediario.com',
      password: workerPassword,
      rol: ROLES.WORKER,
      activo: true,
    },
    update: {
      nombre: 'Cargador de Partes',
      password: workerPassword,
      rol: ROLES.WORKER,
      activo: true,
    },
  });

  for (const nombre of trabajadores) {
    await prisma.trabajador.upsert({
      where: { nombre },
      create: { nombre, activo: true },
      update: { activo: true },
    });
  }

  for (const nombre of actividades) {
    await prisma.actividad.upsert({
      where: { nombre },
      create: { nombre, activo: true },
      update: { activo: true },
    });
  }

  for (const nombre of predios) {
    await prisma.predio.upsert({
      where: { nombre },
      create: { nombre, activo: true },
      update: { activo: true },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

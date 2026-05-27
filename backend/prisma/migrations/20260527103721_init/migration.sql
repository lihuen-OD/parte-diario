-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'WORKER');

-- CreateEnum
CREATE TYPE "EstadoSync" AS ENUM ('PENDIENTE', 'SINCRONIZADO', 'ERROR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trabajador" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trabajador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actividad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Predio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Predio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParteDiario" (
    "id" SERIAL NOT NULL,
    "localId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "dia" TEXT NOT NULL,
    "creadoPorId" INTEGER NOT NULL,
    "estadoSync" "EstadoSync" NOT NULL DEFAULT 'PENDIENTE',
    "syncedToGoogleSheet" BOOLEAN NOT NULL DEFAULT false,
    "googleSheetRowId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParteDiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParteDiarioDetalle" (
    "id" SERIAL NOT NULL,
    "parteDiarioId" INTEGER NOT NULL,
    "trabajadorId" INTEGER NOT NULL,
    "actividadId" INTEGER NOT NULL,
    "predioId" INTEGER NOT NULL,
    "horas" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParteDiarioDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_nombre_key" ON "Trabajador"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Actividad_nombre_key" ON "Actividad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Predio_nombre_key" ON "Predio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ParteDiario_localId_key" ON "ParteDiario"("localId");

-- AddForeignKey
ALTER TABLE "ParteDiario" ADD CONSTRAINT "ParteDiario_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParteDiarioDetalle" ADD CONSTRAINT "ParteDiarioDetalle_parteDiarioId_fkey" FOREIGN KEY ("parteDiarioId") REFERENCES "ParteDiario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParteDiarioDetalle" ADD CONSTRAINT "ParteDiarioDetalle_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParteDiarioDetalle" ADD CONSTRAINT "ParteDiarioDetalle_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "Actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParteDiarioDetalle" ADD CONSTRAINT "ParteDiarioDetalle_predioId_fkey" FOREIGN KEY ("predioId") REFERENCES "Predio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

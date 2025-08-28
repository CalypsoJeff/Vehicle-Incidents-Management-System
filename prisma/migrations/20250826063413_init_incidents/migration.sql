-- CreateEnum
CREATE TYPE "public"."incident_severities" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."incident_statuses" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."incident_types" AS ENUM ('ACCIDENT', 'BREAKDOWN', 'THEFT', 'VANDALISM', 'MAINTENANCE_ISSUE', 'TRAFFIC_VIOLATION', 'FUEL_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."incident_update_types" AS ENUM ('STATUS_CHANGE', 'ASSIGNMENT', 'COMMENT', 'COST_UPDATE', 'RESOLUTION');

-- CreateTable
CREATE TABLE "public"."incidents" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "reportedById" INTEGER NOT NULL,
    "assignedToId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "public"."incident_severities" NOT NULL DEFAULT 'LOW',
    "status" "public"."incident_statuses" NOT NULL DEFAULT 'PENDING',
    "type" "public"."incident_types" NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "carReadingId" INTEGER,
    "images" TEXT[],
    "documents" TEXT[],
    "resolutionNotes" TEXT,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."incident_updates" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "updateType" "public"."incident_update_types" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cars" (
    "id" SERIAL NOT NULL,
    "vin" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "cars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."car_readings" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "odometer" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "car_readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incidents_carId_idx" ON "public"."incidents"("carId");

-- CreateIndex
CREATE INDEX "incidents_reportedById_idx" ON "public"."incidents"("reportedById");

-- CreateIndex
CREATE INDEX "incidents_assignedToId_idx" ON "public"."incidents"("assignedToId");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "public"."incidents"("status");

-- CreateIndex
CREATE INDEX "incidents_severity_idx" ON "public"."incidents"("severity");

-- CreateIndex
CREATE INDEX "incidents_occurredAt_idx" ON "public"."incidents"("occurredAt");

-- CreateIndex
CREATE INDEX "incident_updates_incidentId_idx" ON "public"."incident_updates"("incidentId");

-- CreateIndex
CREATE INDEX "incident_updates_userId_idx" ON "public"."incident_updates"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cars_vin_key" ON "public"."cars"("vin");

-- CreateIndex
CREATE INDEX "car_readings_carId_idx" ON "public"."car_readings"("carId");

-- AddForeignKey
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."cars"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."incidents" ADD CONSTRAINT "incidents_carReadingId_fkey" FOREIGN KEY ("carReadingId") REFERENCES "public"."car_readings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."incident_updates" ADD CONSTRAINT "incident_updates_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "public"."incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."incident_updates" ADD CONSTRAINT "incident_updates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."car_readings" ADD CONSTRAINT "car_readings_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."cars"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

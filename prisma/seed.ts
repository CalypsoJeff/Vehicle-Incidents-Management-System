import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Seed users
  await prisma.user.createMany({
    data: [
      { name: "Jephy Jayan Varghese", email: "jephy@gmail.com" },
      { name: "Gayathri PS", email: "gayathri@gmail.com" },
      { name: "Fleet Manager", email: "manager@example.com" },
    ],
    skipDuplicates: true,
  });

  // Seed cars
  await prisma.car.createMany({
    data: [
      { vin: "KL02BT4848", label: "Kia Carens" },
      { vin: "KL02AM5535", label: "Maruthi Suzuki Swift" },
      { vin: "KL02BJ2497", label: "KTM Duke 390" },
    ],
    skipDuplicates: true,
  });

  const allUsers = await prisma.user.findMany();
  const allCars = await prisma.car.findMany();

  // Seed car readings
  const readings = await prisma.$transaction([
    prisma.carReading.create({
      data: {
        carId: allCars[0].id,
        odometer: 15000,
        createdAt: new Date("2025-07-30T09:00:00Z"),
      },
    }),
    prisma.carReading.create({
      data: {
        carId: allCars[1].id,
        odometer: 32000,
        createdAt: new Date("2025-08-10T14:00:00Z"),
      },
    }),
    prisma.carReading.create({
      data: {
        carId: allCars[2].id,
        odometer: 5000,
        createdAt: new Date("2025-08-19T08:00:00Z"),
      },
    }),
  ]);

  // Use create (not createMany) so we can get IDs back
  const incidents = await prisma.$transaction([
    prisma.incident.create({
      data: {
        carId: allCars[0].id,
        reportedById: allUsers[0].id,
        carReadingId: readings[0].id,
        title: "Flat Tire",
        description: "Rear left tire burst while driving",
        severity: "MEDIUM",
        status: "PENDING",
        type: "BREAKDOWN",
        occurredAt: new Date("2025-08-01T10:00:00Z"),
      },
    }),
    prisma.incident.create({
      data: {
        carId: allCars[1].id,
        reportedById: allUsers[1].id,
        assignedToId: allUsers[2].id,
        carReadingId: readings[1].id,
        title: "Engine Overheating",
        description: "Car stopped in traffic due to overheating",
        severity: "HIGH",
        status: "IN_PROGRESS",
        type: "MAINTENANCE_ISSUE",
        occurredAt: new Date("2025-08-15T15:30:00Z"),
      },
    }),
    prisma.incident.create({
      data: {
        carId: allCars[2].id,
        reportedById: allUsers[0].id,
        carReadingId: readings[2].id,
        title: "Traffic Fine",
        description: "Speeding ticket issued on highway",
        severity: "LOW",
        status: "RESOLVED",
        type: "TRAFFIC_VIOLATION",
        occurredAt: new Date("2025-08-20T09:45:00Z"),
        resolvedAt: new Date("2025-08-21T12:00:00Z"),
        resolutionNotes: "Fine paid and closed",
      },
    }),
  ]);

  // Seed updates for each incident
  await prisma.incidentUpdate.createMany({
    data: [
      // Flat Tire
      {
        incidentId: incidents[0].id,
        userId: allUsers[0].id,
        message: "Incident reported: Flat Tire",
        updateType: "COMMENT",
      },
      {
        incidentId: incidents[0].id,
        userId: allUsers[2].id,
        message: "Assigned to Fleet Manager",
        updateType: "ASSIGNMENT",
      },
      {
        incidentId: incidents[0].id,
        userId: allUsers[2].id,
        message: "Status changed to IN_PROGRESS",
        updateType: "STATUS_CHANGE",
      },

      // Engine Overheating
      {
        incidentId: incidents[1].id,
        userId: allUsers[1].id,
        message: "Incident reported: Engine overheating",
        updateType: "COMMENT",
      },
      {
        incidentId: incidents[1].id,
        userId: allUsers[2].id,
        message: "Mechanic dispatched to location",
        updateType: "COMMENT",
      },

      // Traffic Fine
      {
        incidentId: incidents[2].id,
        userId: allUsers[0].id,
        message: "Incident reported: Speeding ticket",
        updateType: "COMMENT",
      },
      {
        incidentId: incidents[2].id,
        userId: allUsers[2].id,
        message: "Fine processed, status set to RESOLVED",
        updateType: "RESOLUTION",
      },
    ],
  });

  console.log("✅ Seed data with incidents + updates created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

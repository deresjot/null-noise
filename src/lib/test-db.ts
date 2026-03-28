import { prisma } from "@/lib/prisma";
import { resetCatalogBootstrapStateForTests } from "@/lib/catalog-db";

export async function resetCatalogStoreForTests(): Promise<void> {
  resetCatalogBootstrapStateForTests();

  await prisma.titleImportAttempt.deleteMany();
  await prisma.ratingAttempt.deleteMany();
  await prisma.titleRating.deleteMany();
  await prisma.contentFlag.deleteMany();
  await prisma.stimulusAggregate.deleteMany();
  await prisma.externalTitle.deleteMany();

  resetCatalogBootstrapStateForTests();
}

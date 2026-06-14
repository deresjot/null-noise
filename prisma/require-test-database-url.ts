const testDatabaseUrl = process.env.NULL_NOISE_TEST_DATABASE_URL?.trim();

if (!testDatabaseUrl) {
  console.error(
    "NULL_NOISE_TEST_DATABASE_URL is required for unit tests after the Postgres migration. " +
      "Use a dedicated disposable Postgres test database, not Production or shared Development.",
  );
  process.exit(1);
}

if (!/^(postgres(ql)?|prisma\+postgres):\/\//.test(testDatabaseUrl)) {
  console.error(
    "NULL_NOISE_TEST_DATABASE_URL must be a Postgres or Prisma Postgres connection string.",
  );
  process.exit(1);
}

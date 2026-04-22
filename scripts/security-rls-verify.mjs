import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tables = [
  "Household",
  "Membership",
  "Category",
  "PaymentMethod",
  "Account",
  "Transaction",
  "Debt",
  "RecurringBill",
  "AuditLog",
  "RateLimitBucket",
];

try {
  const rows = await prisma.$queryRaw`
    select c.relname as table_name, c.relrowsecurity as rls_enabled, count(p.polname)::int as policies
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    left join pg_policy p on p.polrelid = c.oid
    where n.nspname = 'public'
      and c.relname = any(${tables})
    group by c.relname, c.relrowsecurity
  `;

  const byName = new Map(rows.map((row) => [row.table_name, row]));
  const failures = [];

  for (const table of tables) {
    const row = byName.get(table);
    if (!row) failures.push(`${table}: missing`);
    else if (!row.rls_enabled) failures.push(`${table}: RLS disabled`);
    else if (table !== "AuditLog" && table !== "RateLimitBucket" && row.policies < 1) {
      failures.push(`${table}: no policies`);
    }
  }

  if (failures.length > 0) {
    console.error(`RLS verification failed:\n${failures.map((item) => `- ${item}`).join("\n")}`);
    process.exit(1);
  }

  console.log("RLS verification passed.");
} finally {
  await prisma.$disconnect();
}

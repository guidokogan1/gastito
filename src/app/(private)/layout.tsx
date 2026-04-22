import { AppShell } from "@/components/app-shell";
import { requireHousehold } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { household, user } = await requireHousehold();

  return (
    <AppShell householdName={household.name} userEmail={user.email}>
      {children}
    </AppShell>
  );
}

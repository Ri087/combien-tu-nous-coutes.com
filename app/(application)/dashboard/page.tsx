import { LogoutButton } from "@/components/logout-button";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1>Dashboard</h1>
      <LogoutButton />
    </div>
  );
}

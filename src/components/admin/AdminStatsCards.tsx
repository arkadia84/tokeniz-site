import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Activity, DollarSign } from "lucide-react";

interface AdminStatsCardsProps {
  totalUsers: number;
  completedOnboarding: number;
  activeToday: number;
  totalRevenue: number;
  potentialRevenue: number;
}

const AdminStatsCards = ({ totalUsers, completedOnboarding, activeToday, totalRevenue, potentialRevenue }: AdminStatsCardsProps) => {
  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Onboarded", value: completedOnboarding, icon: UserCheck, color: "bg-accent/10 text-accent" },
    { label: "Active Today", value: activeToday, icon: Activity, color: "bg-warning/10 text-warning" },
    { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-accent/10 text-accent" },
    { label: "Pipeline", value: `$${potentialRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color.split(" ")[0]}`}>
              <stat.icon className={`h-5 w-5 ${stat.color.split(" ")[1]}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStatsCards;

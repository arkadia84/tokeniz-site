import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, ShieldCheck, Package } from "lucide-react";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import AdminUserDetail from "@/components/admin/AdminUserDetail";
import AdminComplianceTracker, { type ComplianceFiling } from "@/components/admin/AdminComplianceTracker";
import AdminProducts, { type Product } from "@/components/admin/AdminProducts";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  signup_method: string | null;
  onboarding_step: string | null;
  onboarding_completed: boolean | null;
  last_active_at: string | null;
  created_at: string;
  user_role: string | null;
}

interface Company {
  id: string;
  user_id: string;
  company_name: string;
  company_type: string;
  jurisdiction: string;
  formation_status: string;
  plan: string;
  payment_method: string;
  deposit_amount: number;
  revenue_generated: number;
  potential_revenue: number;
  ein_status: string;
  operating_agreement_status: string;
  banking_status: string;
  kyc_status: string;
  wallet_address: string | null;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filings, setFilings] = useState<ComplianceFiling[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [roles, setRoles] = useState<{ user_id: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/"); return; }

    const { data: hasRole } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!hasRole) { navigate("/dashboard"); return; }

    setIsAdmin(true);

    const [profilesRes, companiesRes, rolesRes, filingsRes, productsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("companies").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("compliance_filings").select("*").order("due_date", { ascending: true }),
      supabase.from("products").select("*").order("display_order", { ascending: true }),
    ]);

    setProfiles(profilesRes.data || []);
    setCompanies((companiesRes.data as unknown as Company[]) || []);
    setFilings((filingsRes.data as unknown as ComplianceFiling[]) || []);
    setProducts((productsRes.data as unknown as Product[]) || []);
    setRoles((rolesRes.data as { user_id: string; role: string }[]) || []);
    setLoading(false);
  };

  const totalUsers = profiles.length;
  const completedOnboarding = profiles.filter((p) => p.onboarding_completed).length;
  const activeToday = profiles.filter((p) => {
    if (!p.last_active_at) return false;
    return new Date().toDateString() === new Date(p.last_active_at).toDateString();
  }).length;
  const totalRevenue = companies.reduce((sum, c) => sum + (c.revenue_generated || 0), 0);
  const potentialRevenue = companies.reduce((sum, c) => sum + (c.potential_revenue || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
        </div>
        <Badge variant="outline" className="text-xs">Admin</Badge>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <AdminStatsCards
          totalUsers={totalUsers}
          completedOnboarding={completedOnboarding}
          activeToday={activeToday}
          totalRevenue={totalRevenue}
          potentialRevenue={potentialRevenue}
        />

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-3.5 w-3.5" /> Users & Companies
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Compliance
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5">
              <Package className="h-3.5 w-3.5" /> Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            {profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No users yet.</p>
            ) : (
              <AdminUserDetail profiles={profiles} companies={companies} roles={roles} onUserDeleted={checkAdminAndFetch} />
            )}
          </TabsContent>

          <TabsContent value="compliance" className="mt-4">
            <AdminComplianceTracker
              filings={filings}
              companies={companies.map((c) => ({ id: c.id, company_name: c.company_name, user_id: c.user_id }))}
              onFilingUpdated={checkAdminAndFetch}
            />
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            <AdminProducts products={products} onProductUpdated={checkAdminAndFetch} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown, Mail, Calendar, Clock, Shield, Building2, CreditCard,
  Wallet, FileText, Landmark, User, Trash2, Archive, ArchiveRestore
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  archived_at?: string | null;
  revocation_status?: string | null;
  nft_id?: string | null;
}

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

interface AdminUserDetailProps {
  profiles: Profile[];
  companies: Company[];
  roles: { user_id: string; role: string }[];
  onUserDeleted?: () => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "completed":
    case "generated":
    case "submitted":
    case "verified":
    case "active":
      return "bg-accent/10 text-accent border-0";
    case "in_progress":
    case "in-progress":
      return "bg-warning/10 text-warning border-0";
    case "pending":
    default:
      return "bg-muted text-muted-foreground border-0";
  }
};

const planBadge = (plan: string) => {
  switch (plan) {
    case "explorer":
      return "bg-primary/10 text-primary border-0";
    case "elite":
      return "bg-accent/10 text-accent border-0";
    default:
      return "bg-muted text-muted-foreground border-0";
  }
};

const onboardingProgress = (step: string | null) => {
  const steps = ["signup", "profile", "wallet", "plan", "banking", "kyc", "funding", "company_created"];
  const idx = steps.indexOf(step || "signup");
  return Math.round(((idx + 1) / steps.length) * 100);
};

const AdminUserDetail = ({ profiles, companies, roles, onUserDeleted }: AdminUserDetailProps) => {
  const [openUsers, setOpenUsers] = useState<Set<string>>(new Set());
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [archivingCompanyId, setArchivingCompanyId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenUsers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteUser = async (userId: string, displayName: string) => {
    setDeletingUserId(userId);
    try {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { user_id: userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`${displayName} has been deleted`);
      onUserDeleted?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleArchiveToggle = async (company: Company) => {
    setArchivingCompanyId(company.id);
    try {
      const isArchived = !!company.archived_at;
      const { error } = await supabase
        .from("companies")
        .update({ archived_at: isArchived ? null : new Date().toISOString() } as any)
        .eq("id", company.id);
      if (error) throw error;
      toast.success(isArchived ? `${company.company_name} unarchived` : `${company.company_name} archived`);
      onUserDeleted?.(); // refresh data
    } catch (err: any) {
      toast.error(err.message || "Failed to update company");
    } finally {
      setArchivingCompanyId(null);
    }
  };

  const getUserCompanies = (userId: string) => companies.filter((c) => c.user_id === userId);
  const getUserRoles = (userId: string) => roles.filter((r) => r.user_id === userId).map((r) => r.role);

  return (
    <div className="space-y-3">
      {profiles.map((profile, index) => {
        const userCompanies = getUserCompanies(profile.user_id);
        const userRoles = getUserRoles(profile.user_id);
        const progress = onboardingProgress(profile.onboarding_step);

        return (
          <Card key={profile.id} className="overflow-hidden">
            <Collapsible open={openUsers.has(profile.id)} onOpenChange={() => toggle(profile.id)}>
              <CollapsibleTrigger className="w-full">
                <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {(profile.first_name?.[0] || profile.email?.[0] || "?").toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {profile.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : profile.email}
                        </span>
                        {userRoles.includes("admin") && (
                          <Badge className="bg-primary/10 text-primary border-0 text-[10px]">Admin</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px] capitalize">{profile.signup_method || "email"}</Badge>
                      <Badge className={`text-[10px] ${profile.onboarding_completed ? statusColor("completed") : statusColor("in_progress")}`}>
                        {profile.onboarding_completed ? "Onboarded" : "In Progress"}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        #{(index + 1).toString().padStart(3, "0")}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openUsers.has(profile.id) ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                  {/* User Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <InfoItem icon={User} label="User ID" value={profile.user_id.slice(0, 8) + "..."} />
                    <InfoItem icon={Mail} label="Email" value={profile.email || "—"} />
                    <InfoItem icon={Shield} label="Role" value={profile.user_role || "Not set"} />
                    <InfoItem icon={Calendar} label="Signed Up" value={format(new Date(profile.created_at), "MMM d, yyyy")} />
                    <InfoItem icon={Clock} label="Last Active" value={profile.last_active_at ? format(new Date(profile.last_active_at), "MMM d, HH:mm") : "—"} />
                    <InfoItem icon={Shield} label="Platform Role" value={userRoles.length > 0 ? userRoles.join(", ") : "user"} />
                    <div className="col-span-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Onboarding Progress</p>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="flex-1 h-2" />
                        <span className="text-xs font-medium text-foreground">{progress}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">Step: {profile.onboarding_step || "signup"}</p>
                    </div>
                  </div>

                  {/* Companies */}
                  {userCompanies.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> Companies ({userCompanies.length})
                      </h4>
                      {userCompanies.map((company) => (
                        <CompanyCard
                          key={company.id}
                          company={company}
                          onArchiveToggle={handleArchiveToggle}
                          archiving={archivingCompanyId === company.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <Building2 className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                      <p className="text-sm text-muted-foreground">No companies registered yet</p>
                    </div>
                  )}

                  {/* Delete User */}
                  <div className="pt-2 border-t border-border flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1.5"
                          disabled={deletingUserId === profile.user_id || userRoles.includes("admin")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingUserId === profile.user_id ? "Deleting…" : "Delete User"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete user account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete <strong>{profile.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : profile.email}</strong> and all their companies, compliance filings, and data. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDeleteUser(
                              profile.user_id,
                              profile.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : profile.email || "User"
                            )}
                          >
                            Delete permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="space-y-0.5">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
      <Icon className="h-3 w-3" /> {label}
    </p>
    <p className="text-sm text-foreground truncate">{value}</p>
  </div>
);

interface CompanyCardProps {
  company: Company;
  onArchiveToggle: (company: Company) => void;
  archiving: boolean;
}

const CompanyCard = ({ company, onArchiveToggle, archiving }: CompanyCardProps) => {
  const formationProgress = () => {
    const statuses = [company.operating_agreement_status, company.ein_status, company.banking_status, company.kyc_status];
    const completed = statuses.filter((s) => s === "completed" || s === "generated" || s === "submitted" || s === "verified").length;
    return Math.round((completed / statuses.length) * 100);
  };

  const isArchived = !!company.archived_at;
  const isOnChain = !!company.nft_id;

  return (
    <Card className={`border border-border ${isArchived ? "opacity-60" : ""}`}>
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            {company.company_name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isArchived && <Badge variant="secondary" className="text-[10px]">Archived</Badge>}
            {isOnChain && <Badge className="bg-accent/10 text-accent border-0 text-[10px]">On-Chain</Badge>}
            {company.revocation_status && (
              <Badge variant="destructive" className="text-[10px] capitalize">{company.revocation_status}</Badge>
            )}
            <Badge className={`text-[10px] capitalize ${planBadge(company.plan)}`}>{company.plan}</Badge>
            <Badge className={`text-[10px] capitalize ${statusColor(company.formation_status)}`}>{company.formation_status.replace("_", " ")}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <MiniStat icon={FileText} label="Type" value={company.company_type} />
          <MiniStat icon={Landmark} label="Jurisdiction" value={company.jurisdiction} />
          <MiniStat icon={CreditCard} label="Payment" value={company.payment_method} />
          <MiniStat icon={Wallet} label="Wallet" value={company.wallet_address || "Not set"} />
        </div>

        {/* Formation Checklist */}
        <div className="bg-muted/50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Formation Progress</p>
            <span className="text-xs font-medium text-foreground">{formationProgress()}%</span>
          </div>
          <Progress value={formationProgress()} className="h-1.5 mb-2" />
          <div className="grid grid-cols-2 gap-1.5">
            <CheckItem label="Operating Agreement" status={company.operating_agreement_status} />
            <CheckItem label="EIN Filing" status={company.ein_status} />
            <CheckItem label="Banking" status={company.banking_status} />
            <CheckItem label="KYC" status={company.kyc_status} />
          </div>
        </div>

        {/* Revenue */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-muted/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">Deposit</p>
            <p className="text-sm font-bold text-foreground">${company.deposit_amount.toLocaleString()}</p>
          </div>
          <div className="bg-accent/5 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">Revenue</p>
            <p className="text-sm font-bold text-accent">${company.revenue_generated.toLocaleString()}</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">Pipeline</p>
            <p className="text-sm font-bold text-primary">${company.potential_revenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => onArchiveToggle(company)}
            disabled={archiving}
          >
            {isArchived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
            {archiving ? "Updating…" : isArchived ? "Unarchive" : "Archive"}
          </Button>
          {isOnChain && (
            <span className="text-[10px] text-muted-foreground">On-chain companies cannot be deleted</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MiniStat = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div>
    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
      <Icon className="h-3 w-3" /> {label}
    </p>
    <p className="text-xs text-foreground truncate">{value}</p>
  </div>
);

const CheckItem = ({ label, status }: { label: string; status: string }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <Badge className={`text-[9px] px-1.5 py-0 ${statusColor(status)}`}>{status}</Badge>
  </div>
);

export default AdminUserDetail;

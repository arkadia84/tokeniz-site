import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Plus,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Info,
  Check,
  ShieldCheck,
  Rocket,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveOrg } from "@/contexts/ActiveOrgContext";
import { getShortName } from "@/lib/companyUtils";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import FormationDialog from "@/components/onboarding/FormationDialog";

/* ── Notifications ───────────────────────────────── */

const notifications = [
  { id: 1, icon: CheckCircle2, color: "text-accent", title: "EIN Approved", description: "Your EIN has been confirmed by the IRS.", time: "2 hours ago" },
  { id: 2, icon: AlertCircle, color: "text-warning", title: "Invoice Overdue", description: "INV-003 from Initech LLC is past due.", time: "1 day ago" },
  { id: 3, icon: Info, color: "text-primary", title: "New Grant Match", description: "You matched with Solana Ecosystem Fund (72%).", time: "3 days ago" },
];

const NotificationBell = () => {
  const [read, setRead] = useState(false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={() => setRead(true)}
          className="relative h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {!read && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.map((n) => (
            <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-secondary transition-colors">
              <n.icon className={`h-4 w-4 mt-0.5 shrink-0 ${n.color}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

/* ── Organization Switcher ───────────────────────── */

const OrgSwitcher = () => {
  const navigate = useNavigate();
  const { companies, activeCompany, setActiveCompanyId } = useActiveOrg();
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [formationOpen, setFormationOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "";
        setUserName(name);
        supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }).then(({ data }) => {
          setIsAdmin(!!data);
        });
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const displayName = activeCompany ? getShortName(activeCompany) : "No Organization";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-tight">{displayName}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{userName}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        {/* Actions */}
        <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-border">
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Panel
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <Settings className="h-3.5 w-3.5" /> Settings
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>

        {/* Company list */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">My Companies</p>
          <div className="space-y-1">
            {companies.map((org) => {
              const isActive = activeCompany?.id === org.id;
              return (
                <button
                  key={org.id}
                  onClick={() => setActiveCompanyId(org.id)}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-secondary" : "hover:bg-secondary/50"
                  }`}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                      {getShortName(org).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground flex-1 text-left">{getShortName(org)}</span>
                  {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}
            {companies.length === 0 && (
              <p className="text-xs text-muted-foreground py-1">No companies yet</p>
            )}
          </div>
        </div>

        {/* Create new */}
        <div className="px-4 py-3">
          <button
            onClick={() => setFormationOpen(true)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Rocket className="h-4 w-4" /> Create a Company
          </button>
        </div>
      </PopoverContent>
      <FormationDialog open={formationOpen} onOpenChange={setFormationOpen} />
    </Popover>
  );
};

/* ── Combined Header Bar ─────────────────────────── */

const DashboardTopBar = () => (
  <div className="flex items-center gap-2">
    <NotificationBell />
    <OrgSwitcher />
  </div>
);

export default DashboardTopBar;

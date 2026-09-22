import {
  Home,
  Landmark,
  FileSpreadsheet,
  FileText,
  Users,
  Receipt,
  Building2,
  Gift,
  Moon,
  Sun,
  Gem,
  Store,
  ExternalLink,
  ArrowRightLeft,
  ShieldCheck,
  Rocket,
  LogOut,
  ChevronDown,
  Check,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useActiveOrg } from "@/contexts/ActiveOrgContext";
import { getShortName } from "@/lib/companyUtils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import FormationDialog from "@/components/onboarding/FormationDialog";

/* ── Menu item definitions ───────────────────────── */

const menuItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Organization", url: "/dashboard/organization", icon: Building2, children: [
    { title: "Compliance", url: "/dashboard/compliance", icon: ShieldCheck },
  ]},
  { title: "Banking", url: "/dashboard/banking", icon: Landmark },
  { title: "Accounting", url: "/dashboard/accounting", icon: FileSpreadsheet },
  { title: "RWA", url: "/dashboard/assets", icon: Gem },
  { title: "Invoices", url: "/dashboard/invoices", icon: Receipt },
  { title: "DeFi", url: "/dashboard/defi", icon: ArrowRightLeft },
  { title: "Grants", url: "/dashboard/grants", icon: Gift },
];

const externalLinks = [
  { title: "Marketplace", label: "Propex", url: "https://www.propex.app", icon: Store },
];

const DashboardSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { companies, activeCompany, setActiveCompanyId } = useActiveOrg();
  const [orgOpen, setOrgOpen] = useState(false);
  const [formationOpen, setFormationOpen] = useState(false);

  return (
    <>
    <Sidebar collapsible="offcanvas">
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="font-semibold text-sidebar-primary tracking-tight text-lg">
            Tokeniz
          </span>
        )}
        {collapsed && (
          <span className="font-bold text-sidebar-primary text-lg mx-auto">T</span>
        )}
      </div>

      <SidebarContent>
        {/* Company Selector Dropdown */}
        {!collapsed && companies.length > 0 && (
          <SidebarGroup>
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">My Companies</p>
              <Popover open={orgOpen} onOpenChange={setOrgOpen}>
                <PopoverTrigger asChild>
                  <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                        {activeCompany ? getShortName(activeCompany).charAt(0).toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground flex-1 text-left truncate">
                      {activeCompany ? getShortName(activeCompany) : "Select Company"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-1">
                  {companies.map((c) => {
                    const isActive = activeCompany?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => { setActiveCompanyId(c.id); setOrgOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                          isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="flex-1 text-left truncate">{getShortName(c)}</span>
                        {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { setOrgOpen(false); setFormationOpen(true); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mt-1"
                  >
                    <Rocket className="h-3.5 w-3.5" />
                    <span>Create a Company</span>
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                item.children ? (
                  <SidebarMenuItem key={item.title}>
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end
                            className="hover:bg-sidebar-accent"
                            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-6 border-l border-border pl-2 mt-0.5 space-y-0.5">
                          {item.children.map((child) => (
                            <SidebarMenuItem key={child.title}>
                              <SidebarMenuButton asChild>
                                <NavLink
                                  to={child.url}
                                  end
                                  className="hover:bg-sidebar-accent text-sm"
                                  activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                                >
                                  <child.icon className="mr-2 h-3.5 w-3.5" />
                                  {!collapsed && (
                                    <span className="flex items-center gap-1.5">
                                      {child.title}
                                      <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">Action</Badge>
                                    </span>
                                  )}
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              ))}
              {externalLinks.map((link) => (
                <SidebarMenuItem key={link.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-sidebar-accent flex items-center"
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {!collapsed && (
                        <span className="flex items-center gap-1.5">
                          {link.title} <span className="text-muted-foreground">[{link.label}]</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
              className="hover:bg-sidebar-accent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-sidebar-accent"
            >
              <Sun className="mr-2 h-4 w-4 dark:hidden" />
              <Moon className="mr-2 h-4 w-4 hidden dark:block" />
              {!collapsed && <span>Toggle Theme</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    <FormationDialog open={formationOpen} onOpenChange={setFormationOpen} />
    </>
  );
};

export default DashboardSidebar;

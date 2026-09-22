import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ActiveOrgProvider } from "@/contexts/ActiveOrgContext";
import AuthGuard from "@/components/AuthGuard";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <ActiveOrgProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/dashboard/*"
                element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                }
              />
              <Route
                path="/admin"
                element={
                  <AuthGuard>
                    <Admin />
                  </AuthGuard>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ActiveOrgProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

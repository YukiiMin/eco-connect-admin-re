import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import AdminRedirect from "./pages/admin/AdminRedirect.tsx";
import DashboardPage from "./pages/admin/DashboardPage.tsx";
import AccountsPage from "./pages/admin/AccountsPage.tsx";
import DisputesPage from "./pages/admin/DisputesPage.tsx";
import SettingsPage from "./pages/admin/SettingsPage.tsx";
import RELayout from "./components/re/RELayout.tsx";
import RERedirect from "./pages/re/RERedirect.tsx";
import REDashboardPage from "./pages/re/REDashboardPage.tsx";
import QueuePage from "./pages/re/QueuePage.tsx";
import DispatchPage from "./pages/re/DispatchPage.tsx";
import CollectorsPage from "./pages/re/CollectorsPage.tsx";
import AnalyticsPage from "./pages/re/AnalyticsPage.tsx";
import PointsPage from "./pages/re/PointsPage.tsx";
import ConfigPage from "./pages/re/ConfigPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminRedirect />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="disputes" element={<DisputesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/re" element={<RELayout />}>
            <Route index element={<RERedirect />} />
            <Route path="dashboard" element={<REDashboardPage />} />
            <Route path="queue" element={<QueuePage />} />
            <Route path="dispatch" element={<DispatchPage />} />
            <Route path="collectors" element={<CollectorsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="points" element={<PointsPage />} />
            <Route path="config" element={<ConfigPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

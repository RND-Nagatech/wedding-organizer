import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute, RequirePermission } from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/Dashboard";
import Clients from "./pages/admin/Clients";
import Vendors from "./pages/admin/Vendors";
import Packages from "./pages/admin/Packages";
import VendorCategories from "./pages/admin/VendorCategories";
import Bookings from "./pages/admin/Bookings";
import Timeline from "./pages/admin/Timeline";
import Invoices from "./pages/admin/Invoices";
import Payments from "./pages/admin/Payments";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

import ClientHome from "./pages/client/Home";
import ClientPackages from "./pages/client/ClientPackages";
import ClientBooking from "./pages/client/Booking";
import ClientTimeline from "./pages/client/ClientTimeline";
import ClientInvoices from "./pages/client/ClientInvoices";
import ClientPayments from "./pages/client/ClientPayments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Owner / Admin / Staff */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allow={["owner", "admin", "staff"]}>
                  <AppLayout>
                    <Routes>
                      <Route index element={<RequirePermission permission="dashboard"><AdminDashboard /></RequirePermission>} />
                      <Route path="clients" element={<RequirePermission permission="clients"><Clients /></RequirePermission>} />
                      <Route path="vendor-categories" element={<VendorCategories />} />
                      <Route path="vendors" element={<RequirePermission permission="vendors"><Vendors /></RequirePermission>} />
                      <Route path="packages" element={<RequirePermission permission="packages"><Packages /></RequirePermission>} />
                      <Route path="bookings" element={<RequirePermission permission="bookings"><Bookings /></RequirePermission>} />
                      <Route path="timeline" element={<RequirePermission permission="timeline"><Timeline /></RequirePermission>} />
                      <Route path="invoices" element={<RequirePermission permission="invoices"><Invoices /></RequirePermission>} />
                      <Route path="payments" element={<RequirePermission permission="payments"><Payments /></RequirePermission>} />
                      <Route path="reports" element={<RequirePermission permission="reports"><Reports /></RequirePermission>} />
                      <Route path="settings" element={<RequirePermission permission="settings"><Settings /></RequirePermission>} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Client */}
            <Route
              path="/client/*"
              element={
                <ProtectedRoute allow={["client"]}>
                  <AppLayout>
                    <Routes>
                      <Route index element={<ClientHome />} />
                      <Route path="packages" element={<ClientPackages />} />
                      <Route path="booking" element={<ClientBooking />} />
                      <Route path="timeline" element={<ClientTimeline />} />
                      <Route path="invoices" element={<ClientInvoices />} />
                      <Route path="payments" element={<ClientPayments />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

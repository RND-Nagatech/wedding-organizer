import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { SystemProfileProvider } from "@/contexts/SystemProfileContext";
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
import Projects from "./pages/admin/Projects";
import ProjectDetail from "./pages/admin/ProjectDetail";
import Timeline from "./pages/admin/Timeline";
import Invoices from "./pages/admin/Invoices";
import Payments from "./pages/admin/Payments";
import ReportsHome from "./pages/admin/reports/ReportsHome";
import EventReport from "./pages/admin/reports/EventReport";
import PaymentsReport from "./pages/admin/reports/PaymentsReport";
import KeuanganDetailReport from "./pages/admin/reports/KeuanganDetailReport";
import KeuanganRekapReport from "./pages/admin/reports/KeuanganRekapReport";
import Settings from "./pages/admin/Settings";
import AdatConcepts from "./pages/admin/AdatConcepts";
import CatalogBaju from "./pages/admin/CatalogBaju";
import CatalogDekorasi from "./pages/admin/CatalogDekorasi";
import CatalogMakeup from "./pages/admin/CatalogMakeup";
import Addons from "./pages/admin/Addons";
import ManageUsers from "./pages/admin/ManageUsers";
import ProfileSettings from "./pages/admin/ProfileSettings";
import ClientReferencesAdmin from "./pages/admin/ClientReferences";
import ClientWishlistAdmin from "./pages/admin/ClientWishlist";
import ChecklistBarang from "./pages/admin/ChecklistBarang";
import CrewAssignments from "./pages/admin/CrewAssignments";
import Keuangan from "./pages/admin/Keuangan";

import ClientHome from "./pages/client/Home";
import ClientPackages from "./pages/client/ClientPackages";
import ClientBooking from "./pages/client/Booking";
import ClientTimeline from "./pages/client/ClientTimeline";
import ClientInvoices from "./pages/client/ClientInvoices";
import ClientPayments from "./pages/client/ClientPayments";
import ClientReferences from "./pages/client/References";
import ClientWishlist from "./pages/client/Wishlist";
import ClientCatalogBaju from "./pages/client/ClientCatalogBaju";
import ClientCatalogDekorasi from "./pages/client/ClientCatalogDekorasi";
import ClientCatalogMakeup from "./pages/client/ClientCatalogMakeup";
import Favorites from "./pages/client/Favorites";
import DigitalForm from "./pages/client/DigitalForm";
import MyPlanning from "./pages/client/MyPlanning";
import MyPreferences from "./pages/client/MyPreferences";
import MyGuests from "./pages/client/MyGuests";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SystemProfileProvider>
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
                        <Route path="adat" element={<AdatConcepts />} />
                        <Route path="catalog-baju" element={<CatalogBaju />} />
                        <Route path="catalog-dekorasi" element={<CatalogDekorasi />} />
                        <Route path="catalog-makeup" element={<CatalogMakeup />} />
                        <Route path="addons" element={<Addons />} />
                        <Route path="client-references" element={<ClientReferencesAdmin />} />
                        <Route path="client-wishlist" element={<ClientWishlistAdmin />} />
                        <Route path="checklist-barang" element={<ChecklistBarang />} />
                        <Route path="crew" element={<CrewAssignments />} />
                        <Route path="keuangan" element={<Keuangan />} />
                        <Route path="bookings" element={<RequirePermission permission="bookings"><Bookings /></RequirePermission>} />
                        <Route path="projects" element={<RequirePermission permission="bookings"><Projects /></RequirePermission>} />
                        <Route path="projects/:id" element={<RequirePermission permission="bookings"><ProjectDetail /></RequirePermission>} />
                        <Route path="timeline" element={<RequirePermission permission="timeline"><Timeline /></RequirePermission>} />
                        {/* <Route path="invoices" element={<RequirePermission permission="invoices"><Invoices /></RequirePermission>} /> */}
                        <Route path="payments" element={<RequirePermission permission="payments"><Payments /></RequirePermission>} />
                      <Route path="reports" element={<RequirePermission permission="reports"><ReportsHome /></RequirePermission>} />
                      <Route path="reports/events" element={<RequirePermission permission="reports"><EventReport /></RequirePermission>} />
                      <Route path="reports/payments" element={<RequirePermission permission="reports"><PaymentsReport /></RequirePermission>} />
                      <Route path="reports/keuangan-detail" element={<RequirePermission permission="reports"><KeuanganDetailReport /></RequirePermission>} />
                      <Route path="reports/keuangan-rekap" element={<RequirePermission permission="reports"><KeuanganRekapReport /></RequirePermission>} />
                        <Route path="settings" element={<RequirePermission permission="settings"><Settings /></RequirePermission>} />
                        <Route path="settings/users" element={<RequirePermission permission="settings"><ManageUsers /></RequirePermission>} />
                        <Route path="settings/profile" element={<RequirePermission permission="settings"><ProfileSettings /></RequirePermission>} />
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
                        <Route path="planning" element={<MyPlanning />} />
                        <Route path="preferences" element={<MyPreferences />} />
                        <Route path="packages" element={<ClientPackages />} />
                        <Route path="booking" element={<ClientBooking />} />
                        <Route path="catalog-baju" element={<ClientCatalogBaju />} />
                        <Route path="catalog-dekorasi" element={<ClientCatalogDekorasi />} />
                        <Route path="catalog-makeup" element={<ClientCatalogMakeup />} />
                        <Route path="favorites" element={<Favorites />} />
                        <Route path="formulir" element={<DigitalForm />} />
                        <Route path="references" element={<ClientReferences />} />
                        <Route path="wishlist" element={<ClientWishlist />} />
                        <Route path="timeline" element={<ClientTimeline />} />
                        {/* <Route path="invoices" element={<ClientInvoices />} /> */}
                        <Route path="payments" element={<ClientPayments />} />
                        <Route path="budget" element={<ClientPayments />} />
                        <Route path="guests" element={<MyGuests />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </SystemProfileProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

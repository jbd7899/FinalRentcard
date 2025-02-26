import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import CreateRentCard from "@/pages/create-rentcard";
import ScreeningPage from "@/pages/screening-page";
import EditScreeningPage from "@/pages/edit-screening-page";
import GeneralScreeningPage from "@/pages/general-screening-page";
import ArchivedPropertyPage from "@/pages/archived-property";
import DebugAuthPage from "@/components/AuthDebugTools";
import { ProtectedRoute } from "./lib/protected-route";
import { StoreProvider } from "@/providers/StoreProvider";

// Sample Pages
import SampleRentCard from "@/pages/samples/rentcard";
import SampleScreeningPage from "@/pages/samples/screening-page";

// Landlord Pages
import LandlordDashboard from "@/pages/landlord/dashboard";
import LandlordApplications from "@/pages/landlord/applications";
import AddProperty from "@/pages/landlord/add-property";
import PropertyScreeningPage from "@/pages/landlord/screening-page";
import ScreeningManagement from "@/pages/landlord/screening";
import VerifyDocumentsPage from "@/pages/landlord/verify-documents";

// Tenant Pages
import TenantDashboard from "@/pages/tenant/dashboard";
import TenantRentCard from "@/pages/tenant/rentcard";
import DocumentDashboard from "@/pages/tenant/documents";
import TenantReferences from "@/pages/tenant/references";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/create-screening" component={ScreeningPage} />
      <Route path="/debug-auth" component={DebugAuthPage} />

      {/* Landlord Routes */}
      <ProtectedRoute path="/landlord/dashboard" component={LandlordDashboard} />
      <ProtectedRoute path="/landlord/applications" component={LandlordApplications} />
      <ProtectedRoute path="/landlord/add-property" component={AddProperty} />
      <ProtectedRoute path="/landlord/properties/:id/edit" component={AddProperty} />
      <ProtectedRoute path="/landlord/verify-documents" component={VerifyDocumentsPage} />
      <Route path="/landlord/screening/:slug" component={PropertyScreeningPage} />
      <ProtectedRoute path="/landlord/screening" component={ScreeningManagement} />
      <Route path="/property/archived/:slug" component={ArchivedPropertyPage} />

      {/* Property Screening Pages */}
      <Route path="/screening/property/:slug/edit" component={EditScreeningPage} />
      <Route path="/screening/property/:slug" component={PropertyScreeningPage} />
      
      {/* General Screening Page */}
      <Route path="/screening/general/:slug/edit" component={EditScreeningPage} />
      <Route path="/screening/:slug" component={GeneralScreeningPage} />

      {/* Sample Pages */}
      <Route path="/samples/rentcard" component={SampleRentCard} />
      <Route path="/samples/screening-page" component={SampleScreeningPage} />

      {/* Tenant Routes */}
      <ProtectedRoute path="/tenant/dashboard" component={TenantDashboard} />
      <ProtectedRoute path="/tenant/rentcard" component={TenantRentCard} />
      <ProtectedRoute path="/tenant/documents" component={DocumentDashboard} />
      <ProtectedRoute path="/tenant/references" component={TenantReferences} />
      <Route path="/create-rentcard" component={CreateRentCard} />
      <Route path="/rentcard/:slug" component={TenantRentCard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <Router />
        <Toaster />
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default App;


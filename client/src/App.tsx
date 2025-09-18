import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ROUTES } from "@/constants/routes";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import CreateRentCard from "@/pages/create-rentcard";
import ScreeningPage from "@/pages/screening-page";
import EditScreeningPage from "@/pages/edit-screening-page";
import PropertyScreeningEdit from "@/pages/property-screening-edit";
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
import ContactManagement from "@/pages/landlord/ContactManagement";

// Tenant Pages
import TenantDashboard from "@/pages/tenant/dashboard";
import TenantApplications from "@/pages/tenant/applications";
import TenantRentCard from "@/pages/tenant/rentcard";
import DocumentDashboard from "@/pages/tenant/documents";
import TenantReferences from "@/pages/tenant/references";
import ContactPreferences from "@/pages/tenant/ContactPreferences";
import ContactsPage from "@/pages/tenant/contacts";
import MessageTemplatesPage from "@/pages/tenant/message-templates";
import TenantReferralsPage from "@/pages/tenant/referrals";

// Shared/Public Pages
import SharedRentCard from "@/pages/shared-rentcard";

function Router() {
  return (
    <Switch>
      <Route path={ROUTES.HOME} component={HomePage} />
      <Route path={ROUTES.AUTH} component={AuthPage} />
      <Route path="/create-screening" component={ScreeningPage} />
      <Route path="/debug-auth" component={DebugAuthPage} />

      {/* Landlord Routes */}
      <ProtectedRoute path={ROUTES.LANDLORD.DASHBOARD} component={LandlordDashboard} />
      <ProtectedRoute path={ROUTES.LANDLORD.INTERESTS} component={LandlordApplications} />
      <ProtectedRoute path={ROUTES.LANDLORD.ADD_PROPERTY} component={AddProperty} />
      <ProtectedRoute path="/landlord/properties/:id/edit" component={AddProperty} />
      <ProtectedRoute path={ROUTES.LANDLORD.VERIFY_DOCUMENTS} component={VerifyDocumentsPage} />
      <ProtectedRoute path={ROUTES.LANDLORD.CONTACT_MANAGEMENT} component={ContactManagement} />
      <Route path="/landlord/screening/:slug" component={PropertyScreeningPage} />
      <ProtectedRoute path={ROUTES.LANDLORD.SCREENING} component={ScreeningManagement} />
      <Route path="/property/archived/:slug" component={ArchivedPropertyPage} />

      {/* Property Screening Pages */}
      <Route path="/screening/property/:slug/edit" component={PropertyScreeningEdit} />
      <Route path="/screening/property/:slug" component={PropertyScreeningPage} />
      
      {/* General Screening Page */}
      <Route path="/screening/general/:slug/edit" component={EditScreeningPage} />
      <Route path="/screening/:slug" component={GeneralScreeningPage} />

      {/* Sample Pages */}
      <Route path="/samples/rentcard" component={SampleRentCard} />
      <Route path="/samples/screening-page" component={SampleScreeningPage} />

      {/* Tenant Routes */}
      <ProtectedRoute path={ROUTES.TENANT.DASHBOARD} component={TenantDashboard} />
      <ProtectedRoute path={ROUTES.TENANT.INTERESTS} component={TenantApplications} />
      <ProtectedRoute path={ROUTES.TENANT.RENTCARD} component={TenantRentCard} />
      <ProtectedRoute path={ROUTES.TENANT.DOCUMENTS} component={DocumentDashboard} />
      <ProtectedRoute path={ROUTES.TENANT.REFERENCES} component={TenantReferences} />
      <ProtectedRoute path={ROUTES.TENANT.CONTACTS} component={ContactsPage} />
      <ProtectedRoute path={ROUTES.TENANT.MESSAGE_TEMPLATES} component={MessageTemplatesPage} />
      <ProtectedRoute path={ROUTES.TENANT.REFERRALS} component={TenantReferralsPage} />
      <ProtectedRoute path={ROUTES.TENANT.CONTACT_PREFERENCES} component={ContactPreferences} />
      <Route path="/create-rentcard" component={CreateRentCard} />
      <Route path="/rentcard/:slug" component={TenantRentCard} />
      
      {/* Public Shared RentCard Route */}
      <Route path="/rentcard/shared/:token" component={SharedRentCard} />

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


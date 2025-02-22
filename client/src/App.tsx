import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import CreateRentCard from "@/pages/create-rentcard";
import ScreeningPage from "@/pages/screening-page";
import { ProtectedRoute } from "./lib/protected-route";

// Sample Pages
import SampleRentCard from "@/pages/samples/rentcard";
import SampleScreeningPage from "@/pages/samples/screening-page";

// Landlord Pages
import LandlordDashboard from "@/pages/landlord/dashboard";
import LandlordApplications from "@/pages/landlord/applications";
import AddProperty from "@/pages/landlord/add-property";
import PropertyScreeningPage from "@/pages/landlord/screening-page";

// Tenant Pages
import TenantDashboard from "@/pages/tenant/dashboard";
import TenantRentCard from "@/pages/tenant/rentcard"; // Add import

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/create-screening" component={ScreeningPage} />

      {/* Landlord Routes */}
      <ProtectedRoute path="/landlord/dashboard" component={LandlordDashboard} />
      <ProtectedRoute path="/landlord/applications" component={LandlordApplications} />
      <ProtectedRoute path="/landlord/add-property" component={AddProperty} />
      <Route path="/landlord/screening/:slug" component={PropertyScreeningPage} />

      {/* Sample Pages */}
      <Route path="/samples/rentcard" component={SampleRentCard} />
      <Route path="/samples/screening-page" component={SampleScreeningPage} />

      {/* Tenant Routes */}
      <ProtectedRoute path="/tenant/dashboard" component={TenantDashboard} />
      <ProtectedRoute path="/tenant/rentcard" component={TenantRentCard} /> {/* Add protected route */}
      <Route path="/create-rentcard" component={CreateRentCard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
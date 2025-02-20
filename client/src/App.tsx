import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import HomePage from "@/pages/home-page";
import CreateRentCard from "@/pages/create-rentcard";
import { ProtectedRoute } from "./lib/protected-route";

// Landlord Pages
import LandlordDashboard from "@/pages/landlord/dashboard";
import LandlordApplications from "@/pages/landlord/applications";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />

        {/* Landlord Routes */}
        <ProtectedRoute path="/landlord/dashboard" component={LandlordDashboard} />
        <ProtectedRoute path="/landlord/applications" component={LandlordApplications} />

        {/* Sample Pages */}
        <Route path="/screening" component={() => <div>Screening Page</div>} />
        <Route path="/sample-rentcard" component={() => <div>Sample RentCard</div>} />
        <Route path="/sample-screening" component={() => <div>Sample Screening</div>} />

        {/* Tenant Routes */}
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <Route path="/create-rentcard" component={CreateRentCard} />

        <Route component={NotFound} />
      </Switch>
    </>
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
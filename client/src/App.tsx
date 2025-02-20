import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import HomePage from "@/pages/home-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/create-rentcard" component={() => <div>Create RentCard</div>} />
        <Route path="/screening" component={() => <div>Screening Page</div>} />
        <Route path="/sample-rentcard" component={() => <div>Sample RentCard</div>} />
        <Route path="/sample-screening" component={() => <div>Sample Screening</div>} />
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
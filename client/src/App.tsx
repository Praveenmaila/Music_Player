import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AudioProvider } from "@/lib/audio-context";
import { AppSidebar } from "@/components/app-sidebar";
import Home from "@/pages/home";
import Liked from "@/pages/liked";
import Admin from "@/pages/admin";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function PublicRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  const isAuthPage = location === "/login" || location === "/register";

  if (isAuthPage) {
    return (
      <Switch>
        <Route path="/login">
          <PublicRoute component={Login} />
        </Route>
        <Route path="/register">
          <PublicRoute component={Register} />
        </Route>
      </Switch>
    );
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        {isAuthenticated && <AppSidebar />}
        <div className="flex flex-col flex-1 overflow-hidden">
          {isAuthenticated && (
            <header className="flex items-center justify-between p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </header>
          )}
          <main className="flex-1 overflow-hidden">
            <Switch>
              <Route path="/">
                <ProtectedRoute component={Home} />
              </Route>
              <Route path="/liked">
                <ProtectedRoute component={Liked} />
              </Route>
              <Route path="/admin">
                <ProtectedRoute component={Admin} />
              </Route>
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AudioProvider>
            <AppContent />
          </AudioProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

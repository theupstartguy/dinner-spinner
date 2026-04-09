import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import { IngredientsProvider } from "@/context/IngredientsContext";
import SpinPage from "@/pages/spin";
import IngredientsPage from "@/pages/ingredients";
import RecipePage from "@/pages/recipe";
import ScanPage from "@/pages/scan";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={SpinPage} />
        <Route path="/ingredients" component={IngredientsPage} />
        <Route path="/recipe/:id" component={RecipePage} />
        <Route path="/scan" component={ScanPage} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <IngredientsProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </IngredientsProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

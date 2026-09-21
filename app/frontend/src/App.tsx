import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/lib/i18n';
import BlogRoutes from './blog-routes';
import Index from './pages/Index';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import Onboarding from './pages/Onboarding';
import Discover from './pages/Discover';
import ProfileView from './pages/ProfileView';
import Connections from './pages/Connections';
import MessagesPage from './pages/Messages';
import MyProfile from './pages/MyProfile';
import Subscription from './pages/Subscription';
// MODULE_IMPORTS_START
// MODULE_IMPORTS_END

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    {/* <Route path="/blog/*" element={<BlogRoutes />} /> */}
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth/error" element={<AuthError />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/discover" element={<Discover />} />
    <Route path="/profile/:userId" element={<ProfileView />} />
    <Route path="/connections" element={<Connections />} />
    <Route path="/messages" element={<MessagesPage />} />
    <Route path="/me" element={<MyProfile />} />
    <Route path="/subscription" element={<Subscription />} />
    {/* MODULE_ROUTES_START */}
    {/* MODULE_ROUTES_END */}
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* MODULE_PROVIDERS_START */}
    {/* MODULE_PROVIDERS_END */}
    <TooltipProvider>
      <Toaster />
      <LanguageProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
    {/* MODULE_PROVIDERS_CLOSE */}
  </QueryClientProvider>
);

export default App;
export { AppRoutes };

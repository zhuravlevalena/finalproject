import React, { useEffect } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { Navbar } from '@/widgets/navbar/ui/Navbar';
import NotFound from '@/pages/not-found/ui/NotFound';
import Home from '@/pages/home/ui/Home';
import Dashboard from '@/pages/dashboard/ui/Dashboard';
import CreateCard from '@/pages/create-card/ui/CreateCard';
import AICard from '@/pages/ai-card/ui/AICard';
import Login from '@/pages/login/ui/LoginPage';
import Register from '@/pages/register/ui/RegisterPage';
import AuthCallback from '@/pages/auth-callback/ui/AuthCallback';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks';
import { refreshThunk } from '@/entities/user/model/user.thunk';
import EditCard from '@/pages/edit-card/EditCard';

function Layout({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [location] = useLocation();
  const isAuthPage = location === '/login' || location === '/register';

  return (
    <div
      className={`${
        isAuthPage ? 'min-h-screen' : 'h-screen'
      } bg-background flex flex-col font-body selection:bg-primary/30 selection:text-white overflow-hidden`}
    >
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? 'flex-grow' : 'flex-1 overflow-y-auto'}>{children}</main>

      {!isAuthPage && (
        <footer className="py-4 text-center text-muted-foreground text-sm border-t border-border flex-shrink-0">
          <p>© {new Date().getFullYear()} AI-ассистент для карточек товаров. Все права защищены.</p>
        </footer>
      )}
    </div>
  );
}

export default function Router(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const isLogged = useAppSelector((store) => !!store.user.user);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    void dispatch(refreshThunk());
  }, [dispatch]);

  useEffect(() => {
    if (isLogged && (location === '/login' || location === '/register')) {
      setLocation('/');
    }
  }, [isLogged, location, setLocation]);

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard">{isLogged ? <Dashboard /> : <Login />}</Route>
        <Route path="/create-card">{isLogged ? <CreateCard /> : <Login />}</Route>
        <Route path="/ai-card">{isLogged ? <AICard /> : <Login />}</Route>
        <Route path="/edit-card/:id">{isLogged ? <EditCard /> : <Login />}</Route>
        <Route path="/login">{!isLogged ? <Login /> : null}</Route>
        <Route path="/register">{!isLogged ? <Register /> : null}</Route>
        <Route path="/auth/callback" component={AuthCallback} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

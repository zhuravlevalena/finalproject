import React from 'react';
import { useAuth } from '@/shared/hooks/use-auth';
import { Button } from '@/shared/ui/button';
import { useLocation } from 'wouter';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home(): React.JSX.Element {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (user && !isAuthLoading) {
      setLocation('/dashboard');
    }
  }, [user, isAuthLoading, setLocation]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />

        <div className="relative z-10 max-w-4xl text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-black to-black/50 mb-4 tracking-tighter drop-shadow-2xl">
              Cardify
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Создавайте профессиональные карточки товаров для маркетплейсов
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center relative z-10"
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLocation('/login');
              }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Начать работу
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}

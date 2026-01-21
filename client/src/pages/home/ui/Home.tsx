import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/use-auth';
import { Button } from '@/shared/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

export default function Home(): React.JSX.Element {
  const [isDark, setIsDark] = useState(false);
  const { isLoading: isAuthLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = (): void => setIsDark(root.classList.contains('dark'));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />

      <div className="relative z-10 max-w-6xl text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-8xl font-display font-bold mb-4 tracking-tighter drop-shadow-2xl dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]">
            {isDark ? (
              <span className="text-white">Cardify</span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-black/50">
                Cardify
              </span>
            )}
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
            onClick={() => {
              if (user) {
                setLocation('/create-card');
              } else {
                setLocation('/login');
              }
            }}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Начать работу
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-20 flex justify-center"
        >
          <div className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-lg max-w-4xl w-full">
            <img
              src="/примеры!.jpg"
              alt="Примеры карточек товаров"
              className="w-full h-auto object-contain"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import RegisterForm from '@/features/auth/register/ui/RegisterForm';
import React from 'react';
import { motion } from 'framer-motion';

export default function RegisterPage(): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/50 mb-2 tracking-tighter">
            Регистрация
          </h1>
          <p className="text-muted-foreground">
            Присоединяйтесь к игре и начните свой путь к победе
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <RegisterForm />
        </motion.div>
      </div>
    </div>
  );
}

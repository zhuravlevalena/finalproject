import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { updateProfileThunk } from '@/entities/user/model/user.thunk';

export default function SettingsPage(): React.JSX.Element {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setBirthDate(user.birthDate ?? '');
    setGender(user.gender ?? '');
    setPhone(user.phone ?? '');
  }, [user]);

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const action = await dispatch(
        updateProfileThunk({
          name: name.trim() || undefined,
          birthDate: birthDate || null,
          gender: gender || null,
          phone: phone || null,
          email: email.trim() || undefined,
        }),
      );

      if (updateProfileThunk.fulfilled.match(action)) {
        setSuccess('Профиль успешно обновлён');
      } else {
        const payload = action.payload as { error?: string } | null | undefined;
        const message =
          payload?.error ??
          (action.error.message ? action.error.message : 'Не удалось обновить профиль');
        setError(message);
      }
    } catch (updateError) {
      const message =
        updateError instanceof Error ? updateError.message : 'Не удалось обновить профиль';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">Настройки профиля</h1>
        <p className="text-muted-foreground">Чтобы настроить профиль, войдите в аккаунт.</p>
      </div>
    );
  }

  const userInitial = (user.name ?? user.email ?? 'U').charAt(0).toUpperCase();

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Card className="p-6 sm:p-8 space-y-6">
        {/* Шапка профиля */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center text-2xl font-semibold text-white shadow-lg">
            {userInitial}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Настройки профиля</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Обновите личные данные, чтобы мы лучше подстраивались под вас
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Имя</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Дата рождения</label>
          <input
            type="date"
            value={birthDate ?? ''}
            onChange={(event) => setBirthDate(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Пол</label>
          <select
            value={gender ?? ''}
            onChange={(event) => setGender(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Не указан</option>
            <option value="female">Женский</option>
            <option value="male">Мужской</option>
            <option value="other">Другое</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Номер телефона</label>
          <input
            type="tel"
            value={phone ?? ''}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="+7 ..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-emerald-500">{success}</p>}

          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? 'Сохраняем...' : 'Сохранить изменения'}
          </Button>
        </form>
      </Card>
    </div>
  );
}


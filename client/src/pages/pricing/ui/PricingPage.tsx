import React from 'react';
import { Button } from '@/shared/ui/button';
import { useLocation } from 'wouter';

type BillingCycle = 'monthly' | 'yearly';

type PlanFeature = {
  label: string;
  included: boolean;
};

type PlanSection = {
  title?: string;
  items: PlanFeature[];
};

type Plan = {
  id: string;
  name: string;
  price: number;
  downloads: string;
  buttonLabel: string;
  highlight?: boolean;
  badge?: string;
  photoGenerations?: string;
  videoGenerations?: string;
  massExport?: boolean;
  sections: PlanSection[];
};

const plans: Plan[] = [
  {
    id: 'demo',
    name: 'demo',
    price: 0,
    downloads: '3 скачивания',
    buttonLabel: 'Попробовать',
    sections: [
      { items: [{ label: 'Коммерческое использование', included: false }] },
      {
        title: 'Безлимитный доступ к нейросетям:',
        items: [
          { label: 'изменение фона', included: false },
          { label: 'ИИ-инфографика', included: false },
          { label: 'улучшение фото', included: false },
          { label: 'генератор картинок', included: false },
          { label: 'замена лица', included: false },
        ],
      },
    ],
  },
  {
    id: 'start',
    name: 'start',
    price: 590,
    downloads: '200 скачиваний',
    buttonLabel: 'Перейти',
    highlight: true,
    badge: 'популярный',
    photoGenerations: '150 генераций в ИИ-фотошопе',
    sections: [
      { items: [{ label: 'Коммерческое использование', included: true }] },
      {
        title: 'Безлимитный доступ к нейросетям:',
        items: [
          { label: 'изменение фона', included: true },
          { label: 'ИИ-инфографика', included: true },
          { label: 'улучшение фото', included: true },
          { label: 'генератор картинок', included: true },
          { label: 'замена лица', included: true },
        ],
      },
    ],
  },
  {
    id: 'medium',
    name: 'medium',
    price: 990,
    downloads: '700 скачиваний',
    buttonLabel: 'Перейти',
    photoGenerations: '330 генераций в ИИ-фотошопе',
    videoGenerations: '10 генераций видеообложек',
    sections: [
      { items: [{ label: 'Коммерческое использование', included: true }] },
      {
        title: 'Безлимитный доступ к нейросетям:',
        items: [
          { label: 'изменение фона', included: true },
          { label: 'ИИ-инфографика', included: true },
          { label: 'улучшение фото', included: true },
          { label: 'генератор картинок', included: true },
          { label: 'замена лица', included: true },
        ],
      },
    ],
  },
  {
    id: 'premium',
    name: 'premium',
    price: 1990,
    downloads: '3000 скачиваний',
    buttonLabel: 'Перейти',
    photoGenerations: '1250 генераций в ИИ-фотошопе',
    videoGenerations: '30 генераций видеообложек',
    massExport: true,
    sections: [
      { items: [{ label: 'Коммерческое использование', included: true }] },
      {
        title: 'Безлимитный доступ к нейросетям:',
        items: [
          { label: 'изменение фона', included: true },
          { label: 'ИИ-инфографика', included: true },
          { label: 'улучшение фото', included: true },
          { label: 'генератор картинок', included: true },
          { label: 'замена лица', included: true },
        ],
      },
    ],
  },
];

function formatPrice(price: number, billing: BillingCycle): string {
  if (billing === 'monthly') {
    return price === 0 ? '0 ₽ / в месяц' : `${price.toLocaleString('ru-RU')} ₽ / в месяц`;
  }

  const discountedMonthly = Math.round(price * 0.8);
  return price === 0
    ? '0 ₽ / в месяц'
    : `${discountedMonthly.toLocaleString('ru-RU')} ₽ / в месяц`;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function PaymentModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}): React.JSX.Element | null {
  const [secondsLeft, setSecondsLeft] = React.useState(9 * 60 + 44);
  const [phase, setPhase] = React.useState<'methods' | 'processing' | 'success'>('methods');
  const [selected, setSelected] = React.useState<string | null>(null);
  const [mockReceipt, setMockReceipt] = React.useState<{
    id: string;
    amount: string;
    method: string;
  } | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(9 * 60 + 44);
    setPhase('methods');
    setSelected(null);
    setMockReceipt(null);
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { title: 'SberPay', subtitle: 'Оплата для клиентов Сбера', badge: 'S' },
    { title: 'Банковская карта', subtitle: 'Сохранённая или новая', badge: '💳' },
    { title: 'T-Pay', subtitle: 'Приложение Т-Банк', badge: 'T' },
    { title: 'СБП', subtitle: 'Приложение вашего банка', badge: '⚡' },
  ];

  const handlePay = (method: string) => {
    setSelected(method);
    setPhase('processing');
    window.setTimeout(() => {
      setMockReceipt({
        id: `PAY-${Math.floor(Math.random() * 900000 + 100000)}`,
        amount: '1 390 ₽',
        method,
      });
      setPhase('success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-[#12141a] border border-white/10 shadow-2xl overflow-hidden">
          <div className="relative px-6 py-4 border-b border-white/10">
            <p className="text-center text-white/70">
              Завершите платёж в течение{' '}
              <span className="text-white font-semibold">{formatCountdown(secondsLeft)}</span>
            </p>
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-4">
            {phase === 'methods' &&
              items.map((it) => (
                <button
                  key={it.title}
                  className="w-full flex items-center justify-between gap-4 rounded-2xl bg-white text-black px-5 py-4 hover:opacity-95 transition"
                  onClick={() => handlePay(it.title)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-lg">
                      {it.badge}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-lg leading-tight">{it.title}</p>
                      <p className="text-black/60 text-sm">{it.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-black/40 text-2xl leading-none">›</span>
                </button>
              ))}

            {phase === 'processing' && (
              <div className="w-full rounded-2xl bg-white text-black px-5 py-6 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                <p className="text-lg font-semibold">Создаем платёж...</p>
                <p className="text-black/60 text-sm">
                  Метод: <span className="font-medium">{selected}</span>
                </p>
              </div>
            )}

            {phase === 'success' && mockReceipt && (
              <div className="w-full rounded-2xl bg-white text-black px-5 py-6 flex flex-col gap-2">
                <p className="text-lg font-semibold text-emerald-700">Платёж создан</p>
                <p className="text-sm text-black/70">Номер: {mockReceipt.id}</p>
                <p className="text-sm text-black/70">Метод: {mockReceipt.method}</p>
                <p className="text-sm text-black/70">Сумма: {mockReceipt.amount}</p>
                <div className="pt-2">
                  <Button
                    size="md"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={onClose}
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-2 text-center">
              <p className="text-white/55 text-sm">
                Заплатив, вы соглашаетесь с{' '}
                <span className="underline underline-offset-4">условиями сервиса</span>
              </p>
              <p className="text-white/35 text-xs mt-3"></p>
              <p className="text-white/60 font-semibold tracking-wide"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage(): React.JSX.Element {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>('monthly');
  const [, setLocation] = useLocation();
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#0f1115] text-white px-4 py-12">
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">Тарифы</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">Подберите подходящий план</h1>
            <p className="text-white/60 mt-3 max-w-2xl">
              Доступ ко всем инструментам для создания карточек товаров. Переключайтесь между
              помесячной и годовой оплатой с выгодой 20% при оплате за год.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-2 py-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                billingCycle === 'monthly' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
              }`}
            >
              Месяц
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                billingCycle === 'yearly' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
              }`}
            >
              Год
            </button>
            <span className="text-xs font-semibold text-emerald-300 bg-emerald-300/10 border border-emerald-300/30 rounded-full px-3 py-1">
              -20%
            </span>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl border border-white/10 p-8 flex flex-col gap-6 ${
                plan.highlight ? 'bg-gradient-to-b from-emerald-900/80 to-emerald-900/40' : 'bg-white/5'
              }`}
            >
              {plan.badge ? (
                <div className="absolute -top-3 right-4 bg-white text-black text-xs font-semibold rounded-full px-4 py-2 shadow-lg">
                  {plan.badge}
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="uppercase tracking-[0.2em] text-white/60 text-xs">{plan.id}</p>
                <p className="text-2xl font-semibold">{formatPrice(plan.price, billingCycle)}</p>
              </div>

              <Button
                variant="ghost"
                className={`w-full h-12 rounded-xl font-semibold ${
                  plan.highlight
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                onClick={() => {
                  if (plan.id === 'demo') {
                    setLocation('/create-card');
                    return;
                  }
                  setIsPaymentOpen(true);
                }}
              >
                {plan.buttonLabel}
              </Button>

              <div className="h-px bg-white/10" />

              <div className="space-y-3 text-sm">
                <p className="font-semibold">{plan.downloads}</p>
                {plan.sections.map((section, idx) => (
                  <div key={`${plan.id}-${idx}`} className="space-y-2">
                    {section.title ? <p className="text-sm font-semibold">{section.title}</p> : null}
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li
                          key={item.label}
                          className={`flex items-center gap-2 ${
                            item.included ? 'text-white' : 'text-white/45'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.included ? 'bg-emerald-400' : 'bg-white/30'
                            }`}
                          />
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {(plan.photoGenerations ?? plan.videoGenerations ?? plan.massExport) && (
                  <div className="space-y-2 pt-2">
                    <p className="font-semibold">Генерации фотоворонок</p>
                    {plan.photoGenerations ? <p>{plan.photoGenerations}</p> : null}
                    {plan.videoGenerations ? <p>{plan.videoGenerations}</p> : null}
                    <p className={plan.massExport ? undefined : 'text-white/45'}>
                      Массовый экспорт {plan.massExport ? '' : '(недоступно)'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

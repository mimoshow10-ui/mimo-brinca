'use client';

import { CreditCard, Percent, Truck, ShieldCheck, Sparkles } from 'lucide-react';

export default function BenefitsBar() {
  const diferenciais = [
    {
      icon: CreditCard,
      titulo: 'ATÉ 4X SEM JUROS',
      subtitulo: 'Em todos os cartões!',
      iconColor: 'text-amber-500',
      boxBg: 'bg-amber-50/90 border-amber-200',
      badgeBg: 'bg-amber-100',
    },
    {
      icon: Percent,
      titulo: '5% OFF NO PIX',
      subtitulo: 'Desconto direto na hora',
      iconColor: 'text-emerald-600',
      boxBg: 'bg-emerald-50/90 border-emerald-200',
      badgeBg: 'bg-emerald-100',
    },
    {
      icon: Truck,
      titulo: 'FRETE RÁPIDO',
      subtitulo: 'Enviamos para todo o Brasil',
      iconColor: 'text-sky-600',
      boxBg: 'bg-sky-50/90 border-sky-200',
      badgeBg: 'bg-sky-100',
    },
    {
      icon: ShieldCheck,
      titulo: 'COMPRA 100% SEGURA',
      subtitulo: 'Garantia e proteção total',
      iconColor: 'text-pink-600',
      boxBg: 'bg-pink-50/90 border-pink-200',
      badgeBg: 'bg-pink-100',
    },
  ];

  return (
    <div className="w-full bg-white border-y border-gray-100 py-5 px-4 shadow-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {diferenciais.map((item, index) => {
          const Icone = item.icon;
          return (
            <div
              key={index}
              className={`flex items-center gap-3.5 p-3.5 rounded-2xl ${item.boxBg} border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer`}
            >
              <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-2xs ${item.iconColor}`}>
                <Icone size={24} strokeWidth={2.4} />
              </div>
              <div>
                <h4 className="font-heading font-black text-xs md:text-sm text-slate-800 uppercase tracking-tight leading-tight flex items-center gap-1">
                  {item.titulo}
                </h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight">
                  {item.subtitulo}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

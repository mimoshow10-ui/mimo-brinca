'use client';

import { CreditCard, Percent, Truck, ShieldCheck, Sparkles } from 'lucide-react';

export default function BenefitsBar() {
  const diferenciais = [
    {
      icon: CreditCard,
      titulo: 'ATÉ 4X SEM JUROS',
      subtitulo: 'Em todos os cartões!',
      bgGradient: 'from-amber-400 to-orange-500',
      iconColor: 'text-amber-600',
      boxBg: 'bg-amber-50 border-amber-200/80',
    },
    {
      icon: Percent,
      titulo: '5% OFF NO PIX',
      subtitulo: 'Desconto direto na hora',
      bgGradient: 'from-emerald-400 to-teal-500',
      iconColor: 'text-emerald-600',
      boxBg: 'bg-emerald-50 border-emerald-200/80',
    },
    {
      icon: Truck,
      titulo: 'FRETE RÁPIDO',
      subtitulo: 'Enviamos para todo o Brasil',
      bgGradient: 'from-blue-400 to-indigo-500',
      iconColor: 'text-blue-600',
      boxBg: 'bg-blue-50 border-blue-200/80',
    },
    {
      icon: ShieldCheck,
      titulo: 'COMPRA 100% SEGURA',
      subtitulo: 'Garantia e proteção total',
      bgGradient: 'from-purple-400 to-pink-500',
      iconColor: 'text-purple-600',
      boxBg: 'bg-purple-50 border-purple-200/80',
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

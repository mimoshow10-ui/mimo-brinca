'use client';

import Link from 'next/link';

const CATEGORIAS_MIMO = [
  {
    nome: 'Brinquedos',
    emoji: '🎾',
    slug: 'adesivos', // ou categoria cadastrada
    bgGradient: 'from-amber-400 to-orange-500',
    shadowColor: 'shadow-orange-200',
  },
  {
    nome: 'Gravatinhas',
    emoji: '👔',
    slug: 'gravatinhas',
    bgGradient: 'from-sky-400 to-blue-600',
    shadowColor: 'shadow-blue-200',
  },
  {
    nome: 'Lacinhos',
    emoji: '🎀',
    slug: 'lacinhos',
    bgGradient: 'from-pink-400 to-rose-500',
    shadowColor: 'shadow-rose-200',
  },
  {
    nome: 'Bandanas',
    emoji: '🩲',
    slug: 'bandanas',
    bgGradient: 'from-purple-400 to-indigo-600',
    shadowColor: 'shadow-purple-200',
  },
  {
    nome: 'Gargantilhas',
    emoji: '📿',
    slug: 'gargantilhas',
    bgGradient: 'from-emerald-400 to-teal-600',
    shadowColor: 'shadow-emerald-200',
  },
  {
    nome: 'Colarinhos',
    emoji: '🐾',
    slug: 'colarinhos',
    bgGradient: 'from-fuchsia-400 to-pink-600',
    shadowColor: 'shadow-fuchsia-200',
  },
];

export default function ColorfulCategoryGrid() {
  return (
    <section className="w-full py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-heading font-black text-slate-800 flex items-center gap-2">
            <span>✨ Navegue por Categorias</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">Escolha seu mimo favorito</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4">
          {CATEGORIAS_MIMO.map((cat, idx) => (
            <Link
              key={idx}
              href={`/categoria/${cat.slug}`}
              className="group flex flex-col items-center justify-center p-3.5 bg-white rounded-3xl border border-slate-100 shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${cat.bgGradient} flex items-center justify-center text-2xl md:text-3xl shadow-md ${cat.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                <span>{cat.emoji}</span>
              </div>
              <span className="font-heading font-bold text-xs md:text-sm text-slate-800 mt-2.5 text-center group-hover:text-primary transition-colors">
                {cat.nome}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

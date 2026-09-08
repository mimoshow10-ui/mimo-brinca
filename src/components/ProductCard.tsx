'use client';

import Link from 'next/link';
import CountdownTimer from './CountdownTimer';
import { extractImageUrls } from './ProductMediaGallery';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { hasValidPhoto } from '@/lib/productFilter';

interface ProdutoCardProps {
  produto: {
    id: string;
    nome: string;
    slug: string;
    preco: number;
    preco_promocional?: number | null;
    promocao_expira_em?: string | null;
    imagens?: any;
    codigo_barras?: string | null;
    sku?: string | null;
  };
}

export default function ProductCard({ produto }: ProdutoCardProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError || !hasValidPhoto(produto)) return null;

  const fotos = extractImageUrls(produto.imagens);
  let foto = fotos[0] || null;
  if (foto && foto.startsWith('http://')) {
    foto = foto.replace(/^http:\/\//i, 'https://');
  }
  const sku = produto.codigo_barras || produto.sku || null;

  const precoNormal = Number(produto.preco || 0);
  const temPromo =
    produto.preco_promocional && Number(produto.preco_promocional) < precoNormal;
  const precoPromo = temPromo ? Number(produto.preco_promocional) : null;
  const pctDesconto = temPromo && precoNormal > 0
    ? Math.round(((precoNormal - precoPromo!) / precoNormal) * 100)
    : 0;

  const agora = Date.now();
  const expiraTime = produto.promocao_expira_em ? new Date(produto.promocao_expira_em).getTime() : null;
  const timerAtivo = temPromo && expiraTime !== null && !isNaN(expiraTime) && expiraTime > agora;

  return (
    <div className="flex flex-col bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group hover:-translate-y-1">
      {/* Imagem do Produto com Badge de Desconto e Badge de SKU */}
      <Link href={`/produto/${produto.slug}`} className="block relative">
        <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center p-3">
          <img
            src={foto || ''}
            alt={produto.nome || 'Produto Mimo Brinca'}
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
            onError={() => setImageError(true)}
          />

          {/* Badge de SKU no canto inferior */}
          {sku && (
            <span className="absolute bottom-2 left-2 bg-slate-900/75 backdrop-blur-xs text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-xs z-10 pointer-events-none uppercase">
              SKU: {sku}
            </span>
          )}

          {/* Badge Desconto Vibrante */}
          {temPromo && pctDesconto > 0 && (
            <span className="absolute top-2.5 right-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-md z-10 animate-bounce">
              -{pctDesconto}% OFF
            </span>
          )}
        </div>
      </Link>

      {/* Conteúdo do Card */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-white">
        <div>
          <Link href={`/produto/${produto.slug}`}>
            <h3 className="font-heading font-bold text-xs md:text-sm line-clamp-2 hover:text-primary transition-colors text-slate-800 leading-snug">
              {produto.nome}
            </h3>
          </Link>
        </div>

        <div className="mt-auto space-y-2.5">
          {/* Preço Cheio x Preço com Desconto */}
          {temPromo && precoPromo !== null ? (
            <div>
              <span className="text-xs text-slate-400 line-through font-medium block">
                R$ {precoNormal.toFixed(2).replace('.', ',')}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl md:text-2xl font-heading font-black text-primary">
                  R$ {precoPromo.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  Economize!
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xl md:text-2xl font-heading font-black text-slate-900 block">
              R$ {precoNormal.toFixed(2).replace('.', ',')}
            </span>
          )}

          {/* Timer de Validade Promocional */}
          {timerAtivo && (
            <div className="pt-1.5 border-t border-amber-100">
              <CountdownTimer targetDate={produto.promocao_expira_em!} />
            </div>
          )}

          {/* Botão Ver Produto com gradiente e efeito hover */}
          <Link
            href={`/produto/${produto.slug}`}
            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] hover:from-[#e55925] hover:to-[#FF6B35] text-white py-2.5 rounded-2xl font-bold transition-all duration-300 text-xs flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md cursor-pointer group-hover:bg-vibrant-gradient"
          >
            <ShoppingBag size={15} />
            <span>Ver Produto</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

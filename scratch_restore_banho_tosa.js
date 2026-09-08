const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://dehtqlcevoheqajejjcv.supabase.co', 'sb_publishable_jwcOkSMB6YQAF1lJc3885w_--sghFSx');

async function restoreBanhoTosa() {
  console.log('--- Restaurando Estrutura e Produtos do Banho & Tosa Pet ---');

  // 1. Cadastrar categorias do Banho & Tosa
  const CATEGORIAS_BANHO_TOSA = [
    { nome: 'Adesivos Pet', slug: 'adesivos' },
    { nome: 'Gravatinhas', slug: 'gravatinhas' },
    { nome: 'Lacinhos', slug: 'lacinhos' },
    { nome: 'Bandanas', slug: 'bandanas' },
    { nome: 'Gargantilhas', slug: 'gargantilhas' },
    { nome: 'Colarinhos', slug: 'colarinhos' },
  ];

  for (const cat of CATEGORIAS_BANHO_TOSA) {
    await supabase.from('categorias').upsert({
      nome: cat.nome,
      slug: cat.slug,
      parent_id: null
    }, { onConflict: 'slug' });
  }
  console.log('✅ Categorias do Banho & Tosa criadas com sucesso!');

  // Buscar IDs das categorias do Banho & Tosa
  const { data: catDb } = await supabase.from('categorias').select('id, slug, nome');
  const catMap = new Map();
  (catDb || []).forEach(c => catMap.set(c.slug, c.id));

  function getBanhoTosaCatId(nome) {
    const n = nome.toLowerCase();
    if (n.includes('adesivo')) return catMap.get('adesivos');
    if (n.includes('gravat')) return catMap.get('gravatinhas');
    if (n.includes('lacin') || n.includes('laço') || n.includes('lacinho')) return catMap.get('lacinhos');
    if (n.includes('bandan')) return catMap.get('bandanas');
    if (n.includes('gargantilha')) return catMap.get('gargantilhas');
    if (n.includes('colarinho')) return catMap.get('colarinhos');
    return catMap.get('adesivos');
  }

  // 2. Token do Bling
  const { data: cfgTokens } = await supabase.from('configuracoes').select('*').eq('chave', 'bling_tokens').single();
  const { data: cfgCreds } = await supabase.from('configuracoes').select('*').eq('chave', 'bling_credentials').single();

  const tokenData = cfgTokens?.valor;
  const credsData = cfgCreds?.valor;

  if (!tokenData?.refresh_token || !credsData?.client_id || !credsData?.client_secret) {
    console.error('Credenciais do Bling ausentes');
    return;
  }

  const credentials = Buffer.from(`${credsData.client_id}:${credsData.client_secret}`).toString('base64');
  const tokenRes = await fetch('https://api.bling.com.br/Api/v3/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token,
    }),
  });

  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;
  if (!accessToken) return;

  await supabase.from('configuracoes').upsert({ chave: 'bling_tokens', valor: tokenJson }, { onConflict: 'chave' });

  // 3. Buscar produtos Pet do Bling para o Banho & Tosa
  let pagina = 1;
  let restaurados = 0;

  while (pagina <= 25) {
    const listRes = await fetch(`https://api.bling.com.br/Api/v3/produtos?pagina=${pagina}&limite=100`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!listRes.ok) break;

    const listJson = await listRes.json();
    const prods = listJson.data || [];
    if (prods.length === 0) break;

    for (const item of prods) {
      const nome = item.nome || '';
      const nLower = nome.toLowerCase();

      // Produtos do Banho e Tosa (gargantilhas, adesivos pet, gravatas, bandanas, colarinhos, etc.)
      const ePet = nLower.includes('gargantilha') || nLower.includes('pet shop') || nLower.includes('cão') || nLower.includes('gato') || nLower.includes('adesivo') || nLower.includes('gravata') || nLower.includes('bandana') || nLower.includes('colarinho') || nLower.includes('lacinho');
      const eKids = nLower.includes('máscara') || nLower.includes('mascara') || nLower.includes('relógio') || nLower.includes('relogio') || nLower.includes('quadro decorativo') || nLower.includes('quebra cabeça');

      if (ePet && !eKids) {
        let preco = Number(item.preco || item.precoVenda || 0);
        let fotos = [];

        try {
          const detailRes = await fetch(`https://api.bling.com.br/Api/v3/produtos/${item.id}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (detailRes.ok) {
            const detailJson = await detailRes.json();
            const detailProd = detailJson.data;
            if (detailProd) {
              if (!preco && detailProd.preco) preco = Number(detailProd.preco);
              const ext = detailProd.midia?.imagens?.externas?.map(i => i.link) || [];
              const int = detailProd.midia?.imagens?.internas?.map(i => i.link) || [];
              fotos = [...ext, ...int];
            }
          }
        } catch {}

        const sku = item.codigo || `BLING-PET-${item.id}`;
        const slug = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-pet-${item.id}`;

        const payload = {
          bling_id: String(item.id),
          nome: nome,
          slug: slug,
          codigo_barras: sku,
          preco: preco || 29.90,
          categoria_id: getBanhoTosaCatId(nome),
          marca: 'Banho & Tosa',
          imagens: fotos,
          ativo: true,
          criado_em: new Date().toISOString()
        };

        const { error } = await supabase.from('produtos').upsert(payload, { onConflict: 'bling_id' });
        if (!error) {
          restaurados++;
          console.log(`  🐶 [${restaurados}] Restaurado para Banho & Tosa: ${nome}`);
        }
      }
    }

    pagina++;
  }

  console.log(`🎉 Restauração concluída! ${restaurados} produtos do Banho & Tosa restaurados.`);
}

restoreBanhoTosa();

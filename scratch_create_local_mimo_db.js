const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://dehtqlcevoheqajejjcv.supabase.co', 'sb_publishable_jwcOkSMB6YQAF1lJc3885w_--sghFSx');

const CATEGORIAS_MIMO_BRINCA = [
  {
    id: 'cat-mascaras',
    nome: 'Máscaras',
    slug: 'mascaras',
    parent_id: null,
    subgrupos: [
      { id: 'sub-mascaras-eva', nome: 'EVA', slug: 'mascaras-eva' },
      { id: 'sub-mascaras-parana', nome: 'Papel Paraná', slug: 'mascaras-papel-parana' },
    ]
  },
  {
    id: 'cat-brinquedos',
    nome: 'Brinquedos',
    slug: 'brinquedos',
    parent_id: null,
    subgrupos: [
      { id: 'sub-brinquedo-parana', nome: 'Brinquedo Papel Paraná', slug: 'brinquedo-papel-parana' },
      { id: 'sub-brinquedos-eva', nome: 'EVA', slug: 'brinquedos-eva' },
      { id: 'sub-brinquedos-parana', nome: 'Papel Paraná', slug: 'brinquedos-papel-parana' },
    ]
  },
  {
    id: 'cat-quebra-cabecas',
    nome: 'Quebra-Cabeças',
    slug: 'quebra-cabecas',
    parent_id: null,
    subgrupos: [
      { id: 'sub-quebra-mdf', nome: 'Quebra-Cabeça MDF', slug: 'quebra-cabeca-mdf' },
      { id: 'sub-quebra-parana', nome: 'Papel Paraná', slug: 'quebra-cabeca-papel-parana' },
      { id: 'sub-quebra-eva', nome: 'EVA', slug: 'quebra-cabeca-eva' },
    ]
  },
  {
    id: 'cat-tiaras-bolsas',
    nome: 'Tiaras e Bolsas',
    slug: 'tiaras-e-bolsas',
    parent_id: null,
    subgrupos: [
      { id: 'sub-tiaras', nome: 'Tiaras', slug: 'tiaras' },
      { id: 'sub-bolsas', nome: 'Bolsas', slug: 'bolsas' },
      { id: 'sub-tiaras-eva', nome: 'EVA', slug: 'tiaras-bolsas-eva' },
      { id: 'sub-tiaras-parana', nome: 'Papel Paraná', slug: 'tiaras-bolsas-papel-parana' },
    ]
  },
  {
    id: 'cat-decoracao',
    nome: 'Decoração',
    slug: 'decoracao',
    parent_id: null,
    subgrupos: [
      { id: 'sub-quadros', nome: 'Quadros', slug: 'quadros' },
      { id: 'sub-relogios', nome: 'Relógios', slug: 'relogios' },
    ]
  }
];

async function generateLocalDb() {
  console.log('--- Gerando banco local isolado em JSON para o Mimo Brinca ---');

  // Token do Bling
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

  function getCategoriaId(nomeProduto) {
    const nomeLower = nomeProduto.toLowerCase();
    if (nomeLower.includes('mascara') || nomeLower.includes('máscara')) return 'cat-mascaras';
    if (nomeLower.includes('quebra') || nomeLower.includes('puzzle')) return 'cat-quebra-cabecas';
    if (nomeLower.includes('tiara') || nomeLower.includes('bolsa')) return 'cat-tiaras-bolsas';
    if (nomeLower.includes('quadro') || nomeLower.includes('relogio') || nomeLower.includes('relógio')) return 'cat-decoracao';
    if (nomeLower.includes('brinquedo') || nomeLower.includes('jogo')) return 'cat-brinquedos';
    return 'cat-brinquedos';
  }

  let pagina = 1;
  let produtosLocais = [];

  while (pagina <= 30) {
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

      const eKids = nLower.includes('máscara') || nLower.includes('mascara') || nLower.includes('relógio') || nLower.includes('relogio') || nLower.includes('quadro decorativo') || nLower.includes('quebra cabeça') || nLower.includes('tiara') || nLower.includes('bolsa') || nLower.includes('brinquedo');

      if (eKids) {
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

        const sku = item.codigo || `BLING-MIMO-${item.id}`;
        const slug = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${item.id}`;

        produtosLocais.push({
          id: String(item.id),
          bling_id: String(item.id),
          nome: nome,
          slug: slug,
          codigo_barras: sku,
          sku: sku,
          preco: preco || 29.90,
          categoria_id: getCategoriaId(nome),
          marca: 'Mimo Brinca',
          imagens: fotos,
          ativo: true,
          criado_em: new Date().toISOString()
        });
      }
    }

    pagina++;
  }

  const dataDir = path.join(__dirname, 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(path.join(dataDir, 'categorias.json'), JSON.stringify(CATEGORIAS_MIMO_BRINCA, null, 2));
  fs.writeFileSync(path.join(dataDir, 'produtos.json'), JSON.stringify(produtosLocais, null, 2));

  console.log(`✅ Banco local do Mimo Brinca gerado em src/data/ !`);
  console.log(`Total de produtos salvos localmente: ${produtosLocais.length}`);
}

generateLocalDb();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://dehtqlcevoheqajejjcv.supabase.co', 'sb_publishable_jwcOkSMB6YQAF1lJc3885w_--sghFSx');

async function importFromBling() {
  console.log('--- Iniciando Importação Filtrada do Bling ---');

  // 1. Obter novo token
  const { data: cfgTokens } = await supabase.from('configuracoes').select('*').eq('chave', 'bling_tokens').single();
  const { data: cfgCreds } = await supabase.from('configuracoes').select('*').eq('chave', 'bling_credentials').single();

  const tokenData = cfgTokens?.valor;
  const credsData = cfgCreds?.valor;

  if (!tokenData?.refresh_token || !credsData?.client_id || !credsData?.client_secret) {
    console.error('Credenciais ou tokens do Bling não configurados.');
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
  if (!tokenRes.ok || !tokenJson.access_token) {
    console.error('Falha ao atualizar token Bling:', tokenJson);
    return;
  }

  const accessToken = tokenJson.access_token;
  await supabase.from('configuracoes').upsert({
    chave: 'bling_tokens',
    valor: tokenJson,
  }, { onConflict: 'chave' });

  console.log('✅ Token Bling atualizado com sucesso!');

  // 2. Buscar mapa de categorias no Supabase
  const { data: categoriasDb } = await supabase.from('categorias').select('id, nome, slug, parent_id');
  const catMap = new Map();
  (categoriasDb || []).forEach(c => {
    catMap.set(c.slug, c.id);
    catMap.set(c.nome.toLowerCase(), c.id);
  });

  function getCategoriaId(nomeProduto) {
    const nomeLower = nomeProduto.toLowerCase();
    if (nomeLower.includes('mascara') || nomeLower.includes('máscara')) {
      if (nomeLower.includes('eva')) return catMap.get('mascaras-eva') || catMap.get('mascaras');
      if (nomeLower.includes('paraná') || nomeLower.includes('parana')) return catMap.get('mascaras-papel-parana') || catMap.get('mascaras');
      return catMap.get('mascaras');
    }
    if (nomeLower.includes('quebra') || nomeLower.includes('puzzle')) {
      if (nomeLower.includes('mdf')) return catMap.get('quebra-cabeca-mdf') || catMap.get('quebra-cabecas');
      if (nomeLower.includes('paraná') || nomeLower.includes('parana')) return catMap.get('quebra-cabeca-papel-parana') || catMap.get('quebra-cabecas');
      if (nomeLower.includes('eva')) return catMap.get('quebra-cabeca-eva') || catMap.get('quebra-cabecas');
      return catMap.get('quebra-cabecas');
    }
    if (nomeLower.includes('tiara') || nomeLower.includes('bolsa')) {
      if (nomeLower.includes('tiara')) return catMap.get('tiaras') || catMap.get('tiaras-e-bolsas');
      if (nomeLower.includes('bolsa')) return catMap.get('bolsas') || catMap.get('tiaras-e-bolsas');
      return catMap.get('tiaras-e-bolsas');
    }
    if (nomeLower.includes('quadro') || nomeLower.includes('relogio') || nomeLower.includes('relógio')) {
      if (nomeLower.includes('quadro')) return catMap.get('quadros') || catMap.get('decoracao');
      if (nomeLower.includes('relogio') || nomeLower.includes('relógio')) return catMap.get('relogios') || catMap.get('decoracao');
      return catMap.get('decoracao');
    }
    if (nomeLower.includes('brinquedo') || nomeLower.includes('jogo')) {
      if (nomeLower.includes('paraná') || nomeLower.includes('parana')) return catMap.get('brinquedo-papel-parana') || catMap.get('brinquedos');
      if (nomeLower.includes('eva')) return catMap.get('brinquedos-eva') || catMap.get('brinquedos');
      return catMap.get('brinquedos');
    }
    return null;
  }

  // 3. Varrer páginas do Bling (Varrendo até 30 páginas)
  let pagina = 1;
  let totalImportados = 0;

  while (pagina <= 30) {
    console.log(`🔎 Buscando página ${pagina} no Bling...`);
    const listRes = await fetch(`https://api.bling.com.br/Api/v3/produtos?pagina=${pagina}&limite=100`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!listRes.ok) {
      console.log(`Página ${pagina} não retornou mais resultados.`);
      break;
    }

    const listJson = await listRes.json();
    const prods = listJson.data || [];
    if (prods.length === 0) break;

    for (const item of prods) {
      const nome = item.nome || '';
      const catId = getCategoriaId(nome);

      if (catId || nome.toLowerCase().includes('mascara') || nome.toLowerCase().includes('brinquedo') || nome.toLowerCase().includes('quebra') || nome.toLowerCase().includes('relogio') || nome.toLowerCase().includes('relógio') || nome.toLowerCase().includes('tiara') || nome.toLowerCase().includes('bolsa') || nome.toLowerCase().includes('quadro')) {
        
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

        const sku = item.codigo || `BLING-${item.id}`;
        const slug = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${item.id}`;

        const payload = {
          bling_id: String(item.id),
          nome: nome,
          slug: slug,
          codigo_barras: sku,
          preco: preco || 29.90,
          categoria_id: catId,
          imagens: fotos,
          ativo: true,
          criado_em: new Date().toISOString()
        };

        const { error: errInsert } = await supabase.from('produtos').upsert(payload, { onConflict: 'bling_id' });
        if (!errInsert) {
          totalImportados++;
          console.log(`  ✨ [${totalImportados}] Importado: ${nome} (R$ ${preco})`);
        } else {
          console.error(`  ❌ Erro ao salvar ${nome}:`, errInsert.message);
        }
      }
    }

    pagina++;
  }

  console.log(`\n🎉 Processo concluído! Total de produtos do Bling importados: ${totalImportados}`);
}

importFromBling();

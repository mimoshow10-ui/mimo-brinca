const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://dehtqlcevoheqajejjcv.supabase.co', 'sb_publishable_jwcOkSMB6YQAF1lJc3885w_--sghFSx');

async function cleanForBanhoTosa() {
  console.log('--- Removendo produtos e categorias do Mimo Brinca do banco do Banho & Tosa ---');

  // 1. Remover produtos do Mimo Brinca
  const { error: err1 } = await supabase.from('produtos').delete().eq('marca', 'Mimo Brinca');
  if (err1) console.error('Erro ao deletar produtos Mimo Brinca:', err1);
  else console.log('✅ Produtos do Mimo Brinca removidos do banco do Banho & Tosa!');

  // 2. Remover categorias do Mimo Brinca
  const slugsMimo = ['mascaras', 'brinquedos', 'quebra-cabecas', 'tiaras-e-bolsas', 'decoracao'];
  for (const slug of slugsMimo) {
    // Apagar subcategorias primeiro
    const { data: catPai } = await supabase.from('categorias').select('id').eq('slug', slug).maybeSingle();
    if (catPai) {
      await supabase.from('categorias').delete().eq('parent_id', catPai.id);
      await supabase.from('categorias').delete().eq('id', catPai.id);
    }
  }
  console.log('✅ Categorias do Mimo Brinca removidas!');

  // 3. Verificar estado final do banco para o Banho & Tosa
  const { count: totalProds } = await supabase.from('produtos').select('*', { count: 'exact', head: true });
  const { data: cats } = await supabase.from('categorias').select('nome, slug');

  console.log(`\n🎉 Banco do Banho & Tosa restaurado com sucesso!`);
  console.log(`Total de produtos Pet Shop restantes no banco: ${totalProds}`);
  console.log(`Categorias Pet Shop no banco:`, cats.map(c => c.nome));
}

cleanForBanhoTosa();

const { createClient } = require('@supabase/supabase-js');

const client = createClient(
  'https://dehtqlcevoheqajejjcv.supabase.co',
  'sb_publishable_jwcOkSMB6YQAF1lJc3885w_--sghFSx'
);

const ESTRUTURA_EXATA = [
  {
    nome: 'Máscaras',
    slug: 'mascaras',
    subs: [
      { nome: 'EVA', slug: 'mascaras-eva' },
      { nome: 'Papel Paraná', slug: 'mascaras-papel-parana' },
    ]
  },
  {
    nome: 'Brinquedos',
    slug: 'brinquedos',
    subs: [
      { nome: 'Brinquedo Papel Paraná', slug: 'brinquedo-papel-parana' },
      { nome: 'EVA', slug: 'brinquedos-eva' },
      { nome: 'Papel Paraná', slug: 'brinquedos-papel-parana' },
    ]
  },
  {
    nome: 'Quebra-Cabeças',
    slug: 'quebra-cabecas',
    subs: [
      { nome: 'Quebra-Cabeça MDF', slug: 'quebra-cabeca-mdf' },
      { nome: 'Papel Paraná', slug: 'quebra-cabeca-papel-parana' },
      { nome: 'EVA', slug: 'quebra-cabeca-eva' },
    ]
  },
  {
    nome: 'Tiaras e Bolsas',
    slug: 'tiaras-e-bolsas',
    subs: [
      { nome: 'Tiaras', slug: 'tiaras' },
      { nome: 'Bolsas', slug: 'bolsas' },
      { nome: 'EVA', slug: 'tiaras-bolsas-eva' },
      { nome: 'Papel Paraná', slug: 'tiaras-bolsas-papel-parana' },
    ]
  }
];

async function main() {
  console.log('--- Limpando categorias e cadastrando nova estrutura especificada ---');
  await client.from('categorias').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const grupo of ESTRUTURA_EXATA) {
    const { data: parentData, error: parentError } = await client
      .from('categorias')
      .insert({
        nome: grupo.nome,
        slug: grupo.slug,
        parent_id: null
      })
      .select()
      .single();

    if (parentError) {
      console.error(`Erro ao criar grupo ${grupo.nome}:`, parentError);
      continue;
    }

    console.log(`✅ Grupo Criado: ${parentData.nome} (${parentData.id})`);

    for (const sub of grupo.subs) {
      const { data: subData, error: subError } = await client
        .from('categorias')
        .insert({
          nome: sub.nome,
          slug: sub.slug,
          parent_id: parentData.id
        })
        .select()
        .single();

      if (subError) {
        console.error(`  ❌ Erro ao criar subgrupo ${sub.nome}:`, subError);
      } else {
        console.log(`  └─ 📁 Subgrupo Criado: ${subData.nome}`);
      }
    }
  }

  console.log('--- Concluído com Sucesso ---');
}

main();

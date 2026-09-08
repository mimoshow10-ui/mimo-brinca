const { createClient } = require('@supabase/supabase-js');

const client = createClient(
  'https://dehtqlcevoheqajejjcv.supabase.co',
  'sb_publishable_jwcOkSMB6YQAF1lJc3885w_--sghFSx'
);

const ESTRUTURA_INFANTIL = [
  {
    nome: 'Brinquedos Educativos',
    slug: 'brinquedos-educativos',
    subs: [
      { nome: 'Blocos de Montar e Encaixe', slug: 'blocos-de-montar-e-encaixe' },
      { nome: 'Quebra-Cabeças Infantis', slug: 'quebra-cabecas-infantis' },
      { nome: 'Jogos de Memória e Lógica', slug: 'jogos-de-memoria-e-logica' },
      { nome: 'Brinquedos de Madeira e Montessóri', slug: 'brinquedos-de-madeira-e-montessori' },
    ]
  },
  {
    nome: 'Bebês e Primeira Infância',
    slug: 'bebes-e-primeira-infancia',
    subs: [
      { nome: 'Chocalhos e Mordedores Infantis', slug: 'chocalhos-e-mordedores-infantis' },
      { nome: 'Tapetes de Atividades', slug: 'tapetes-de-atividades' },
      { nome: 'Brinquedos para Banho Infantil', slug: 'brinquedos-para-banho-infantil' },
      { nome: 'Pelúcias e Naninhas', slug: 'pelucias-e-naninhas' },
    ]
  },
  {
    nome: 'Arte e Criatividade',
    slug: 'arte-e-criatividade',
    subs: [
      { nome: 'Lousas e Telas Mágicas', slug: 'lousas-e-telas-magicas' },
      { nome: 'Massinhas de Modelar', slug: 'massinhas-de-modelar' },
      { nome: 'Livros de Colorir e Desenho', slug: 'livros-de-colorir-e-desenho' },
      { nome: 'Kits de Trabalhos Manuais', slug: 'kits-de-trabalhos-manuais' },
    ]
  },
  {
    nome: 'Jogos e Veículos',
    slug: 'jogos-e-veiculos',
    subs: [
      { nome: 'Carrinhos e Pistas de Corrida', slug: 'carrinhos-e-pistas-de-corrida' },
      { nome: 'Jogos de Tabuleiro Infantis', slug: 'jogos-de-tabuleiro-infantis' },
      { nome: 'Brinquedos Interativos Eletrônicos', slug: 'brinquedos-interativos-eletronicos' },
      { nome: 'Lançadores e Alvos', slug: 'lancadores-e-alvos' },
    ]
  },
  {
    nome: 'Ao Ar Livre e Festas',
    slug: 'ao-ar-livre-e-festas',
    subs: [
      { nome: 'Bolas e Jogos de Quintal', slug: 'bolas-e-jogos-de-quintal' },
      { nome: 'Bolhas de Sabão Divertidas', slug: 'bolhas-de-sabao-divertidas' },
      { nome: 'Fantasias e Acessórios Divertidos', slug: 'fantasias-e-acessorios-divertidos' },
      { nome: 'Brinquedos de Praia e Areia', slug: 'brinquedos-de-praia-e-areia' },
    ]
  },
  {
    nome: 'Kits e Presentes',
    slug: 'kits-e-presentes',
    subs: [
      { nome: 'Kits Presente Aniversário', slug: 'kits-presente-aniversario' },
      { nome: 'Caixas Surpresa Mimo Brinca', slug: 'caixas-surpresa-mimo-brinca' },
      { nome: 'Mochilinhas e Estojos Divertidos', slug: 'mochilinhas-e-estojos-divertidos' },
    ]
  }
];

async function main() {
  console.log('--- Limpando categorias antigas e cadastrando novas categorias infantis ---');
  await client.from('categorias').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const grupo of ESTRUTURA_INFANTIL) {
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

    console.log(`✅ Grupo Infantil Criado: ${parentData.nome} (${parentData.id})`);

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
        console.log(`  └─ 👶 Subgrupo Criado: ${subData.nome}`);
      }
    }
  }

  console.log('--- Concluído com Sucesso ---');
}

main();

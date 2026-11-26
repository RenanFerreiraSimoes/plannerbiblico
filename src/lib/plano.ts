export interface Livro { nome: string; abrev: string; caps: number; testamento: 'AT' | 'NT' }

const bruto: [string, string, number][] = [
  ['Gênesis','Gn',50],['Êxodo','Êx',40],['Levítico','Lv',27],['Números','Nm',36],['Deuteronômio','Dt',34],
  ['Josué','Js',24],['Juízes','Jz',21],['Rute','Rt',4],['1 Samuel','1Sm',31],['2 Samuel','2Sm',24],
  ['1 Reis','1Rs',22],['2 Reis','2Rs',25],['1 Crônicas','1Cr',29],['2 Crônicas','2Cr',36],['Esdras','Ed',10],
  ['Neemias','Ne',13],['Ester','Et',10],['Jó','Jó',42],['Salmos','Sl',150],['Provérbios','Pv',31],
  ['Eclesiastes','Ec',12],['Cantares','Ct',8],['Isaías','Is',66],['Jeremias','Jr',52],['Lamentações','Lm',5],
  ['Ezequiel','Ez',48],['Daniel','Dn',12],['Oseias','Os',14],['Joel','Jl',3],['Amós','Am',9],
  ['Obadias','Ob',1],['Jonas','Jn',4],['Miqueias','Mq',7],['Naum','Na',3],['Habacuque','Hc',3],
  ['Sofonias','Sf',3],['Ageu','Ag',2],['Zacarias','Zc',14],['Malaquias','Ml',4],
  ['Mateus','Mt',28],['Marcos','Mc',16],['Lucas','Lc',24],['João','Jo',21],['Atos','At',28],
  ['Romanos','Rm',16],['1 Coríntios','1Co',16],['2 Coríntios','2Co',13],['Gálatas','Gl',6],['Efésios','Ef',6],
  ['Filipenses','Fp',4],['Colossenses','Cl',4],['1 Tessalonicenses','1Ts',5],['2 Tessalonicenses','2Ts',3],
  ['1 Timóteo','1Tm',6],['2 Timóteo','2Tm',4],['Tito','Tt',3],['Filemom','Fm',1],['Hebreus','Hb',13],
  ['Tiago','Tg',5],['1 Pedro','1Pe',5],['2 Pedro','2Pe',3],['1 João','1Jo',5],['2 João','2Jo',1],
  ['3 João','3Jo',1],['Judas','Jd',1],['Apocalipse','Ap',22],
]

export const LIVROS: Livro[] = bruto.map(([nome, abrev, caps], i) => ({
  nome, abrev, caps, testamento: i < 39 ? 'AT' : 'NT',
}))

export const TOTAL_DIAS = 365
export const TOTAL_CAPS = LIVROS.reduce((s, l) => s + l.caps, 0) // 1189

export const idxLivro = (abrev: string) => LIVROS.findIndex(l => l.abrev === abrev)

// Quantos dias cada livro recebe: proporcional ao tamanho, mínimo 1, total exato de 365
function diasPorLivro(): number[] {
  const dias = LIVROS.map(l => Math.min(l.caps, Math.max(1, Math.round((l.caps * TOTAL_DIAS) / TOTAL_CAPS))))
  let soma = dias.reduce((a, b) => a + b, 0)
  while (soma < TOTAL_DIAS) {
    let melhor = -1, maior = -1
    dias.forEach((d, i) => { if (d < LIVROS[i].caps && LIVROS[i].caps / d > maior) { maior = LIVROS[i].caps / d; melhor = i } })
    dias[melhor]++; soma++
  }
  while (soma > TOTAL_DIAS) {
    let melhor = -1, menor = Infinity
    dias.forEach((d, i) => { if (d > 1 && LIVROS[i].caps / d < menor) { menor = LIVROS[i].caps / d; melhor = i } })
    dias[melhor]--; soma--
  }
  return dias
}

export interface DiaPlano { dia: number; livroIdx: number; capIni: number; capFim: number }

function gerarPlano(): DiaPlano[] {
  const dias = diasPorLivro()
  const plano: DiaPlano[] = []
  LIVROS.forEach((l, livroIdx) => {
    const d = dias[livroIdx]
    for (let i = 0; i < d; i++) {
      plano.push({
        dia: plano.length + 1,
        livroIdx,
        capIni: Math.floor((i * l.caps) / d) + 1,
        capFim: Math.floor(((i + 1) * l.caps) / d),
      })
    }
  })
  return plano
}

export const PLANO: DiaPlano[] = gerarPlano()

export const rotulo = (d: DiaPlano) =>
  `${LIVROS[d.livroIdx].nome} ${d.capIni === d.capFim ? d.capIni : `${d.capIni}–${d.capFim}`}`

export const qtdCaps = (d: DiaPlano) => d.capFim - d.capIni + 1
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useProgresso, sequenciaAtual } from '../lib/useProgresso'
import { PLANO, LIVROS, TOTAL_DIAS, TOTAL_CAPS, idxLivro, rotulo, qtdCaps } from '../lib/plano'
import { textoVersiculo, traducaoEfetiva } from '../lib/biblia'
import { dataLonga, hojeISO, diffDias } from '../lib/datas'
import { Ramo } from '../components/Ramo'
import CartaDeHoje from '../components/CartaDeHoje'

// [livro, capítulo, versículo]
const VERSICULOS: [string, number, number][] = [
  ['Jr', 29, 11], ['Sl', 23, 1], ['Is', 41, 10], ['Pv', 3, 5], ['Js', 1, 9], ['Sl', 119, 105],
  ['Rm', 8, 28], ['Mt', 11, 28], ['Sl', 46, 1], ['Lm', 3, 22], ['1Pe', 5, 7], ['Fp', 4, 13],
]

function VersiculoDoDia({ traducao }: { traducao: string }) {
  const [texto, setTexto] = useState('')
  const dia = diffDias('2024-01-01', hojeISO())
  const [ab, cap, v] = VERSICULOS[dia % VERSICULOS.length]
  const livro = idxLivro(ab)
  useEffect(() => { textoVersiculo(traducao, livro, cap, v).then(setTexto).catch(() => setTexto('')) }, [traducao, livro, cap, v])
  return (
    <div className="card text-center">
      <p className="text-xs uppercase tracking-widest text-ouro">Versículo do dia</p>
      <p className="mt-3 font-display text-2xl italic leading-snug">{texto ? `“${texto}”` : '…'}</p>
      <p className="mt-2 text-sm text-tinta/60">{LIVROS[livro].nome} {cap}:{v}</p>
    </div>
  )
}

export default function Inicio() {
  const { perfil } = useAuth()
  const { feitos, pronto } = useProgresso()
  const concluidos = feitos.size
  const proximo = PLANO.find(d => !feitos.has(d.dia)) ?? PLANO[TOTAL_DIAS - 1]
  const capsLidos = [...feitos.keys()].reduce((s, d) => s + qtdCaps(PLANO[d - 1]), 0)
  const pct = Math.round((capsLidos / TOTAL_CAPS) * 100)

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm capitalize text-tinta/60">{dataLonga(hojeISO())}</p>
        <h1 className="titulo">Olá, {perfil!.nome}</h1>
        <Ramo className="mt-1 w-28 text-ouro" />
      </header>

      <div className="card text-center">
        <p className="font-display text-xl italic text-tinta/80">
          Para a Sabrina, que este ano seja de muita intimidade com Deus. Mesmo de longe, estou orando por você. 🤍
        </p>
      </div>

      <CartaDeHoje />

      <div className="card bg-gradient-to-br from-blush-100 to-nude/60 text-center">
        <p className="font-display text-2xl italic leading-snug text-blush-600">
          “365 dias para conhecer mais a Palavra, aprofundar minha fé e caminhar cada dia mais perto de Deus.”
        </p>
      </div>

      <VersiculoDoDia traducao={traducaoEfetiva(perfil!.traducao)} />

      <div className="card">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl text-blush-600">Minha leitura</h2>
          <span className="text-sm text-tinta/60">{pct}% da Bíblia</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-blush-100">
          <div className="h-full rounded-full bg-gradient-to-r from-blush-300 to-ouro transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <Num valor={pronto ? concluidos : '–'} rotulo="dias concluídos" />
          <Num valor={pronto ? sequenciaAtual(feitos) : '–'} rotulo="dias seguidos" />
          <Num valor={pronto ? capsLidos : '–'} rotulo="capítulos lidos" />
        </div>
        <div className="mt-6 rounded-2xl bg-blush-50 p-4">
          <p className="text-xs uppercase tracking-widest text-ouro">Próxima leitura · Dia {proximo.dia}</p>
          <p className="font-display text-2xl">{rotulo(proximo)}</p>
          <Link to={`/dia/${proximo.dia}`} className="btn mt-3">Continuar minha leitura</Link>
        </div>
      </div>
    </div>
  )
}

const Num = ({ valor, rotulo }: { valor: number | string; rotulo: string }) => (
  <div><p className="font-display text-4xl text-blush-600">{valor}</p><p className="text-xs text-tinta/60">{rotulo}</p></div>
)
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Check, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { useProgresso } from '../lib/useProgresso'
import { useColecao } from '../lib/useColecao'
import { LIVROS, PLANO, rotulo } from '../lib/plano'
import { textoCapitulo, traducaoEfetiva } from '../lib/biblia'
import { buscarDevocional } from '../data/devocionais'
import { dataLonga, somarDias } from '../lib/datas'
import NotaDeApoio from '../components/NotaDeApoio'


interface Fav {
  tipo: 'versiculo' | 'capitulo' | 'dia'
  ref: string
  rotulo: string
  trecho?: string
  traducao?: string
  cor?: string
  comentario?: string
}
type Favoritos = ReturnType<typeof useColecao<Fav>>


const CORES = [
  { id: 'rosa', bg: '#f9dde2' },
  { id: 'ouro', bg: '#f3e5c3' },
  { id: 'verde', bg: '#dcead8' },
  { id: 'azul', bg: '#dbe4f2' },
]


function TextoBiblico({ traducao, livroIdx, cap, favoritos }: {
  traducao: string; livroIdx: number; cap: number; favoritos: Favoritos
}) {
  const [versos, setVersos] = useState<string[] | null>(null)
  const [erro, setErro] = useState('')
  const [aberto, setAberto] = useState<number | null>(null)
  const [comentario, setComentario] = useState('')


  useEffect(() => {
    setVersos(null); setErro(''); setAberto(null)
    textoCapitulo(traducao, livroIdx, cap).then(setVersos).catch(e => setErro(e.message))
  }, [traducao, livroIdx, cap])


  const livro = LIVROS[livroIdx]
  const refCap = `${livro.abrev} ${cap}`
  const itens = favoritos.itens ?? []
  const favCap = itens.find(f => f.ref === refCap)
  const mapa = new Map(itens.map(f => [f.ref, f]))


  function abrirVerso(n: number) {
    if (aberto === n) return setAberto(null)
    setAberto(n)
    setComentario(mapa.get(`${livro.abrev} ${cap}:${n}`)?.comentario ?? '')
  }


  function favoritarCapitulo() {
    if (favCap) return favoritos.excluir(favCap.id)
    favoritos.adicionar({ tipo: 'capitulo', ref: refCap, rotulo: `${livro.nome} ${cap}`, traducao })
  }


  function marcarVerso(n: number, cor: string) {
    const ref = `${livro.abrev} ${cap}:${n}`
    const atual = mapa.get(ref)
    if (atual) {
      favoritos.atualizar(atual.id, { cor, comentario })
    } else {
      favoritos.adicionar({
        tipo: 'versiculo', ref, rotulo: `${livro.nome} ${cap}:${n}`,
        trecho: versos?.[n - 1] ?? '', traducao, cor, comentario,
      })
    }
    setAberto(null)
  }


  return (
    <section>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-2xl text-blush-600">{livro.nome} {cap}</h3>
        <button className="text-ouro" aria-label="Favoritar capítulo" onClick={favoritarCapitulo}>
          <Star size={18} fill={favCap ? 'currentColor' : 'none'} />
        </button>
      </div>
      {erro && <p className="text-sm text-red-500">{erro}</p>}
      {!versos && !erro && <p className="text-sm text-tinta/50">Carregando…</p>}


      <div className="mt-2 space-y-1 leading-relaxed">
        {versos?.map((v, i) => {
          const n = i + 1
          const ref = `${livro.abrev} ${cap}:${n}`
          const fav = mapa.get(ref)
          const corBg = CORES.find(c => c.id === fav?.cor)?.bg
          return (
            <div key={i}>
              <p onClick={() => abrirVerso(n)}
                className={`cursor-pointer rounded-lg px-2 py-1 transition ${corBg ? '' : 'hover:bg-blush-50'}`}
                style={corBg ? { backgroundColor: corBg } : undefined}>
                <sup className="mr-1 text-xs text-ouro">{n}</sup>{v}
                {fav?.comentario && <span className="ml-1 text-xs text-blush-500">✎</span>}
              </p>


              {aberto === n && (
                <div className="mx-2 mt-1 space-y-2 rounded-xl bg-blush-50 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-tinta/60">Marcar:</span>
                    {CORES.map(c => (
                      <button key={c.id} aria-label={c.id} onClick={() => marcarVerso(n, c.id)}
                        className="h-6 w-6 rounded-full border border-tinta/10" style={{ backgroundColor: c.bg }} />
                    ))}
                    {fav && (
                      <button className="ml-auto text-xs text-red-400"
                        onClick={() => { favoritos.excluir(fav.id); setAberto(null) }}>
                        Remover
                      </button>
                    )}
                  </div>
                  <input className="campo !py-2 text-sm" placeholder="Comentário pessoal (opcional)"
                    value={comentario} onChange={e => setComentario(e.target.value)}
                    onBlur={() => fav && favoritos.atualizar(fav.id, { comentario })} />
                  {!fav && (
                    <button className="btn-suave !py-1.5 text-xs" onClick={() => marcarVerso(n, '')}>
                      Favoritar versículo
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}


function AnotacaoDia({ dia }: { dia: number }) {
  const { user } = useAuth()
  const ref = doc(db, 'users', user!.uid, 'notas', `dia-${dia}`)
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'salvando' | 'erro'>('carregando')
  const timer = useRef<number>(undefined)


  useEffect(() => {
    getDoc(ref).then(s => { setTexto(s.exists() ? s.data().texto : ''); setEstado('ok') }).catch(() => setEstado('erro'))
  }, [])


  function aoDigitar(v: string) {
    setTexto(v); setEstado('salvando')
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setDoc(ref, { texto: v, dia, atualizadoEm: serverTimestamp() }, { merge: true })
        .then(() => setEstado('ok')).catch(() => setEstado('erro'))
    }, 800)
  }


  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl text-blush-600">Minhas anotações</h3>
        <span className="text-xs text-tinta/50">
          {estado === 'salvando' ? 'Salvando…' : estado === 'erro' ? 'Erro ao salvar' : estado === 'ok' ? 'Salvo ✓' : ''}
        </span>
      </div>
      <textarea className="campo mt-3 min-h-40" disabled={estado === 'carregando'} value={texto}
        onChange={e => aoDigitar(e.target.value)}
        placeholder="O que Deus falou ao seu coração hoje? O que você aprendeu e quer colocar em prática?" />
    </div>
  )
}


const Secao = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h3 className="text-xs font-semibold uppercase tracking-widest text-ouro">{titulo}</h3>
    {children}
  </section>
)


export default function Dia() {
  // todos os hooks ficam aqui em cima, antes de qualquer return
  const { n } = useParams()
  const dia = Number(n)
  const { perfil } = useAuth()
  const { feitos, alternar } = useProgresso()
  const favoritos = useColecao<Fav>('favoritos')


  const info = PLANO[dia - 1]
  if (!info) return <Navigate to="/plano" replace />


  const traducao = traducaoEfetiva(perfil!.traducao)
  const dev = buscarDevocional(info)
  const concluido = feitos.has(dia)
  const caps = Array.from({ length: info.capFim - info.capIni + 1 }, (_, i) => info.capIni + i)
  const favDia = favoritos.itens?.find(f => f.ref === `dia ${dia}`)


  function favoritarDia() {
    if (favDia) return favoritos.excluir(favDia.id)
    favoritos.adicionar({ tipo: 'dia', ref: `dia ${dia}`, rotulo: `Dia ${dia} · ${dev?.tema ?? rotulo(info)}` })
  }


  return (
    <div className="space-y-6" key={dia}>
      <header>
        <p className="text-sm capitalize text-tinta/60">Dia {dia} · {dataLonga(somarDias(perfil!.inicio, dia - 1))}</p>
        <h1 className="titulo">{dev?.tema ?? rotulo(info)}</h1>
        <p className="text-sm text-tinta/60">Leitura: {rotulo(info)} · {traducao.toUpperCase()}</p>
      </header>


      <div className="card space-y-8">
        {caps.map(c => (
          <TextoBiblico key={c} traducao={traducao} livroIdx={info.livroIdx} cap={c} favoritos={favoritos} />
        ))}
        <p className="text-xs text-tinta/50">Toque em um versículo para marcar com cor, favoritar ou comentar.</p>
      </div>


      {dev ? (
        <div className="card space-y-6">
          <Secao titulo="Contexto histórico e cultural"><p>{dev.contextoHistorico}</p></Secao>
          <Secao titulo="Contexto bíblico"><p>{dev.contextoBiblico}</p></Secao>
          <Secao titulo="Explicação dos versículos">{dev.explicacao.map((p, i) => <p key={i}>{p}</p>)}</Secao>
          <Secao titulo="O que Deus nos ensina nesta passagem?">
            <ul className="list-disc space-y-1 pl-5">{dev.ensinamentos.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </Secao>
          <Secao titulo="Aplicação para a vida"><p>{dev.aplicacao}</p></Secao>
          <Secao titulo="Reflexão do dia"><p className="font-display text-xl italic">{dev.reflexao}</p></Secao>
          <Secao titulo="Perguntas para o coração">
            <ol className="list-decimal space-y-1 pl-5">{dev.perguntas.map((p, i) => <li key={i}>{p}</li>)}</ol>
          </Secao>
          <Secao titulo="Vivendo a Palavra"><p>{dev.vivendo}</p></Secao>
          <Secao titulo="Momento de oração"><p className="italic">{dev.oracao}</p></Secao>
          <NotaDeApoio revisadoPor={dev.revisadoPor} />
          <button className="btn-suave" onClick={favoritarDia}>
            {favDia ? '★ Remover dos favoritos' : '☆ Favoritar este devocional'}
          </button>
        </div>
      ) : (
        <div className="card text-center text-tinta/70">
          O estudo devocional deste dia ainda está sendo preparado. Enquanto isso, leia o texto com calma
          e registre suas anotações abaixo.
        </div>
      )}


      <AnotacaoDia key={`n${dia}`} dia={dia} />


      <button onClick={() => alternar(dia)} className={concluido ? 'btn-suave w-full' : 'btn w-full'}>
        <Check size={18} /> {concluido ? 'Concluído — toque para desmarcar' : 'Marcar dia como concluído'}
      </button>


      <nav className="flex justify-between">
        {dia > 1 ? <Link className="btn-suave" to={`/dia/${dia - 1}`}><ChevronLeft size={16} /> Dia anterior</Link> : <span />}
        {dia < 365 && <Link className="btn-suave" to={`/dia/${dia + 1}`}>Próximo dia <ChevronRight size={16} /></Link>}
      </nav>
    </div>
  )
}
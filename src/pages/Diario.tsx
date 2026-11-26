import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { serverTimestamp } from 'firebase/firestore'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useColecao, ms } from '../lib/useColecao'
import { NOTA_CATEGORIAS } from '../lib/categorias'
import { PLANO, rotulo } from '../lib/plano'

interface Nota {
  titulo?: string
  texto: string
  categoria?: string
  dia?: number
  atualizadoEm?: unknown
  criadoEm?: unknown
}

interface Editando { id?: string; titulo: string; texto: string; categoria: string; dia?: number }

const PADRAO = NOTA_CATEGORIAS[0]

const formatar = (t: number) =>
  t ? new Date(t).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

export default function Diario() {
  const { itens, erro, adicionar, atualizar, excluir } = useColecao<Nota>('notas')
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('')
  const [ed, setEd] = useState<Editando | null>(null)
  const [erroForm, setErroForm] = useState('')

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return (itens ?? [])
      .filter(n => n.texto?.trim() || n.titulo?.trim()) // esconde anotações de dia que ficaram vazias
      .filter(n => !filtro || (n.categoria ?? PADRAO) === filtro)
      .filter(n => !q || `${n.titulo ?? ''} ${n.texto ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => ms(b.atualizadoEm ?? b.criadoEm) - ms(a.atualizadoEm ?? a.criadoEm))
  }, [itens, busca, filtro])

  function novo() {
    setErroForm('')
    setEd({ titulo: '', texto: '', categoria: PADRAO })
  }

  function editar(n: Nota & { id: string }) {
    setErroForm('')
    setEd({ id: n.id, titulo: n.titulo ?? '', texto: n.texto ?? '', categoria: n.categoria ?? PADRAO, dia: n.dia })
  }

  function salvar() {
    if (!ed) return
    if (!ed.texto.trim()) return setErroForm('Escreva algo antes de salvar.')
    const dados = {
      titulo: ed.titulo.trim(),
      texto: ed.texto.trim(),
      categoria: ed.categoria,
      atualizadoEm: serverTimestamp(),
    }
    if (ed.id) atualizar(ed.id, dados)
    else adicionar(dados)
    setEd(null)
  }

  function apagar() {
    if (!ed?.id) return
    if (confirm('Excluir esta anotação? Não dá para desfazer.')) {
      excluir(ed.id)
      setEd(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="titulo">Meu diário</h1>
        {!ed && <button className="btn" onClick={novo}><Plus size={16} /> Nova</button>}
      </div>

      {erro && <p className="text-sm text-red-500">{erro}</p>}

      {ed && (
        <div className="card space-y-3">
          <h2 className="font-display text-2xl text-blush-600">{ed.id ? 'Editar anotação' : 'Nova anotação'}</h2>
          {ed.dia && (
            <p className="text-xs text-tinta/60">Vinculada ao dia {ed.dia} · {rotulo(PLANO[ed.dia - 1])}</p>
          )}
          <select className="campo" value={ed.categoria} onChange={e => setEd({ ...ed, categoria: e.target.value })}>
            {NOTA_CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
          <input className="campo" placeholder="Título (opcional)" value={ed.titulo}
            onChange={e => setEd({ ...ed, titulo: e.target.value })} />
          <textarea className="campo min-h-48" placeholder="Escreva aqui…" value={ed.texto}
            onChange={e => setEd({ ...ed, texto: e.target.value })} autoFocus />
          {erroForm && <p className="text-sm text-red-500">{erroForm}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn" onClick={salvar}>Salvar</button>
            <button className="btn-suave" onClick={() => setEd(null)}>Cancelar</button>
            {ed.id && (
              <button className="ml-auto flex items-center gap-1 text-sm text-red-400" onClick={apagar}>
                <Trash2 size={16} /> Excluir
              </button>
            )}
          </div>
        </div>
      )}

      {!ed && (
        <>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-tinta/40" />
            <input className="campo pl-11" placeholder="Pesquisar nas minhas anotações…" value={busca}
              onChange={e => setBusca(e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-2">
            {['', ...NOTA_CATEGORIAS].map(c => (
              <button key={c || 'todas'} onClick={() => setFiltro(c)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  filtro === c ? 'border-blush-500 bg-blush-500 text-white' : 'border-blush-200 bg-white text-tinta/70 hover:bg-blush-50'}`}>
                {c || 'Todas'}
              </button>
            ))}
          </div>

          {itens === null && <p className="text-tinta/50">Carregando…</p>}

          {itens !== null && lista.length === 0 && (
            <div className="card text-center text-tinta/70">
              {itens.length === 0
                ? 'Seu diário ainda está em branco. Toque em “Nova” para registrar o que Deus tem falado ao seu coração.'
                : 'Nenhuma anotação encontrada.'}
            </div>
          )}

          {lista.map(n => (
            <article key={n.id} className="card cursor-pointer transition hover:bg-blush-50" onClick={() => editar(n)}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-blush-100 px-3 py-1 text-xs text-blush-600">{n.categoria ?? PADRAO}</span>
                <span className="text-xs text-tinta/50">{formatar(ms(n.atualizadoEm ?? n.criadoEm))}</span>
              </div>
              {n.titulo && <h2 className="mt-3 font-display text-2xl text-blush-600">{n.titulo}</h2>}
              <p className="mt-2 line-clamp-4 whitespace-pre-line leading-relaxed">{n.texto}</p>
              {n.dia && PLANO[n.dia - 1] && (
                <Link to={`/dia/${n.dia}`} onClick={e => e.stopPropagation()}
                  className="mt-3 inline-block text-xs text-ouro underline">
                  Dia {n.dia} · {rotulo(PLANO[n.dia - 1])}
                </Link>
              )}
            </article>
          ))}
        </>
      )}
    </div>
  )
}
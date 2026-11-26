import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useColecao, ms } from '../lib/useColecao'
import { ORACAO_CATEGORIAS } from '../lib/categorias'
import { hojeISO, parseISO } from '../lib/datas'

interface Oracao {
  texto: string
  categoria: string
  data: string
  respondida?: boolean
  testemunho?: string
  respondidaEm?: string
  criadoEm?: unknown
}
interface Pessoa { nome: string; motivo?: string; criadoEm?: unknown }

const fmt = (s: string) => parseISO(s).toLocaleDateString('pt-BR')

type Aba = 'pedidos' | 'respondidas' | 'pessoas'

export default function Oracoes() {
  const [aba, setAba] = useState<Aba>('pedidos')
  const abas: [Aba, string][] = [['pedidos', 'Pedidos'], ['respondidas', 'Respondidas'], ['pessoas', 'Pessoas']]

  return (
    <div className="space-y-6">
      <h1 className="titulo">Meu diário de oração</h1>
      <div className="flex flex-wrap gap-2">
        {abas.map(([id, nome]) => (
          <button key={id} onClick={() => setAba(id)} className={aba === id ? 'btn' : 'btn-suave'}>{nome}</button>
        ))}
      </div>
      {aba === 'pessoas' ? <Pessoas /> : <Pedidos respondidas={aba === 'respondidas'} />}
    </div>
  )
}

function Pedidos({ respondidas }: { respondidas: boolean }) {
  const { itens, erro, adicionar, atualizar, excluir } = useColecao<Oracao>('oracoes')
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState(ORACAO_CATEGORIAS[0])
  const [data, setData] = useState(hojeISO())
  const [erroForm, setErroForm] = useState('')
  const [respondendo, setRespondendo] = useState<{ id: string; testemunho: string } | null>(null)

  function salvar() {
    if (!texto.trim()) return setErroForm('Escreva o seu pedido de oração.')
    adicionar({ texto: texto.trim(), categoria, data: data || hojeISO(), respondida: false })
    setTexto(''); setErroForm('')
  }

  function confirmarResposta() {
    if (!respondendo) return
    atualizar(respondendo.id, {
      respondida: true,
      testemunho: respondendo.testemunho.trim(),
      respondidaEm: hojeISO(),
    })
    setRespondendo(null)
  }

  function apagar(id: string) {
    if (confirm('Excluir este pedido? Não dá para desfazer.')) excluir(id)
  }

  const lista = (itens ?? [])
    .filter(o => !!o.respondida === respondidas)
    .sort((a, b) => (respondidas
      ? (b.respondidaEm ?? '').localeCompare(a.respondidaEm ?? '')
      : b.data.localeCompare(a.data) || ms(b.criadoEm) - ms(a.criadoEm)))

  return (
    <div className="space-y-5">
      {erro && <p className="text-sm text-red-500">{erro}</p>}

      {!respondidas && (
        <div className="card space-y-3">
          <h2 className="font-display text-2xl text-blush-600">Novo pedido</h2>
          <textarea className="campo min-h-28" placeholder="Pelo que você quer orar?" value={texto}
            onChange={e => setTexto(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="campo" value={categoria} onChange={e => setCategoria(e.target.value)}>
              {ORACAO_CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="date" className="campo" value={data} onChange={e => setData(e.target.value)} />
          </div>
          {erroForm && <p className="text-sm text-red-500">{erroForm}</p>}
          <button className="btn" onClick={salvar}>Salvar pedido</button>
        </div>
      )}

      {respondidas && (
        <div className="card bg-gradient-to-br from-blush-100 to-nude/60 text-center">
          <p className="font-display text-xl italic text-blush-600">
            “Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum de seus benefícios.” (Salmos 103:2)
          </p>
        </div>
      )}

      {itens === null && <p className="text-tinta/50">Carregando…</p>}
      {itens !== null && lista.length === 0 && (
        <div className="card text-center text-tinta/70">
          {respondidas
            ? 'Quando Deus responder um pedido, marque aqui e registre o testemunho para lembrar da fidelidade dele.'
            : 'Nenhum pedido em aberto. Que tal entregar algo a Deus agora?'}
        </div>
      )}

      {lista.map(o => (
        <article key={o.id} className="card space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-blush-100 px-3 py-1 text-xs text-blush-600">{o.categoria}</span>
            <span className="text-xs text-tinta/50">
              {respondidas && o.respondidaEm ? `Respondida em ${fmt(o.respondidaEm)} · pedido de ${fmt(o.data)}` : fmt(o.data)}
            </span>
          </div>
          <p className="whitespace-pre-line leading-relaxed">{o.texto}</p>

          {respondidas && (
            <div className="rounded-2xl bg-blush-50 p-4">
              <p className="text-xs uppercase tracking-widest text-ouro">Testemunho</p>
              <p className="mt-1 whitespace-pre-line">{o.testemunho || 'Sem testemunho escrito.'}</p>
            </div>
          )}

          {respondendo?.id === o.id ? (
            <div className="space-y-3">
              <textarea className="campo min-h-24" autoFocus placeholder="Como Deus respondeu? (opcional)"
                value={respondendo.testemunho}
                onChange={e => setRespondendo({ id: o.id, testemunho: e.target.value })} />
              <div className="flex gap-3">
                <button className="btn" onClick={confirmarResposta}>Salvar testemunho</button>
                <button className="btn-suave" onClick={() => setRespondendo(null)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {respondidas ? (
                <button className="btn-suave" onClick={() => atualizar(o.id, { respondida: false })}>Reabrir pedido</button>
              ) : (
                <button className="btn-suave" onClick={() => setRespondendo({ id: o.id, testemunho: '' })}>
                  Deus respondeu 🙌
                </button>
              )}
              <button className="ml-auto text-tinta/40 hover:text-red-400" onClick={() => apagar(o.id)} aria-label="Excluir">
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  )
}

function Pessoas() {
  const { itens, erro, adicionar, excluir } = useColecao<Pessoa>('pessoas')
  const [nome, setNome] = useState('')
  const [motivo, setMotivo] = useState('')
  const [erroForm, setErroForm] = useState('')

  function salvar() {
    if (!nome.trim()) return setErroForm('Digite o nome da pessoa.')
    adicionar({ nome: nome.trim(), motivo: motivo.trim() })
    setNome(''); setMotivo(''); setErroForm('')
  }

  const lista = (itens ?? []).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  return (
    <div className="space-y-5">
      {erro && <p className="text-sm text-red-500">{erro}</p>}
      <div className="card space-y-3">
        <h2 className="font-display text-2xl text-blush-600">Pessoas por quem estou orando</h2>
        <input className="campo" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
        <input className="campo" placeholder="Motivo de oração (opcional)" value={motivo} onChange={e => setMotivo(e.target.value)} />
        {erroForm && <p className="text-sm text-red-500">{erroForm}</p>}
        <button className="btn" onClick={salvar}>Adicionar à lista</button>
      </div>

      {itens === null && <p className="text-tinta/50">Carregando…</p>}
      {itens !== null && lista.length === 0 && (
        <div className="card text-center text-tinta/70">Sua lista está vazia. Adicione quem você carrega no coração.</div>
      )}

      {lista.map(p => (
        <div key={p.id} className="card flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-2xl text-blush-600">{p.nome}</p>
            {p.motivo && <p className="text-sm text-tinta/70">{p.motivo}</p>}
          </div>
          <button className="text-tinta/40 hover:text-red-400" aria-label="Remover"
            onClick={() => confirm(`Remover ${p.nome} da lista?`) && excluir(p.id)}>
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}
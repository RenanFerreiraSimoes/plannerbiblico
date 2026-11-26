import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { Plus, Trash2 } from 'lucide-react'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { hojeISO, parseISO, somarDias } from '../lib/datas'

interface Carta { titulo: string; texto: string; liberarEm: string; para: string; paraNome?: string; de?: string }
interface Conta { id: string; nome: string; email: string }
interface Editando { id?: string; para: string; titulo: string; texto: string; liberarEm: string; de: string }

const fmt = (s: string) => parseISO(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

export default function Admin() {
  const { user, perfil, admin } = useAuth()
  const [cartas, setCartas] = useState<(Carta & { id: string })[] | null>(null)
  const [contas, setContas] = useState<Conta[]>([])
  const [ed, setEd] = useState<Editando | null>(null)
  const [erro, setErro] = useState('')
  const [erroForm, setErroForm] = useState('')

  useEffect(() => {
    if (!admin) return
    const u1 = onSnapshot(
      collection(db, 'cartas'),
      s => setCartas(s.docs.map(d => ({ id: d.id, ...(d.data() as Carta) }))),
      () => setErro('Não foi possível carregar as cartas.'),
    )
    const u2 = onSnapshot(
      collection(db, 'contas'),
      s => setContas(s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Conta, 'id'>) }))),
      () => setErro('Não foi possível carregar as contas.'),
    )
    return () => { u1(); u2() }
  }, [admin])

  if (admin === null) return <p className="text-tinta/50">Carregando…</p>
  if (!admin) return <Navigate to="/" replace />

  const hoje = hojeISO()
  const lista = [...(cartas ?? [])].sort((a, b) => b.liberarEm.localeCompare(a.liberarEm))

  function novo() {
    setErroForm('')
    // destinatária padrão: a primeira conta que não é a sua
    const outra = contas.find(c => c.id !== user!.uid) ?? contas.find(c => c.id === user!.uid)
    const para = outra?.id ?? ''
    // data sugerida: o dia seguinte à última carta já agendada para ela (ou hoje)
    const datas = (cartas ?? []).filter(c => c.para === para).map(c => c.liberarEm).sort()
    const ultima = datas[datas.length - 1]
    const liberarEm = ultima && ultima >= hoje ? somarDias(ultima, 1) : hoje
    setEd({ para, titulo: '', texto: '', liberarEm, de: perfil!.nome })
  }

  function editar(c: Carta & { id: string }) {
    setErroForm('')
    setEd({ id: c.id, para: c.para, titulo: c.titulo, texto: c.texto, liberarEm: c.liberarEm, de: c.de ?? '' })
  }

  function salvar() {
    if (!ed) return
    if (!ed.para) return setErroForm('Escolha para quem é a carta.')
    if (!ed.titulo.trim()) return setErroForm('Dê um título para a carta.')
    if (!ed.texto.trim()) return setErroForm('Escreva a mensagem.')
    if (!ed.liberarEm) return setErroForm('Escolha a data de liberação.')
    const dados = {
      para: ed.para,
      paraNome: contas.find(c => c.id === ed.para)?.nome ?? '',
      titulo: ed.titulo.trim(),
      texto: ed.texto.trim(),
      liberarEm: ed.liberarEm,
      de: ed.de.trim(),
    }
    const falhou = () => setErro('Não foi possível salvar a carta.')
    if (ed.id) updateDoc(doc(db, 'cartas', ed.id), dados).catch(falhou)
    else addDoc(collection(db, 'cartas'), { ...dados, criadoEm: serverTimestamp() }).catch(falhou)
    setEd(null)
  }

  function apagar() {
    if (!ed?.id) return
    if (confirm('Excluir esta carta? Não dá para desfazer.')) {
      deleteDoc(doc(db, 'cartas', ed.id)).catch(() => setErro('Não foi possível excluir.'))
      setEd(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="titulo">Escrever cartas</h1>
        {!ed && <button className="btn" onClick={novo}><Plus size={16} /> Nova</button>}
      </div>

      {erro && <p className="text-sm text-red-500">{erro}</p>}

      {ed && (
        <div className="card space-y-3">
          <h2 className="font-display text-2xl text-blush-600">{ed.id ? 'Editar carta' : 'Nova carta'}</h2>

          <label className="text-sm text-tinta/70">Para</label>
          <select className="campo" value={ed.para} onChange={e => setEd({ ...ed, para: e.target.value })}>
            {contas.length === 0 && <option value="">Nenhuma conta encontrada</option>}
            {contas.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome} ({c.email}){c.id === user!.uid ? ' · você' : ''}
              </option>
            ))}
          </select>

          <label className="text-sm text-tinta/70">Liberar no dia</label>
          <input type="date" className="campo" value={ed.liberarEm} onChange={e => setEd({ ...ed, liberarEm: e.target.value })} />

          <input className="campo" placeholder="Título" value={ed.titulo} onChange={e => setEd({ ...ed, titulo: e.target.value })} />
          <textarea className="campo min-h-56" placeholder="Escreva sua mensagem…" value={ed.texto}
            onChange={e => setEd({ ...ed, texto: e.target.value })} />
          <input className="campo" placeholder="Assinatura (ex.: com amor, seu nome)" value={ed.de}
            onChange={e => setEd({ ...ed, de: e.target.value })} />

          {erroForm && <p className="text-sm text-red-500">{erroForm}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <button className="btn" onClick={salvar}>Salvar carta</button>
            <button className="btn-suave" onClick={() => setEd(null)}>Cancelar</button>
            {ed.id && (
              <button className="ml-auto flex items-center gap-1 text-sm text-red-400" onClick={apagar}>
                <Trash2 size={16} /> Excluir
              </button>
            )}
          </div>

          <p className="text-xs text-tinta/50">
            A carta só aparece para ela a partir da data escolhida. Esse bloqueio é uma surpresa na tela,
            não uma proteção de segurança.
          </p>
        </div>
      )}

      {!ed && (
        <>
          {cartas === null && <p className="text-tinta/50">Carregando…</p>}
          {cartas !== null && lista.length === 0 && (
            <div className="card text-center text-tinta/70">
              Nenhuma carta ainda. Toque em “Nova” para escrever a primeira.
            </div>
          )}
          {lista.map(c => {
            const liberada = c.liberarEm <= hoje
            return (
              <article key={c.id} className="card cursor-pointer transition hover:bg-blush-50" onClick={() => editar(c)}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs ${liberada ? 'bg-blush-100 text-blush-600' : 'bg-ouro/15 text-ouro'}`}>
                    {liberada ? 'Já liberada' : 'Agendada'}
                  </span>
                  <span className="text-xs text-tinta/50">{fmt(c.liberarEm)}</span>
                </div>
                <h2 className="mt-3 font-display text-2xl text-blush-600">{c.titulo}</h2>
                <p className="text-xs text-tinta/50">Para {c.paraNome || 'conta sem nome'}</p>
                <p className="mt-2 line-clamp-3 whitespace-pre-line leading-relaxed">{c.texto}</p>
              </article>
            )
          })}
        </>
      )}
    </div>
  )
}
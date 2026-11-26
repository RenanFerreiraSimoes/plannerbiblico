import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { Lock } from 'lucide-react'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { dataCurta, hojeISO } from '../lib/datas'

interface Carta { id: string; titulo: string; texto: string; liberarEm: string; de?: string }

export default function Cartas() {
  const { user } = useAuth()
  const [cartas, setCartas] = useState<Carta[] | null>(null)

  useEffect(() => onSnapshot(query(collection(db, 'cartas'), where('para', '==', user!.uid)),
    s => setCartas(s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Carta, 'id'>) }))
      .sort((a, b) => b.liberarEm.localeCompare(a.liberarEm)))), [user])

  const hoje = hojeISO()
  return (
    <div className="space-y-5">
      <h1 className="titulo">Cartas para você</h1>
      {cartas === null && <p className="text-tinta/50">Carregando…</p>}
      {cartas?.length === 0 && <div className="card text-center text-tinta/70">Ainda não há cartas por aqui. 🤍</div>}
      {cartas?.map(c => c.liberarEm <= hoje ? (
        <article key={c.id} className="card">
          <p className="text-xs uppercase tracking-widest text-ouro">{dataCurta(c.liberarEm)}{c.de ? ` · de ${c.de}` : ''}</p>
          <h2 className="font-display text-2xl text-blush-600">{c.titulo}</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed">{c.texto}</p>
        </article>
      ) : (
        <div key={c.id} className="card flex items-center gap-3 text-tinta/50">
          <Lock size={18} /> Uma carta chega em {dataCurta(c.liberarEm)}
        </div>
      ))}
    </div>
  )
}
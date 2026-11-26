import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { Mail } from 'lucide-react'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { hojeISO } from '../lib/datas'

export default function CartaDeHoje() {
  const { user } = useAuth()
  const [titulo, setTitulo] = useState<string | null>(null)

  useEffect(() => onSnapshot(
    query(collection(db, 'cartas'), where('para', '==', user!.uid), where('liberarEm', '==', hojeISO())),
    s => setTitulo(s.empty ? null : (s.docs[0].data().titulo as string)),
    () => {},
  ), [user])

  if (titulo === null) return null

  return (
    <Link to="/cartas" className="card flex items-center gap-4 bg-gradient-to-br from-blush-100 to-nude/60 transition hover:opacity-90">
      <Mail size={24} strokeWidth={1.5} className="text-ouro" />
      <div>
        <p className="text-xs uppercase tracking-widest text-ouro">Uma carta chegou para você hoje</p>
        <p className="font-display text-2xl text-blush-600">{titulo}</p>
      </div>
    </Link>
  )
}
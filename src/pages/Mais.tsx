import { Link } from 'react-router-dom'
import { ListChecks, CalendarDays, Star, Footprints, Mail, Settings, Send, ChevronRight } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

const links = [
  { to: '/plano', Icone: ListChecks, titulo: 'Plano de 365 dias', desc: 'Todos os dias de leitura, livro por livro' },
  { to: '/calendario', Icone: CalendarDays, titulo: 'Calendário', desc: 'Mês a mês da sua jornada' },
  { to: '/favoritos', Icone: Star, titulo: 'Favoritos', desc: 'Versículos e devocionais guardados' },
  { to: '/jornada', Icone: Footprints, titulo: 'Minha jornada', desc: 'Progresso, sequências e conquistas' },
  { to: '/cartas', Icone: Mail, titulo: 'Cartas para você', desc: 'Mensagens que chegam ao longo do ano' },
  { to: '/config', Icone: Settings, titulo: 'Ajustes', desc: 'Nome, tradução, data de início e conta' },
]

const itemAdmin = { to: '/admin', Icone: Send, titulo: 'Escrever cartas', desc: 'Escreva e agende mensagens (só administrador)' }

export default function Mais() {
  const { admin } = useAuth()
  const todos = admin ? [...links.slice(0, 4), itemAdmin, ...links.slice(4)] : links

  return (
    <div className="space-y-5">
      <h1 className="titulo">Mais</h1>
      {todos.map(({ to, Icone, titulo, desc }) => (
        <Link key={to} to={to} className="card flex items-center gap-4 transition hover:bg-blush-50">
          <Icone size={22} strokeWidth={1.5} className="text-ouro" />
          <div className="flex-1">
            <p className="font-display text-2xl text-blush-600">{titulo}</p>
            <p className="text-sm text-tinta/60">{desc}</p>
          </div>
          <ChevronRight size={18} className="text-tinta/40" />
        </Link>
      ))}
    </div>
  )
}
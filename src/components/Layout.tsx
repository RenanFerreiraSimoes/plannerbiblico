import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { Home, BookOpen, ListChecks, Mail, Settings, Pencil, Heart, Menu, Send, CalendarDays, Star, Footprints } from 'lucide-react'
import { Ramo } from './Ramo'
import { useAuth } from '../lib/AuthContext'
import { numeroDiaHoje } from '../pages/Hoje'

type Item = { to: string; rotulo: string; Icone: typeof Home }

const desktop: Item[] = [
  { to: '/', rotulo: 'Início', Icone: Home },
  { to: '/hoje', rotulo: 'Devocional de hoje', Icone: BookOpen },
  { to: '/plano', rotulo: 'Plano de 365 dias', Icone: ListChecks },
  { to: '/calendario', rotulo: 'Calendário', Icone: CalendarDays },
  { to: '/diario', rotulo: 'Meu diário', Icone: Pencil },
  { to: '/oracoes', rotulo: 'Orações', Icone: Heart },
  { to: '/favoritos', rotulo: 'Favoritos', Icone: Star },
  { to: '/jornada', rotulo: 'Minha jornada', Icone: Footprints },
  { to: '/cartas', rotulo: 'Cartas', Icone: Mail },
  { to: '/config', rotulo: 'Ajustes', Icone: Settings },
]

const itemAdmin: Item = { to: '/admin', rotulo: 'Escrever cartas', Icone: Send }

const mobile: Item[] = [
  { to: '/', rotulo: 'Início', Icone: Home },
  { to: '/hoje', rotulo: 'Hoje', Icone: BookOpen },
  { to: '/diario', rotulo: 'Diário', Icone: Pencil },
  { to: '/oracoes', rotulo: 'Orações', Icone: Heart },
  { to: '/mais', rotulo: 'Mais', Icone: Menu },
]

const DENTRO_DE_MAIS = ['/mais', '/plano', '/calendario', '/favoritos', '/jornada', '/cartas', '/config', '/admin']

function ativo(to: string, p: string, diaAtual: number, diaAberto: number | null) {
  if (to === '/') return p === '/'
  // "Hoje" fica marcado quando estamos em /hoje ou no dia correspondente à data de hoje
  if (to === '/hoje') return p === '/hoje' || (p.startsWith('/dia') && diaAberto === diaAtual)
  if (to === '/mais') return DENTRO_DE_MAIS.some(x => p.startsWith(x))
  return p.startsWith(to)
}

export default function Layout() {
  const { pathname } = useLocation()
  const { n } = useParams() // existe em /dia/:n; nas outras rotas, fica undefined
  const { admin, perfil } = useAuth()

  const diaAberto = pathname.startsWith('/dia') ? Number(n) : null
  const diaAtual = perfil ? numeroDiaHoje(perfil.inicio) : 0
  const menuDesktop = admin ? [...desktop.slice(0, 9), itemAdmin, desktop[9]] : desktop

  return (
    <div className="min-h-screen">
      {/* menu lateral (computador) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-blush-100 bg-white/70 p-6 md:flex">
        <h1 className="font-display text-3xl leading-tight text-blush-600">365 Dias<br />com Deus</h1>
        <Ramo className="mt-2 w-24 text-ouro" />
        <nav className="mt-8 flex flex-col gap-1">
          {menuDesktop.map(({ to, rotulo, Icone }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                ativo(to, pathname, diaAtual, diaAberto) ? 'bg-blush-100 font-medium text-blush-600' : 'text-tinta/70 hover:bg-blush-50'}`}>
              <Icone size={18} strokeWidth={1.6} /> {rotulo}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="md:pl-64">
        <main className="fade-in mx-auto max-w-3xl px-5 pb-28 pt-8 md:px-10 md:pb-12">
          <Outlet />
        </main>
      </div>

      {/* menu inferior (celular) */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-blush-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {mobile.map(({ to, rotulo, Icone }) => (
          <Link key={to} to={to}
            className={`flex flex-col items-center gap-1 px-3 py-3 text-[11px] ${ativo(to, pathname, diaAtual, diaAberto) ? 'text-blush-600' : 'text-tinta/50'}`}>
            <Icone size={20} strokeWidth={1.6} /> {rotulo}
          </Link>
        ))}
      </nav>
    </div>
  )
}
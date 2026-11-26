import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Hoje from './pages/Hoje'
import Dia from './pages/Dia'
import Plano from './pages/Plano'
import Calendario from './pages/Calendario'
import Diario from './pages/Diario'
import Oracoes from './pages/Oracoes'
import Favoritos from './pages/Favoritos'
import Jornada from './pages/Jornada'
import Cartas from './pages/Cartas'
import Config from './pages/Config'
import Mais from './pages/Mais'
import Admin from './pages/Admin'

function Rotas() {
  const { user, carregando } = useAuth()
  if (carregando) return <div className="grid min-h-screen place-items-center font-display text-2xl text-blush-500">Carregando…</div>
  if (!user) return <Login />
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="hoje" element={<Hoje />} />
        <Route path="dia/:n" element={<Dia />} />
        <Route path="plano" element={<Plano />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="diario" element={<Diario />} />
        <Route path="oracoes" element={<Oracoes />} />
        <Route path="favoritos" element={<Favoritos />} />
        <Route path="jornada" element={<Jornada />} />
        <Route path="cartas" element={<Cartas />} />
        <Route path="config" element={<Config />} />
        <Route path="mais" element={<Mais />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider><Rotas /></AuthProvider>
    </BrowserRouter>
  )
}
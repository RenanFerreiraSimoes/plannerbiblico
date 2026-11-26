import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { diffDias, hojeISO } from '../lib/datas'
import { TOTAL_DIAS } from '../lib/plano'

// dia correspondente à data de hoje, dado o início do plano
export function numeroDiaHoje(inicio: string) {
  return Math.min(TOTAL_DIAS, Math.max(1, diffDias(inicio, hojeISO()) + 1))
}

export default function Hoje() {
  const { perfil } = useAuth()
  return <Navigate to={`/dia/${numeroDiaHoje(perfil!.inicio)}`} replace />
}
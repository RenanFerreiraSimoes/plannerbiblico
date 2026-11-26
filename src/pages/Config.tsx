import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { TRADUCOES } from '../lib/biblia'

export default function Config() {
  const { perfil, salvarPerfil, sair, user } = useAuth()
  const [nome, setNome] = useState(perfil!.nome)
  const [msg, setMsg] = useState('')

  async function salvar(p: Parameters<typeof salvarPerfil>[0]) {
    try { await salvarPerfil(p); setMsg('Salvo ✓') } catch { setMsg('Não foi possível salvar.') }
    setTimeout(() => setMsg(''), 2000)
  }
  const t = TRADUCOES.find(x => x.id === perfil!.traducao)

  return (
    <div className="space-y-6">
      <h1 className="titulo">Ajustes</h1>
      {msg && <p className="text-sm text-green-700">{msg}</p>}

      <div className="card space-y-3">
        <label className="text-sm text-tinta/70">Nome de exibição</label>
        <div className="flex gap-3">
          <input className="campo" value={nome} onChange={e => setNome(e.target.value)} />
          <button className="btn" onClick={() => nome.trim() && salvar({ nome: nome.trim() })}>Salvar</button>
        </div>
      </div>

      <div className="card space-y-3">
        <label className="text-sm text-tinta/70">Tradução bíblica</label>
        <select className="campo" value={perfil!.traducao} onChange={e => salvar({ traducao: e.target.value })}>
          {TRADUCOES.map(x => <option key={x.id} value={x.id} disabled={!x.disponivel}>{x.nome}{!x.disponivel ? ' (indisponível)' : ''}</option>)}
        </select>
        {t && !t.disponivel && <p className="text-sm text-tinta/60">{t.aviso} Usando a ACF no lugar.</p>}
        <p className="text-xs text-tinta/50">Só disponibilizamos traduções que podemos usar legalmente.</p>
      </div>

      <div className="card space-y-3">
        <label className="text-sm text-tinta/70">Data de início do plano</label>
        <input type="date" className="campo" value={perfil!.inicio} onChange={e => e.target.value && salvar({ inicio: e.target.value })} />
        <p className="text-xs text-tinta/50">As datas do plano são só uma sugestão. Você lê no seu ritmo.</p>
      </div>

      <div className="card space-y-3">
        <label className="text-sm text-tinta/70">Horário do lembrete devocional</label>
        <input type="time" className="campo" value={perfil!.lembrete} onChange={e => salvar({ lembrete: e.target.value })} />
        <p className="text-xs text-tinta/50">O horário fica salvo; as notificações serão ativadas em uma próxima etapa.</p>
      </div>

      <div className="card flex items-center justify-between">
        <span className="text-sm text-tinta/60">{user!.email}</span>
        <button className="btn-suave" onClick={sair}>Sair da conta</button>
      </div>
    </div>
  )
}
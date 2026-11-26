import { useRef, useState, type ChangeEvent } from 'react'
import { Camera, Check, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { TRADUCOES } from '../lib/biblia'
import { TEMAS, temaValido } from '../lib/temas'
import { comprimirFoto } from '../lib/foto'
import Avatar from '../components/Avatar'

export default function Config() {
  const { perfil, salvarPerfil, sair, user } = useAuth()
  const [nome, setNome] = useState(perfil!.nome)
  const [aviso, setAviso] = useState<{ texto: string; ok: boolean } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const entradaFoto = useRef<HTMLInputElement>(null)

  function mostrar(texto: string, ok: boolean) {
    setAviso({ texto, ok })
    setTimeout(() => setAviso(null), ok ? 2000 : 4500)
  }

  async function salvar(p: Parameters<typeof salvarPerfil>[0]) {
    try { await salvarPerfil(p); mostrar('Salvo ✓', true) } catch { mostrar('Não foi possível salvar.', false) }
  }

  async function trocarFoto(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo
    if (!arquivo) return
    setEnviando(true)
    try {
      const foto = await comprimirFoto(arquivo)
      await salvarPerfil({ foto })
      mostrar('Foto atualizada ✓', true)
    } catch (err) {
      mostrar(err instanceof Error ? err.message : 'Não foi possível salvar a foto.', false)
    } finally {
      setEnviando(false)
    }
  }

  const t = TRADUCOES.find(x => x.id === perfil!.traducao)
  const temaAtual = temaValido(perfil!.tema)

  return (
    <div className="space-y-6">
      <h1 className="titulo">Ajustes</h1>
      {aviso && <p className={`text-sm ${aviso.ok ? 'text-green-700' : 'text-red-700'}`}>{aviso.texto}</p>}

      <div className="card flex items-center gap-5">
        <Avatar foto={perfil!.foto} nome={perfil!.nome} tamanho={84} />
        <div className="flex-1 space-y-3">
          <p className="text-sm text-tinta/70">Foto de perfil</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-suave" disabled={enviando} onClick={() => entradaFoto.current?.click()}>
              <Camera size={16} /> {enviando ? 'Salvando…' : perfil!.foto ? 'Trocar foto' : 'Escolher foto'}
            </button>
            {perfil!.foto ? (
              <button type="button" className="btn-suave" disabled={enviando} onClick={() => salvar({ foto: '' })}>
                <Trash2 size={16} /> Remover
              </button>
            ) : null}
          </div>
          <input ref={entradaFoto} type="file" accept="image/*" className="hidden" onChange={trocarFoto} />
          <p className="text-xs text-tinta/50">A foto é recortada em quadrado e fica guardada só na sua conta.</p>
        </div>
      </div>

      <div className="card space-y-3">
        <label className="text-sm text-tinta/70">Nome de exibição</label>
        <div className="flex gap-3">
          <input className="campo" value={nome} onChange={e => setNome(e.target.value)} />
          <button className="btn" onClick={() => nome.trim() && salvar({ nome: nome.trim() })}>Salvar</button>
        </div>
      </div>

      <div className="card space-y-4">
        <p className="text-sm text-tinta/70">Cores do aplicativo</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {TEMAS.map(tema => {
            const escolhido = tema.id === temaAtual
            return (
              <button
                key={tema.id}
                type="button"
                onClick={() => salvar({ tema: tema.id })}
                aria-pressed={escolhido}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs transition ${
                  escolhido ? 'border-ouro bg-blush-50 font-medium text-tinta' : 'border-blush-100 bg-white text-tinta/70 hover:bg-blush-50'}`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ background: tema.cor }}>
                  {escolhido ? <Check size={18} /> : null}
                </span>
                {tema.nome}
              </button>
            )
          })}
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
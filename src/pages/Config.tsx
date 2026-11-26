import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Bell, BellOff, Camera, Check, Send, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { TRADUCOES } from '../lib/biblia'
import { TEMAS, temaValido } from '../lib/temas'
import { comprimirFoto } from '../lib/foto'
import { aparelhoInscrito, ativarLembretes, desativarLembretes, enviarTeste, suportaPush } from '../lib/lembretes'
import Avatar from '../components/Avatar'

function textoDoErro(err: unknown, padrao: string) {
  return err instanceof Error ? err.message : padrao
}

export default function Config() {
  const { perfil, salvarPerfil, sair, user } = useAuth()
  const [nome, setNome] = useState(perfil!.nome)
  const [aviso, setAviso] = useState<{ texto: string; ok: boolean } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [aparelho, setAparelho] = useState<boolean | null>(null) // este aparelho está inscrito?
  const entradaFoto = useRef<HTMLInputElement>(null)

  const pushOk = suportaPush()
  const bloqueada = pushOk && Notification.permission === 'denied'
  const ligado = !!perfil!.lembreteAtivo

  useEffect(() => {
    if (!pushOk) return
    aparelhoInscrito().then(setAparelho)
  }, [pushOk])

  function mostrar(texto: string, ok: boolean) {
    setAviso({ texto, ok })
    setTimeout(() => setAviso(null), ok ? 2500 : 6000)
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
      mostrar(textoDoErro(err, 'Não foi possível salvar a foto.'), false)
    } finally {
      setEnviando(false)
    }
  }

  async function ativar() {
    setOcupado(true)
    try {
      await ativarLembretes(user!.uid)
      await salvarPerfil({ lembreteAtivo: true })
      setAparelho(true)
      mostrar('Lembretes ativados ✓', true)
    } catch (err) {
      mostrar(textoDoErro(err, 'Não foi possível ativar os lembretes.'), false)
    } finally {
      setOcupado(false)
    }
  }

  async function desativar() {
    setOcupado(true)
    try {
      await desativarLembretes(user!.uid)
      await salvarPerfil({ lembreteAtivo: false })
      setAparelho(false)
      mostrar('Lembretes desativados.', true)
    } catch (err) {
      mostrar(textoDoErro(err, 'Não foi possível desativar.'), false)
    } finally {
      setOcupado(false)
    }
  }

  async function testar() {
    setOcupado(true)
    try {
      await enviarTeste()
      mostrar('Teste enviado! Ele deve chegar em instantes.', true)
    } catch (err) {
      mostrar(textoDoErro(err, 'Não foi possível enviar o teste.'), false)
    } finally {
      setOcupado(false)
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

      <div className="card space-y-4">
        <label className="text-sm text-tinta/70">Lembrete devocional</label>
        <input type="time" className="campo" value={perfil!.lembrete} onChange={e => salvar({ lembrete: e.target.value })} />

        {!pushOk ? (
          <p className="text-sm text-tinta/60">Este navegador não aceita notificações. No celular Android, use o Chrome.</p>
        ) : bloqueada ? (
          <p className="text-sm text-red-700">
            As notificações estão bloqueadas neste navegador. Toque no cadeado ao lado do endereço do site,
            abra as permissões, libere as notificações e volte aqui.
          </p>
        ) : (
          <div className="space-y-3">
            {ligado && aparelho ? (
              <p className="flex items-center gap-2 text-sm text-green-700">
                <Bell size={16} /> Lembretes ativos neste aparelho.
              </p>
            ) : ligado && aparelho === false ? (
              <p className="text-sm text-tinta/70">
                Os lembretes estão ligados na sua conta, mas este aparelho ainda não está inscrito.
              </p>
            ) : (
              <p className="text-sm text-tinta/60">Receba um aviso todos os dias no horário escolhido.</p>
            )}

            <div className="flex flex-wrap gap-2">
              {!(ligado && aparelho) ? (
                <button type="button" className="btn" disabled={ocupado} onClick={ativar}>
                  <Bell size={16} /> {ocupado ? 'Aguarde…' : ligado ? 'Ativar neste aparelho' : 'Ativar lembretes'}
                </button>
              ) : (
                <button type="button" className="btn-suave" disabled={ocupado} onClick={testar}>
                  <Send size={16} /> Enviar notificação de teste
                </button>
              )}
              {ligado ? (
                <button type="button" className="btn-suave" disabled={ocupado} onClick={desativar}>
                  <BellOff size={16} /> Desativar
                </button>
              ) : null}
            </div>
          </div>
        )}

        <p className="text-xs text-tinta/50">
          O horário segue o fuso de Brasília e o aviso pode chegar alguns minutos depois. Se o dia já estiver
          concluído, não enviamos nada. Desativar desliga os lembretes em todos os seus aparelhos.
        </p>
      </div>

      <div className="card flex items-center justify-between">
        <span className="text-sm text-tinta/60">{user!.email}</span>
        <button className="btn-suave" onClick={sair}>Sair da conta</button>
      </div>
    </div>
  )
}
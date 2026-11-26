import { useState, type FormEvent } from 'react'
import { useAuth } from '../lib/AuthContext'
import { Ramo } from '../components/Ramo'

const msgs: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet.',
}

export default function Login() {
  const { entrar, cadastrar, recuperar } = useAuth()
  const [modo, setModo] = useState<'entrar' | 'cadastrar' | 'recuperar'>('entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [info, setInfo] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(''); setInfo('')
    if (modo === 'cadastrar' && nome.trim().length < 2) return setErro('Digite seu nome.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErro('Digite um e-mail válido.')
    if (modo !== 'recuperar' && senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.')
    setEnviando(true)
    try {
      if (modo === 'entrar') await entrar(email, senha)
      else if (modo === 'cadastrar') await cadastrar(nome.trim(), email, senha)
      else { await recuperar(email); setInfo('Enviamos um link para o seu e-mail. Confira também o spam.') }
    } catch (err: any) {
      setErro(msgs[err.code] ?? 'Algo deu errado. Tente novamente.')
    } finally { setEnviando(false) }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-blush-50 to-marfim px-5 py-10">
      <div className="fade-in w-full max-w-md">
        <div className="mb-8 text-center">
          <Ramo className="mx-auto w-28 text-ouro" />
          <h1 className="mt-3 font-display text-5xl text-blush-600">365 Dias com Deus</h1>
          <p className="mt-2 font-display text-xl italic text-tinta/70">
            Uma jornada diária pela Palavra. Um coração cada vez mais perto de Deus.
          </p>
        </div>

        <form onSubmit={enviar} className="card space-y-4" noValidate>
          <h2 className="font-display text-2xl text-blush-600">
            {modo === 'entrar' ? 'Entrar na minha conta' : modo === 'cadastrar' ? 'Criar minha conta' : 'Recuperar senha'}
          </h2>
          {modo === 'cadastrar' && (
            <input className="campo" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} autoComplete="name" />
          )}
          <input className="campo" type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          {modo !== 'recuperar' && (
            <input className="campo" type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)}
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} />
          )}
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          {info && <p className="text-sm text-green-700">{info}</p>}
          <button className="btn w-full" disabled={enviando}>
            {enviando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : modo === 'cadastrar' ? 'Criar conta' : 'Enviar link'}
          </button>
          <div className="flex justify-between text-sm text-blush-600">
            {modo === 'entrar' ? (
              <>
                <button type="button" onClick={() => setModo('cadastrar')}>Criar conta</button>
                <button type="button" onClick={() => setModo('recuperar')}>Esqueci a senha</button>
              </>
            ) : (
              <button type="button" onClick={() => setModo('entrar')}>← Voltar</button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
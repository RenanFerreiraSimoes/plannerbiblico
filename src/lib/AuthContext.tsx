import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, sendPasswordResetEmail, updateProfile, type User,
} from 'firebase/auth'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import { hojeISO } from './datas'

export interface Perfil { nome: string; traducao: string; inicio: string; lembrete: string }

interface Ctx {
  user: User | null
  perfil: Perfil | null
  admin: boolean | null // null = ainda verificando
  carregando: boolean
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>
  entrar: (email: string, senha: string) => Promise<void>
  recuperar: (email: string) => Promise<void>
  sair: () => Promise<void>
  salvarPerfil: (p: Partial<Perfil>) => Promise<void>
}

const AuthCtx = createContext<Ctx>(null as unknown as Ctx)
export const useAuth = () => useContext(AuthCtx)

const padrao = (nome: string): Perfil => ({ nome, traducao: 'acf', inicio: hojeISO(), lembrete: '07:00' })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [admin, setAdmin] = useState<boolean | null>(null)
  const [authPronto, setAuthPronto] = useState(false)

  useEffect(() => onAuthStateChanged(auth, u => {
    setUser(u)
    if (!u) { setPerfil(null); setAdmin(null) }
    setAuthPronto(true)
  }), [])

  // perfil da pessoa
  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    return onSnapshot(ref, snap => {
      if (snap.exists()) setPerfil(snap.data() as Perfil)
      else setDoc(ref, { ...padrao(user.displayName ?? 'Querida'), criadoEm: serverTimestamp() })
    })
  }, [user])

  // é administrador? (existe o documento admins/{uid})
  useEffect(() => {
    if (!user) return
    return onSnapshot(
      doc(db, 'admins', user.uid),
      snap => setAdmin(snap.exists()),
      () => setAdmin(false),
    )
  }, [user])

  // registra nome e e-mail para o admin poder escolher a destinatária das cartas
  useEffect(() => {
    if (!user || !perfil) return
    setDoc(doc(db, 'contas', user.uid), { nome: perfil.nome, email: user.email ?? '' }, { merge: true }).catch(() => {})
  }, [user, perfil?.nome])

  const value: Ctx = {
    user, perfil, admin,
    carregando: !authPronto || (!!user && !perfil),
    async cadastrar(nome, email, senha) {
      const c = await createUserWithEmailAndPassword(auth, email, senha)
      await updateProfile(c.user, { displayName: nome })
      await setDoc(doc(db, 'users', c.user.uid), { ...padrao(nome), criadoEm: serverTimestamp() })
    },
    async entrar(email, senha) { await signInWithEmailAndPassword(auth, email, senha) },
    async recuperar(email) { await sendPasswordResetEmail(auth, email) },
    async sair() { await signOut(auth) },
    async salvarPerfil(p) { await setDoc(doc(db, 'users', user!.uid), p, { merge: true }) },
  }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
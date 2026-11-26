import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './AuthContext'
import { hojeISO, somarDias } from './datas'

export function useProgresso() {
  const { user } = useAuth()
  const [feitos, setFeitos] = useState<Map<number, string>>(new Map()) // dia -> data em que concluiu
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    if (!user) return
    return onSnapshot(collection(db, 'users', user.uid, 'progresso'), snap => {
      setFeitos(new Map(snap.docs.map(d => [Number(d.id), (d.data().data as string) ?? hojeISO()])))
      setPronto(true)
    })
  }, [user])

  async function alternar(dia: number) {
    const ref = doc(db, 'users', user!.uid, 'progresso', String(dia))
    if (feitos.has(dia)) await deleteDoc(ref)
    else await setDoc(ref, { data: hojeISO(), criadoEm: serverTimestamp() })
  }

  return { feitos, pronto, alternar }
}

export function sequenciaAtual(feitos: Map<number, string>) {
  const datas = new Set(feitos.values())
  let d = hojeISO()
  if (!datas.has(d)) d = somarDias(d, -1) // ainda dá tempo de ler hoje
  let n = 0
  while (datas.has(d)) { n++; d = somarDias(d, -1) }
  return n
}
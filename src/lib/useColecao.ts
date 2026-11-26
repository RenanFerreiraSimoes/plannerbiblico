import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './AuthContext'

// converte o timestamp do Firestore em número (para ordenar)
export const ms = (t: unknown) => (t as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0

export function useColecao<T extends object>(nome: string) {
  const { user } = useAuth()
  const [itens, setItens] = useState<(T & { id: string })[] | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!user) return
    return onSnapshot(
      collection(db, 'users', user.uid, nome),
      snap => setItens(snap.docs.map(d => ({ id: d.id, ...(d.data({ serverTimestamps: 'estimate' }) as T) }))),
      () => setErro('Não foi possível carregar seus dados.'),
    )
  }, [user, nome])

  const falhou = () => setErro('Não foi possível salvar. Tente novamente.')

  // Não usamos await de propósito: sem internet, a gravação fica na fila e a tela
  // já atualiza com o cache local. Quando a conexão volta, o Firebase sincroniza.
  return {
    itens,
    erro,
    adicionar(dados: Record<string, unknown>) {
      addDoc(collection(db, 'users', user!.uid, nome), { ...dados, criadoEm: serverTimestamp() }).catch(falhou)
    },
    atualizar(id: string, dados: Record<string, unknown>) {
      updateDoc(doc(db, 'users', user!.uid, nome, id), dados).catch(falhou)
    },
    excluir(id: string) {
      deleteDoc(doc(db, 'users', user!.uid, nome, id)).catch(falhou)
    },
  }
}
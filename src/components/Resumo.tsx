import { useState } from 'react'

export default function Compartilhar({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false)

  async function compartilhar() {
    if (navigator.share) {
      try { await navigator.share({ text: texto }) } catch { /* cancelado */ }
    } else {
      try {
        await navigator.clipboard.writeText(texto)
        setOk(true)
        setTimeout(() => setOk(false), 2000)
      } catch {
        alert('Não foi possível copiar. Selecione e copie manualmente.')
      }
    }
  }

  return (
    <button className="btn-suave text-sm" onClick={compartilhar}>
      {ok ? 'Copiado ✓' : 'Compartilhar resumo'}
    </button>
  )
}
interface Props {
  foto?: string
  nome: string
  tamanho?: number
  className?: string
}

// Mostra a foto; se não houver, mostra a inicial do nome.
export default function Avatar({ foto, nome, tamanho = 64, className = '' }: Props) {
  const inicial = (nome.trim()[0] ?? '?').toUpperCase()
  const estilo = { width: tamanho, height: tamanho }

  if (foto) {
    return (
      <img
        src={foto}
        alt={`Foto de ${nome}`}
        style={estilo}
        className={`shrink-0 rounded-full object-cover shadow ring-2 ring-white ${className}`}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      style={{ ...estilo, fontSize: Math.round(tamanho * 0.45) }}
      className={`grid shrink-0 place-items-center rounded-full bg-blush-100 font-display text-blush-600 shadow ring-2 ring-white ${className}`}
    >
      {inicial}
    </div>
  )
}
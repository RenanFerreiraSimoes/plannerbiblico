import { Info } from 'lucide-react'

// Aviso fixo mostrado no fim de cada devocional.
// Se um pastor revisar o texto, o campo `revisadoPor` aparece no lugar do aviso.
export default function NotaDeApoio({ revisadoPor }: { revisadoPor?: string }) {
  return (
    <div className="mt-6 flex gap-2 rounded-xl border border-nude bg-marfim/60 p-3 text-xs leading-relaxed text-tinta/70">
      <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p>
        {revisadoPor
          ? `Texto revisado por ${revisadoPor}. A Bíblia continua sendo a referência principal.`
          : 'Texto de apoio para estudo pessoal. Não substitui a Bíblia nem o ensino da sua igreja. Em caso de dúvida, converse com seu pastor ou líder.'}
      </p>
    </div>
  )
}
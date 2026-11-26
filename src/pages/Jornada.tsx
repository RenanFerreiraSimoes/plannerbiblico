import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import CalendarioMes from '../components/CalendarioMes'
import GraficoLinha from '../components/GraficoLinha'
import Compartilhar from '../components/Resumo'
import { useAuth } from '../lib/AuthContext'
import { useProgresso } from '../lib/useProgresso'
import { useColecao } from '../lib/useColecao'
import { TOTAL_DIAS, TOTAL_CAPS } from '../lib/plano'
import { hojeISO, somarDias } from '../lib/datas'
import { atividadeMensal, atividadePorData, capsLidosDe, livrosConcluidos, pctLido, sequencias } from '../lib/jornada'

interface Nota { texto?: string }
interface Oracao { respondida?: boolean }

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const selo = (titulo: string, desc: string, feito: boolean) => (
  <div className={`card flex flex-col items-center text-center ${feito ? '' : 'opacity-40'}`}>
    <span className="text-3xl">{feito ? '🌸' : '·'}</span>
    <p className="mt-2 font-display text-lg text-blush-600">{titulo}</p>
    <p className="text-xs text-tinta/60">{desc}</p>
  </div>
)

export default function Jornada() {
  const { perfil } = useAuth()
  const { feitos } = useProgresso()
  const notas = useColecao<Nota>('notas')
  const oracoes = useColecao<Oracao>('oracoes')

  const nome = perfil!.nome.split(' ')[0]
  const concluidos = feitos.size
  const caps = capsLidosDe(feitos)
  const pct = pctLido(feitos)
  const { atual, maior } = sequencias(feitos)
  const livros = livrosConcluidos(feitos)
  const meses = atividadeMensal(feitos)
  const porData = atividadePorData(feitos)

  const notasCount = (notas.itens ?? []).filter(n => n.texto?.trim()).length
  const oracoesCount = (oracoes.itens ?? []).length
  const respondidasCount = (oracoes.itens ?? []).filter(o => o.respondida).length

  // últimos 30 dias, para o gráfico
  const pontos = useMemo(() => {
    const hoje = hojeISO()
    return Array.from({ length: 30 }, (_, i) => {
      const data = somarDias(hoje, i - 29)
      return { data, valor: porData.get(data)?.caps ?? 0 }
    })
  }, [porData])

  const resumo = `${nome} já leu ${pct}% da Bíblia (${concluidos} de ${TOTAL_DIAS} dias, ${caps} de ${TOTAL_CAPS} capítulos), com ${atual} dia(s) seguido(s) e ${respondidasCount} oração(ões) respondida(s). "Lâmpada para os meus pés é a tua palavra."`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo">Minha caminhada com Deus</h1>
        <Compartilhar texto={resumo} />
      </div>

      {/* indicadores */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card text-center"><p className="font-display text-4xl text-blush-600">{pct}%</p><p className="text-xs text-tinta/60">da Bíblia</p></div>
        <div className="card text-center"><p className="font-display text-4xl text-blush-600">{concluidos}</p><p className="text-xs text-tinta/60">dias concluídos</p></div>
        <div className="card text-center"><p className="font-display text-4xl text-blush-600">{caps}</p><p className="text-xs text-tinta/60">capítulos lidos</p></div>
        <div className="card text-center"><p className="font-display text-4xl text-blush-600">{livros.length}</p><p className="text-xs text-tinta/60">livros concluídos</p></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center"><p className="font-display text-4xl text-blush-600">{atual}</p><p className="text-xs text-tinta/60">sequência atual</p></div>
        <div className="card text-center"><p className="font-display text-4xl text-blush-600">{maior}</p><p className="text-xs text-tinta/60">maior sequência</p></div>
      </div>

      {/* gráfico dos últimos 30 dias */}
      <div className="card">
        <h2 className="font-display text-2xl text-blush-600">Ritmo recente</h2>
        <p className="text-xs text-tinta/60">Capítulos lidos por dia</p>
        <div className="mt-3"><GraficoLinha pontos={pontos} /></div>
      </div>

      {/* calendário do mês atual */}
      <div className="card">
        <CalendarioMes anoMes={hojeISO().slice(0, 7)} inicioPlano={perfil!.inicio} feitos={feitos}
          notasPorDia={new Map()} atividade={porData} mostrarMesAno clicavel />
      </div>

      {/* histórico mensal */}
      {meses.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-display text-2xl text-blush-600">Histórico mensal</h2>
          <div className="space-y-2">
            {meses.map(m => (
              <div key={m.chave} className="flex items-center gap-3">
                <span className="w-16 text-xs text-tinta/60">{MESES[Number(m.chave.slice(5)) - 1]}/{m.chave.slice(0, 4)}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-blush-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-blush-300 to-ouro"
                    style={{ width: `${Math.min(100, (m.dias / 31) * 100)}%` }} />
                </div>
                <span className="text-xs text-tinta/50">{m.dias}d · {m.caps}c</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* livros concluídos */}
      {livros.length > 0 && (
        <div className="card">
          <h2 className="font-display text-2xl text-blush-600">Livros concluídos</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {livros.map(l => (
              <span key={l.nome} className="rounded-full bg-blush-100 px-3 py-1 text-xs text-blush-600">{l.nome}</span>
            ))}
          </div>
        </div>
      )}

      {/* pequenas conquistas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {selo('Primeiros passos', 'Concluiu o 1º dia', concluidos >= 1)}
        {selo('Uma semana com Deus', '7 dias de leitura', concluidos >= 7)}
        {selo('Constante', '30 dias de leitura', concluidos >= 30)}
        {selo('Coração anotado', 'Escreveu uma anotação', notasCount >= 1)}
        {selo('Vida de oração', 'Registrou uma oração', oracoesCount >= 1)}
        {selo('Fidelidade vista', 'Uma oração respondida', respondidasCount >= 1)}
        {selo('Primeiro livro', 'Concluiu um livro', livros.length >= 1)}
        {selo('Metade do caminho', '50% da Bíblia', pct >= 50)}
        {selo('Jornada completa', 'Leu a Bíblia inteira', pct >= 100)}
      </div>

      <p className="text-center text-xs text-tinta/50">
        Não é uma corrida. É uma caminhada com Deus, um dia de cada vez. 🤍
      </p>

      {concluidos === 0 && (
        <div className="card text-center">
          <p className="text-tinta/70">Quando você começar, seus passos aparecerão aqui.</p>
          <Link to="/hoje" className="btn mt-3">Começar hoje</Link>
        </div>
      )}
    </div>
  )
}
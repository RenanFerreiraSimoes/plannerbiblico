const p2 = (n: number) => String(n).padStart(2, '0')
const toISO = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`

export const hojeISO = () => toISO(new Date())
export const parseISO = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const somarDias = (s: string, n: number) => { const d = parseISO(s); d.setDate(d.getDate() + n); return toISO(d) }
export const diffDias = (a: string, b: string) => Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86400000)
export const dataLonga = (s: string) =>
  parseISO(s).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
export const dataCurta = (s: string) => parseISO(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
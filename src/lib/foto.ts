const LADO = 320
const MAX_ENTRADA = 15 * 1024 * 1024 // 15 MB
const MAX_SAIDA = 120000 // caracteres do texto da imagem (~90 KB)

// Recebe a foto escolhida, recorta em quadrado no centro, reduz e devolve um texto (data URL JPEG).
export function comprimirFoto(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!arquivo.type.startsWith('image/')) {
      reject(new Error('Escolha um arquivo de imagem (JPG ou PNG).'))
      return
    }
    if (arquivo.size > MAX_ENTRADA) {
      reject(new Error('A imagem é muito grande. Escolha uma de até 15 MB.'))
      return
    }

    const url = URL.createObjectURL(arquivo)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      const lado = Math.min(img.naturalWidth, img.naturalHeight)
      if (!lado) {
        reject(new Error('Não consegui ler essa imagem. Tente outra.'))
        return
      }
      const canvas = document.createElement('canvas')
      canvas.width = LADO
      canvas.height = LADO
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Seu navegador não conseguiu preparar a imagem.'))
        return
      }
      const sx = (img.naturalWidth - lado) / 2
      const sy = (img.naturalHeight - lado) / 2
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, LADO, LADO)
      ctx.drawImage(img, sx, sy, lado, lado, 0, 0, LADO, LADO)

      let qualidade = 0.85
      let dados = canvas.toDataURL('image/jpeg', qualidade)
      while (dados.length > MAX_SAIDA && qualidade > 0.4) {
        qualidade -= 0.1
        dados = canvas.toDataURL('image/jpeg', qualidade)
      }
      resolve(dados)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não consegui abrir essa imagem. Tente outra (JPG ou PNG).'))
    }

    img.src = url
  })
}
// Constantes do jogo
const gravidade = 0.4;
const forcaPulo = 11;
const velocidadeQuedaMax = 12;
const intervaloGeracao = 90;
const larguraPlataforma = 70;
const alturaPlataforma = 14;
const larguraPersonagem = 32;
const alturaPersonagem = 32;

// Variáveis principais
let canvas, ctx;
let personagem, plataformas, alturaMaxima, jogoAtivo, animacaoId;
let esquerdaPressionada = false;
let direitaPressionada = false;

// Elementos DOM
const pontuacaoSpan = document.getElementById('pontuacao');
const gameOverDiv = document.getElementById('gameOver');
const pontuacaoFinal = document.getElementById('pontuacaoFinal');
const btnReiniciar = document.getElementById('btnReiniciar');

// Inicializa o jogo e variáveis
function inicializarJogo() {
  canvas = document.getElementById('canvasJogo');
  ctx = canvas.getContext('2d');
  personagem = {
    x: canvas.width / 2 - larguraPersonagem / 2,
    y: canvas.height - 80,
    velocidadeY: 0,
    alturaPulo: forcaPulo,
    pulando: false
  };
  plataformas = [];
  alturaMaxima = 0;
  jogoAtivo = true;
  gerarPlataformasIniciais();
  atualizarPontuacao(0);
  gameOverDiv.classList.remove('visivel');
  gameOverDiv.classList.add('oculto');
  loopJogo();
}

// Gera plataformas iniciais
function gerarPlataformasIniciais() {
  plataformas = [];
  // Garante uma plataforma centralizada logo abaixo do personagem
  const yBase = canvas.height - 40;
  plataformas.push({
    x: canvas.width / 2 - larguraPlataforma / 2,
    y: yBase,
    largura: larguraPlataforma,
    altura: alturaPlataforma
  });
  // Gera as demais plataformas acima
  const qtd = Math.ceil(canvas.height / intervaloGeracao) + 2;
  for (let i = 1; i < qtd; i++) {
    plataformas.push({
      x: Math.random() * (canvas.width - larguraPlataforma),
      y: yBase - i * intervaloGeracao,
      largura: larguraPlataforma,
      altura: alturaPlataforma
    });
  }
}

// Gera uma nova plataforma acima
function gerarPlataforma(y) {
  return {
    x: Math.random() * (canvas.width - larguraPlataforma),
    y: y,
    largura: larguraPlataforma,
    altura: alturaPlataforma
  };
}

// Atualiza física do personagem e plataformas
function atualizarFisica() {
  // Movimento lateral
  if (esquerdaPressionada) personagem.x -= 5;
  if (direitaPressionada) personagem.x += 5;
  // Impede sair da tela
  if (personagem.x < 0) personagem.x = 0;
  if (personagem.x + larguraPersonagem > canvas.width) personagem.x = canvas.width - larguraPersonagem;

  personagem.velocidadeY += gravidade;
  if (personagem.velocidadeY > velocidadeQuedaMax) personagem.velocidadeY = velocidadeQuedaMax;
  personagem.y += personagem.velocidadeY;

  // Se personagem subir acima do meio, rola cenário
  if (personagem.y < canvas.height / 2) {
    const deslocamento = (canvas.height / 2) - personagem.y;
    personagem.y = canvas.height / 2;
    plataformas.forEach(p => p.y += deslocamento);
    alturaMaxima += deslocamento;
    atualizarPontuacao(Math.floor(alturaMaxima));
  }
}

// Desenha toda a cena
function desenharCena() {
  desenharFundo();
  desenharPlataformas();
  desenharPersonagem();
}

// Desenha fundo com gradiente e shapes
function desenharFundo() {
  const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
  grad.addColorStop(0, '#b2ebf2');
  grad.addColorStop(1, '#e0f7fa');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Linhas decorativas
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  for (let i = 0; i < canvas.height; i += 60) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
}

// Desenha plataformas
function desenharPlataformas() {
  ctx.fillStyle = '#0097a7';
  plataformas.forEach(p => {
    ctx.fillRect(p.x, p.y, p.largura, p.altura);
    ctx.strokeStyle = '#006064';
    ctx.strokeRect(p.x, p.y, p.largura, p.altura);
  });
}

// Desenha personagem
function desenharPersonagem() {
  ctx.save();
  ctx.translate(personagem.x + larguraPersonagem/2, personagem.y + alturaPersonagem/2);
  ctx.fillStyle = '#ffb300';
  ctx.beginPath();
  ctx.arc(0, 0, larguraPersonagem/2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ff6f00';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Olhos
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(-6, -4, 3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, -4, 3, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// Detecta colisão com plataformas
function detectarColisao() {
  if (personagem.velocidadeY > 0) {
    for (let p of plataformas) {
      if (
        personagem.x + larguraPersonagem > p.x &&
        personagem.x < p.x + p.largura &&
        personagem.y + alturaPersonagem > p.y &&
        personagem.y + alturaPersonagem < p.y + p.altura + personagem.velocidadeY
      ) {
        personagem.y = p.y - alturaPersonagem;
        personagem.velocidadeY = -personagem.alturaPulo;
        break;
      }
    }
  }
}

// Gerencia plataformas (remove e adiciona)
function gerenciarPlataformas() {
  // Remove plataformas fora da tela
  plataformas = plataformas.filter(p => p.y < canvas.height + 40);
  // Adiciona novas plataformas acima
  while (plataformas.length < Math.ceil(canvas.height / intervaloGeracao) + 2) {
    const yMin = Math.min(...plataformas.map(p => p.y));
    plataformas.push(gerarPlataforma(yMin - intervaloGeracao));
  }
}

// Atualiza HUD de pontuação
function atualizarPontuacao(valor) {
  pontuacaoSpan.textContent = `Altura: ${valor}`;
}

// Loop principal do jogo
function loopJogo() {
  if (!jogoAtivo) return;
  atualizarFisica();
  detectarColisao();
  gerenciarPlataformas();
  desenharCena();
  if (personagem.y > canvas.height) {
    encerrarJogo();
    return;
  }
  animacaoId = requestAnimationFrame(loopJogo);
}

// Encerra o jogo e exibe tela de Game Over
function encerrarJogo() {
  jogoAtivo = false;
  pontuacaoFinal.textContent = `Altura máxima: ${Math.floor(alturaMaxima)}`;
  gameOverDiv.classList.remove('oculto');
  setTimeout(() => gameOverDiv.classList.add('visivel'), 50);
}

// Reinicia o jogo
function reiniciarJogo() {
  cancelAnimationFrame(animacaoId);
  inicializarJogo();
}

// Evento de pulo (tecla ou clique)
function eventoPulo(e) {
  if (!jogoAtivo) return;
  // Só permite pulo se personagem estiver "colado" em uma plataforma
  for (let p of plataformas) {
    if (
      personagem.x + larguraPersonagem > p.x &&
      personagem.x < p.x + p.largura &&
      Math.abs(personagem.y + alturaPersonagem - p.y) < 2
    ) {
      personagem.velocidadeY = -personagem.alturaPulo;
      break;
    }
  }
}

// Eventos
window.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') esquerdaPressionada = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') direitaPressionada = true;
  if (e.code === 'Space' || e.code === 'ArrowUp') eventoPulo();
});
window.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') esquerdaPressionada = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') direitaPressionada = false;
});
btnReiniciar && btnReiniciar.addEventListener('click', reiniciarJogo);

// Fade-in inicial
window.onload = () => {
  inicializarJogo();
  document.getElementById('jogo').style.opacity = 0;
  setTimeout(() => {
    document.getElementById('jogo').style.transition = 'opacity 0.7s';
    document.getElementById('jogo').style.opacity = 1;
  }, 80);
};

// Comentários explicativos nas funções principais:
// inicializarJogo(): prepara variáveis e estado inicial do jogo.
// atualizarFisica(): aplica gravidade, movimenta personagem e rola cenário.
// desenharCena(): desenha fundo, plataformas e personagem.
// detectarColisao(): verifica se personagem colidiu com plataforma para permitir pulo.
// gerenciarPlataformas(): remove plataformas fora da tela e gera novas acima.

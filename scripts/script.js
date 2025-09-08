
  // ----- Config -----
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const tileSize = 20;                     // tamaño del cuadro
  const cols = canvas.width / tileSize;    // 20
  const rows = canvas.height / tileSize;   // 20
  let speed = 10;                          // frames por segundo
  const speedLabel = document.getElementById('speedLabel');
  speedLabel.textContent = speed;

  // ----- Estado del juego -----
  let snake = [];           // array de segmentos {x,y}
  let dir = {x:1, y:0};     // dirección actual
  let nextDir = {x:1, y:0}; // buffer para evitar reversos instantáneos
  let food = null;
  let score = 0;
  let running = false;
  let paused = false;
  let loopId = null;

  // ----- Elementos UI -----
  const scoreEl = document.getElementById('score');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');

  // ----- Inicializar -----
  function resetGame() {
    snake = [
      {x: Math.floor(cols/2)-1, y: Math.floor(rows/2)},
      {x: Math.floor(cols/2)-2, y: Math.floor(rows/2)},
      {x: Math.floor(cols/2)-3, y: Math.floor(rows/2)}
    ];
    dir = {x:1, y:0};
    nextDir = {x:1, y:0};
    placeFood();
    score = 0;
    scoreEl.textContent = score;
    paused = false;
  }

  function placeFood() {
    // Genera posición aleatoria que no colisione con la serpiente
    let tries = 0;
    while (true) {
      tries++;
      const fx = Math.floor(Math.random() * cols);
      const fy = Math.floor(Math.random() * rows);
      if (!snake.some(s => s.x === fx && s.y === fy)) {
        food = {x: fx, y: fy};
        return;
      }
      if (tries > 1000) { food = null; return; }
    }
  }

  // ----- Lógica del juego -----
  function update() {
    if (!running || paused) return;

    // aplicar nextDir (evita reversos)
    if ((nextDir.x !== -dir.x || nextDir.y !== -dir.y)) {
      dir = nextDir;
    }

    // nuevo head
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // detectar colisión pared
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      gameOver();
      return;
    }

    // detectar colisión con el propio cuerpo
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      gameOver();
      return;
    }

    // agregar head al principio
    snake.unshift(head);

    // si come comida
    if (food && head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      placeFood();
      // opcional: aumentar velocidad cada X puntos
      if (score % 50 === 0 && speed < 20) {
        speed += 1;
        restartLoop();
        speedLabel.textContent = speed;
      }
    } else {
      // quitar cola (no crecer)
      snake.pop();
    }
  }

  function draw() {
    // fondo
    ctx.fillStyle = '#041024';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // dibujar comida
    if (food) {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(food.x*tileSize + 2, food.y*tileSize + 2, tileSize-4, tileSize-4);
    }

    // dibujar serpiente
    for (let i=0;i<snake.length;i++){
      const s = snake[i];
      if (i===0) {
        ctx.fillStyle = '#2f855a'; // cabeza
      } else {
        ctx.fillStyle = '#68d391'; // cuerpo
      }
      ctx.fillRect(s.x*tileSize, s.y*tileSize, tileSize, tileSize);
      // borde sutil
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.strokeRect(s.x*tileSize+0.5, s.y*tileSize+0.5, tileSize-1, tileSize-1);
    }
  }

  function gameLoop() {
    update();
    draw();
  }

  function startGame(){
    if (!running) {
      resetGame();
      running = true;
      restartLoop();
      startBtn.textContent = 'Reiniciar';
      pauseBtn.textContent = 'Pausa';
      paused = false;
    } else {
      // reiniciar
      resetGame();
    }
  }

  function restartLoop(){
    if (loopId) clearInterval(loopId);
    loopId = setInterval(gameLoop, 1000 / speed);
  }

  function togglePause(){
    if (!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? 'Continuar' : 'Pausa';
  }

  function gameOver(){
    running = false;
    if (loopId) { clearInterval(loopId); loopId = null; }
    // mensaje simple
    setTimeout(()=> {
      alert('Game Over! Puntaje: ' + score + ' Nya~ :3');
      // deja el botón listo para reiniciar
      startBtn.textContent = 'Empezar';
    }, 50);
  }

  // ----- Controles -----
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key === 'ArrowUp' || key === 'w' || key === 'W')    nextDir = {x:0, y:-1};
    if (key === 'ArrowDown' || key === 's' || key === 'S')  nextDir = {x:0, y:1};
    if (key === 'ArrowLeft' || key === 'a' || key === 'A')  nextDir = {x:-1, y:0};
    if (key === 'ArrowRight' || key === 'd' || key === 'D') nextDir = {x:1, y:0};
    if (key === ' '){ togglePause(); } // barra espaciadora pausa
  });

  // Touch buttons
  document.getElementById('upBtn').addEventListener('pointerdown', ()=> nextDir={x:0,y:-1});
  document.getElementById('downBtn').addEventListener('pointerdown', ()=> nextDir={x:0,y:1});
  document.getElementById('leftBtn').addEventListener('pointerdown', ()=> nextDir={x:-1,y:0});
  document.getElementById('rightBtn').addEventListener('pointerdown', ()=> nextDir={x:1,y:0});

  // UI
  startBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', togglePause);

  // iniciar en estado inactivo con dibujo inicial
  resetGame();
  draw();

  // para accesibilidad: ajustar velocidad con +/- si quieren (opcional)
  window.addEventListener('keydown', (e) => {
    if (e.key === '+') { speed = Math.min(30, speed+1); restartLoop(); speedLabel.textContent = speed; }
    if (e.key === '-') { speed = Math.max(4, speed-1); restartLoop(); speedLabel.textContent = speed; }
  });

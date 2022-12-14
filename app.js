const tutorialSection = document.getElementById("tutorial-section");
const tutorialBtn = document.getElementById("tutorial-btn");
const easyBtn = document.getElementById("easy-btn");
const normalBtn = document.getElementById("normal-btn");
const hardBtn = document.getElementById("hard-btn");

const grid = document.querySelector(".grid");
const resultsDisplay = document.querySelector(".results");

const backgroundMusic = new sound("bgMusic.wav");
const startMusic = new sound("start.mp3");
const invadersMoveMusic = new sound("invadersMove.mp3");
const shootMusic = new sound("shoot.wav");
const explodeMusic = new sound("explode.wav");
const winMusic = new sound("win.mp3");
const gameOverMusic = new sound("gameOver.mp3");

let results = 0;
const width = 15;
let currentShooterIndex;
let direction = 1;
let isGoingRight = true;
let aliensInterval;
const fixedAlienPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39];
let alienPositions = [...fixedAlienPositions];
let alienRemovedPositions = [];

for (let i = 0; i < width ** 2; i++) {
  grid.appendChild(document.createElement("div"));
}

const squares = [...document.querySelectorAll(".grid div")];

for (let i = 0; i < alienPositions.length; i++) {
  squares[alienPositions[i]].classList.add("invader");
}

tutorialBtn.addEventListener("click", () => {
  tutorialSection.style.display = "none";
  backgroundMusic.play();
});

easyBtn.addEventListener("click", () => {
  document.addEventListener("keydown", moveShooter);
  document.addEventListener("keydown", shoot);
  startGame(1000);
  startMusic.play();
});
normalBtn.addEventListener("click", () => {
  document.addEventListener("keydown", moveShooter);
  document.addEventListener("keydown", shoot);
  startGame(600);
  startMusic.play();
});
hardBtn.addEventListener("click", () => {
  document.addEventListener("keydown", moveShooter);
  document.addEventListener("keydown", shoot);
  startGame(300);
  startMusic.play();
});

document.addEventListener("keydown", moveShooter);
document.addEventListener("keydown", shoot);

function moveShooter(e) {
  switch (e.key) {
    case "ArrowLeft":
      if (currentShooterIndex % width !== 0) {
        squares[currentShooterIndex].classList.remove("shooter");
        currentShooterIndex--;
        squares[currentShooterIndex].classList.add("shooter");
      }
      break;
    case "ArrowRight":
      if (currentShooterIndex % width < width - 1) {
        squares[currentShooterIndex].classList.remove("shooter");
        currentShooterIndex++;
        squares[currentShooterIndex].classList.add("shooter");
      }
      break;
  }
}

function shoot(e) {
  if (e.key === "ArrowUp") {
    shootMusic.play();
    let currentLaserIndex = currentShooterIndex;
    const laserInterval = setInterval(moveLaser, 100);

    function moveLaser() {
      squares[currentLaserIndex].classList.remove("laser");
      currentLaserIndex -= width;

      if (currentLaserIndex < 0) {
        clearInterval(laserInterval);
      } else {
        squares[currentLaserIndex].classList.add("laser");

        if (squares[currentLaserIndex].classList.contains("invader")) {
          squares[currentLaserIndex].classList.remove("laser");
          squares[currentLaserIndex].classList.remove("invader");
          squares[currentLaserIndex].classList.add("boom");
          explodeMusic.play();

          setTimeout(() => squares[currentLaserIndex].classList.remove("boom"), 200);

          clearInterval(laserInterval);

          alienRemovedPositions.push(alienPositions.indexOf(currentLaserIndex));

          results++;

          resultsDisplay.innerHTML = "Score: " + results;

          if (results === 30) {
            resultsDisplay.innerHTML = `<span style="color: lightgreen">"YOU WIN"</span>`;
            winMusic.play();
            clearInterval(aliensInterval);
            document.removeEventListener("keydown", moveShooter);
            document.removeEventListener("keydown", shoot);
          }
        }
      }
    }
  }
}

function startGame(level) {
  results = 0;
  resultsDisplay.innerHTML = "Score: " + results;
  currentShooterIndex = width ** 2 - Math.ceil(width / 2);
  direction = 1;
  isGoingRight = true;
  clearInterval(aliensInterval);
  alienPositions = [...fixedAlienPositions];
  alienRemovedPositions.splice(0);

  for (let i = 0; i < squares.length; i++) {
    squares[i].classList.remove("invader", "shooter", "laser", "boom");
  }

  for (let i = 0; i < alienPositions.length; i++) {
    squares[alienPositions[i]].classList.add("invader");
  }

  squares[currentShooterIndex].classList.add("shooter");

  aliensInterval = setInterval(moveAliens, level);

  function moveAliens() {
    const leftEdge = alienPositions[0] % width === 0;
    const rightEdge = alienPositions[alienPositions.length - 1] % width === width - 1;

    for (let i = 0; i < alienPositions.length; i++) {
      if (!alienRemovedPositions.includes(i)) {
        squares[alienPositions[i]].classList.remove("invader");
      }
    }

    if (rightEdge && isGoingRight) {
      invadersMoveMusic.play();
      for (let i = 0; i < alienPositions.length; i++) {
        alienPositions[i] += width + 1;
        direction = -1;
        isGoingRight = false;
      }
    }

    if (leftEdge && !isGoingRight) {
      invadersMoveMusic.play();
      for (let i = 0; i < alienPositions.length; i++) {
        alienPositions[i] += width - 1;
        direction = 1;
        isGoingRight = true;
      }
    }

    for (let i = 0; i < alienPositions.length; i++) {
      alienPositions[i] += direction;
    }

    for (let i = 0; i < alienPositions.length; i++) {
      if (!alienRemovedPositions.includes(i)) {
        if (alienPositions[i] > 209) {
          resultsDisplay.innerHTML = `<span style="color: red">"GAME OVER"</span>`;
          gameOverMusic.play();
          clearInterval(aliensInterval);
          document.removeEventListener("keydown", moveShooter);
          document.removeEventListener("keydown", shoot);
        }
        squares[alienPositions[i]].classList.add("invader");
      }
    }

    if (squares[currentShooterIndex].classList.contains("invader", "shooter")) {
      resultsDisplay.innerHTML = `<span style="color: red">"GAME OVER"</span>`;
      gameOverMusic.play();
      clearInterval(aliensInterval);
      document.removeEventListener("keydown", moveShooter);
      document.removeEventListener("keydown", shoot);
    }
  }
}

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function () {
    this.sound.play();
  };
  this.stop = function () {
    this.sound.pause();
  };
}

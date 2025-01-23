// JavaScript Code
const canvas = document.getElementById('wordleCanvas');
const ctx = canvas.getContext('2d');
const keyboardDiv = document.getElementById('keyboard');
const guessInput = document.getElementById('guessInput');
const submitButton = document.getElementById('submitGuess'); 

const rows = 6;
const cols = 5;
const boxSize = 50;
let wordToGuess = '';
let currentRow = 0;
let guesses = [];
let keysState = {};


function fetchWord() {
    const wordList = [
      'APPLE', 'BRAVE', 'CANDY', 'DELTA', 'EAGER', 'FLAIR', 'GIANT', 'HAPPY', 'IRONY', 'CRAZY'
    ];
    const randomIndex = Math.floor(Math.random() * wordList.length);
    wordToGuess = wordList[randomIndex];
    console.log('Word to guess:', wordToGuess);
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const startX = (canvas.width - cols * boxSize) / 2;
  const startY = (canvas.height - rows * boxSize) / 2;
  ctx.strokeStyle = '#000';

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = startX + j * boxSize;
      const y = startY + i * boxSize;
      ctx.strokeRect(x, y, boxSize, boxSize);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 1, y + 1, boxSize - 2, boxSize - 2);
    }
  }
}

function drawPartialGuess(guess, row) {
  const startX = (canvas.width - cols * boxSize) / 2;
  const startY = (canvas.height - rows * boxSize) / 2;
  for (let i = 0; i < guess.length; i++) {
    const x = startX + i * boxSize;
    const y = startY + row * boxSize;
    ctx.fillStyle = '#ddd';
    ctx.fillRect(x, y, boxSize, boxSize);
    ctx.strokeRect(x, y, boxSize, boxSize);
    ctx.fillStyle = '#000';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(guess[i], x + boxSize / 2, y + boxSize / 2);
  }
}

function drawGuess(guess, row) {
  const startX = (canvas.width - cols * boxSize) / 2;
  const startY = (canvas.height - rows * boxSize) / 2;
  for (let i = 0; i < cols; i++) {
    const x = startX + i * boxSize;
    const y = startY + row * boxSize;
    const letter = guess[i];
    ctx.fillStyle = getLetterColor(letter, i);
    ctx.fillRect(x, y, boxSize, boxSize);
    ctx.strokeRect(x, y, boxSize, boxSize);
    ctx.fillStyle = '#000';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, x + boxSize / 2, y + boxSize / 2);
  }
}

function getLetterColor(letter, index) {
  if (wordToGuess[index] === letter) {
    return 'green';
  } else if (wordToGuess.includes(letter)) {
    return 'orange';
  }
  return 'grey';
}

function handleGuess() {
  const guess = guessInput.value.toUpperCase();
  if (guess.length !== cols || currentRow >= rows) {
    alert('Invalid guess!');
    return;
  }
  guesses.push(guess);
  updateKeyboard(guess);
  drawGuess(guess, currentRow);
  currentRow++;

  if (guess === wordToGuess) {
    setTimeout(() => {
      alert('Congratulations! You guessed the word!');
      resetGame(true);
    }, 500);
  } else if (currentRow === rows) {
    setTimeout(() => {
      alert(`Game Over! The word was: ${wordToGuess}`);
      resetGame(false);
    }, 500);
  }
  guessInput.value = '';
}

function generateKeyboard() {
  keyboardDiv.innerHTML = '';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  alphabet.split('').forEach((letter) => {
    const key = document.createElement('div');
    key.classList.add('key');
    key.innerText = letter;
    key.addEventListener('click', () => {
      guessInput.value += letter;
    });
    keyboardDiv.appendChild(key);
    keysState[letter] = 'default';
  });
}

function updateKeyboard(guess) {
  guess.split('').forEach((letter, index) => {
    if (wordToGuess[index] === letter) {
      keysState[letter] = 'correct';
    } else if (wordToGuess.includes(letter)) {
      keysState[letter] = 'misplaced';
    } else {
      keysState[letter] = 'wrong';
    }

    document.querySelectorAll('.key').forEach((key) => {
      if (key.innerText === letter) {
        key.className = `key ${keysState[letter]}`;
      }
    });
  });
}

function saveToLeaderboard(playerName, guessesCount) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push({ playerName, guesses: guessesCount });
  leaderboard.sort((a, b) => a.guesses - b.guesses);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
}

function showLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  const leaderboardTable = document.getElementById('leaderboardTable').querySelector('tbody');
  leaderboardTable.innerHTML = '';
  leaderboard.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.playerName}</td>
      <td>${entry.guesses}</td>
    `;
    leaderboardTable.appendChild(row);
  });
  document.getElementById('leaderboard').style.display = 'block';
}

document.getElementById('closeLeaderboard').addEventListener('click', () => {
  document.getElementById('leaderboard').style.display = 'none';
});

function resetGame(isWin) {
  if (isWin) {
    const playerName = prompt('Enter your name for the leaderboard:');
    if (playerName) {
      saveToLeaderboard(playerName, currentRow);
    }
  }
  showLeaderboard();
  currentRow = 0;
  guesses = [];
  keysState = {};
  generateKeyboard();
  drawGrid();
  fetchWord();
  guessInput.value = '';
  guessInput.focus();
}

function init() {
  fetchWord();
  drawGrid();
  generateKeyboard();
  guessInput.addEventListener('input', () => {
    const currentGuess = guessInput.value.toUpperCase();
    drawGrid();
    drawPartialGuess(currentGuess, currentRow);
  });
  submitButton.addEventListener('click', handleGuess);

  if (!localStorage.getItem('leaderboard')) {
    localStorage.setItem('leaderboard', JSON.stringify([]));
  }
}

init();

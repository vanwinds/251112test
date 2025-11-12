// 게임 상태
let board = [];
let score = 0;
let gameOver = false;
let gameWon = false;

const GRID_SIZE = 4;
const gameBoard = document.getElementById('gameBoard');
const scoreElement = document.getElementById('score');
const gameMessage = document.getElementById('gameMessage');
const newGameBtn = document.getElementById('newGameBtn');

// 게임 초기화
function initGame() {
    board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    score = 0;
    gameOver = false;
    gameWon = false;
    gameMessage.textContent = '';
    updateScore();
    renderBoard();
    
    // 시작 시 2개의 '2' 타일을 랜덤 위치에 생성
    addRandomTile();
    addRandomTile();
    renderBoard();
}

// 빈 셀 찾기
function getEmptyCells() {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }
    return emptyCells;
}

// 랜덤한 위치에 타일 추가
function addRandomTile() {
    const emptyCells = getEmptyCells();
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell.row][randomCell.col] = 2;
    }
}

// 보드 렌더링
function renderBoard() {
    gameBoard.innerHTML = '';
    
    // 빈 그리드 셀 생성
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            gameBoard.appendChild(cell);
        }
    }
    
    // 타일 생성
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] !== 0) {
                const tile = document.createElement('div');
                tile.className = `tile tile-${board[i][j]}`;
                tile.textContent = board[i][j];
                
                // 위치 계산
                const cellSize = (gameBoard.offsetWidth - 50) / GRID_SIZE;
                tile.style.left = `${j * (cellSize + 10) + 10}px`;
                tile.style.top = `${i * (cellSize + 10) + 10}px`;
                tile.style.width = `${cellSize}px`;
                tile.style.height = `${cellSize}px`;
                
                gameBoard.appendChild(tile);
            }
        }
    }
}

// 점수 업데이트
function updateScore() {
    scoreElement.textContent = score;
}

// 행 이동 (왼쪽으로)
function moveRowLeft(row) {
    const filtered = row.filter(val => val !== 0);
    const merged = [];
    let i = 0;
    
    while (i < filtered.length) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
            merged.push(filtered[i] * 2);
            score += filtered[i] * 2;
            i += 2;
        } else {
            merged.push(filtered[i]);
            i++;
        }
    }
    
    while (merged.length < GRID_SIZE) {
        merged.push(0);
    }
    
    return merged;
}

// 보드 회전
function rotateBoard(clockwise = true) {
    const newBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    
    if (clockwise) {
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                newBoard[j][GRID_SIZE - 1 - i] = board[i][j];
            }
        }
    } else {
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                newBoard[GRID_SIZE - 1 - j][i] = board[i][j];
            }
        }
    }
    
    board = newBoard;
}

// 이동 함수
function move(direction) {
    if (gameOver) return;
    
    const previousBoard = board.map(row => [...row]);
    
    switch (direction) {
        case 'left':
            for (let i = 0; i < GRID_SIZE; i++) {
                board[i] = moveRowLeft(board[i]);
            }
            break;
        case 'right':
            rotateBoard();
            rotateBoard();
            for (let i = 0; i < GRID_SIZE; i++) {
                board[i] = moveRowLeft(board[i]);
            }
            rotateBoard();
            rotateBoard();
            break;
        case 'up':
            rotateBoard(false);
            for (let i = 0; i < GRID_SIZE; i++) {
                board[i] = moveRowLeft(board[i]);
            }
            rotateBoard(true);
            break;
        case 'down':
            rotateBoard(true);
            for (let i = 0; i < GRID_SIZE; i++) {
                board[i] = moveRowLeft(board[i]);
            }
            rotateBoard(false);
            break;
    }
    
    // 보드가 변경되었는지 확인
    const boardChanged = JSON.stringify(previousBoard) !== JSON.stringify(board);
    
    if (boardChanged) {
        addRandomTile();
        updateScore();
        renderBoard();
        checkGameState();
    }
}

// 게임 상태 확인
function checkGameState() {
    // 2048 달성 확인
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] === 2048 && !gameWon) {
                gameWon = true;
                gameMessage.textContent = '축하합니다! 2048을 달성했습니다!';
                gameMessage.style.color = '#edc22e';
            }
        }
    }
    
    // 게임 오버 확인
    if (getEmptyCells().length === 0) {
        // 이동 가능한지 확인
        let canMove = false;
        
        // 가로 방향 확인
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE - 1; j++) {
                if (board[i][j] === board[i][j + 1]) {
                    canMove = true;
                }
            }
        }
        
        // 세로 방향 확인
        for (let i = 0; i < GRID_SIZE - 1; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (board[i][j] === board[i + 1][j]) {
                    canMove = true;
                }
            }
        }
        
        if (!canMove) {
            gameOver = true;
            gameMessage.textContent = '게임 오버!';
            gameMessage.style.color = '#f65e3b';
        }
    }
}

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
    if (gameOver && !gameWon) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            move('left');
            break;
        case 'ArrowRight':
            e.preventDefault();
            move('right');
            break;
        case 'ArrowUp':
            e.preventDefault();
            move('up');
            break;
        case 'ArrowDown':
            e.preventDefault();
            move('down');
            break;
    }
});

// 새 게임 버튼
newGameBtn.addEventListener('click', () => {
    initGame();
});

// 게임 시작
initGame();


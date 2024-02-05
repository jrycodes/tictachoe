document.addEventListener("DOMContentLoaded", function () {
    const board = document.getElementById("game-board");
    const resetButton = document.getElementById("resetButton");
    const playerXWinsDisplay = document.getElementById("playerXWins");
    const playerOWinsDisplay = document.getElementById("playerOWins");
    const difficultySelect = document.getElementById("difficulty");
    const rows = 5;
    const cols = 6;

    let currentPlayer = "X";
    let gameBoard = Array.from({ length: rows }, () => Array(cols).fill(""));
    let playerXTally = 0;
    let playerOTally = 0;
    let player1Name, player2Name; // Declare variables for player names
    let aiDifficulty;

    // Initialize the game board
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener("click", handleCellClick);
            board.appendChild(cell);
        }
    }

    // Adds event listener for the "START GAME" button
    const playButton = document.getElementById("play");
    playButton.addEventListener("click", function () {
        player1Name = document.getElementById('player1Name').value || "Player 1";
        player2Name = "AI";

        // Sets the initial player names
        playerXWinsDisplay.textContent = `${player1Name} Wins: 0`;
        playerOWinsDisplay.textContent = `${player2Name} Wins: 0`;
        document.getElementById('currentTurn').textContent = `${player1Name}'s Turn`;

        document.getElementById('hiddenElements').style.display = 'block';

        // Enables human player after showing elements
        enableHumanPlayer();

        // Gets the selected AI difficulty
        aiDifficulty = difficultySelect.value;
    });

    function enableHumanPlayer() {
        document.querySelectorAll(".cell").forEach((cell) => {
            cell.addEventListener("click", handleCellClick);
        });
    }

    function handleCellClick(event) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
    
        if (gameBoard[row][col] === "") {
            gameBoard[row][col] = currentPlayer;
            event.target.textContent = currentPlayer;
    
            // Apply color to the text based on the player
            event.target.style.color = currentPlayer === "X" ? "red" : "blue"; 
            
            // Check for a win or a tie 
            if (checkForWin(row, col)) {
                announceWinner();
                setTimeout(() => {
                    if (currentPlayer === "X") {
                        alert(`${player1Name} wins!`);
                        updateWinTally(currentPlayer);
                    } else {
                        alert(`${player2Name} wins!`);
                        updateWinTally(currentPlayer);
                    }
                    resetGame();
                }, 1000); // Delay before resetting 
            } else if (checkForTie()) {
                alert("It's a draw! No points awarded.");
                resetGame();
            } else {
                // Switch player
                currentPlayer = currentPlayer === "X" ? "O" : "X";
                document.getElementById('currentTurn').textContent = `${currentPlayer === "X" ? player1Name : player2Name}'s Turn`;
    
                // If the current player is AI, let the AI make a move
                if (currentPlayer === "O") {
                    setTimeout(makeAIMove, 500); // Delay
                }
            }
        }
    }
    
    function announceWinner() {
        // Change background color to goldenrod for the winning cells
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                if (checkForWin(i, j)) {
                    cell.style.backgroundColor = "goldenrod";
                }
            }
        }
    }
    
    function makeAIMove() {
    // Implements AI logic based on the selected difficulty
    const availableCells = [];

    // Copy the game board for simulation
    const tempBoard = JSON.parse(JSON.stringify(gameBoard));

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (tempBoard[i][j] === "") {
                availableCells.push({ row: i, col: j });
            }
        }
    }

    if (availableCells.length > 0) {
        let aiMove;

        if (aiDifficulty === "easy") {
            // Easy: Random move
            aiMove = getRandomMove(availableCells);
        } else if (aiDifficulty === "difficult") {
            // Difficult: Random move for 60%, Winning move for 40%
            aiMove = getSmartMove(availableCells, 80);
        } else if (aiDifficulty === "extreme") {
            // Extreme: Winning move for 60%, Blocking move for 30%, Random move for 10%
            aiMove = getSmartMove(availableCells, 99);
        }

        gameBoard[aiMove.row][aiMove.col] = "O";
        const cell = document.querySelector(`.cell[data-row="${aiMove.row}"][data-col="${aiMove.col}"]`);
        cell.textContent = "O";
        cell.style.color = "blue"; // Set the text color to blue

        if (checkForWin(aiMove.row, aiMove.col) || checkForTie()) {
            announceWinner(); // Highlight the winning cells
            setTimeout(() => {
                alert(`${player2Name} wins!`);
                updateWinTally(player2Name);
                resetGame();
            }, 1000); // Delay before resetting
        } else {
            // Switch player
            currentPlayer = "X";
            document.getElementById('currentTurn').textContent = `${player1Name}'s Turn`;
        }
		
    }
}
    
    

    function getRandomMove(availableCells) {
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        return availableCells[randomIndex];
    }

    function getSmartMove(availableCells, winningPercentage) {
    const randomPercentage = Math.random() * 100;

    if (randomPercentage < winningPercentage) {
        for (const cell of availableCells) {
            const tempBoard = JSON.parse(JSON.stringify(gameBoard));

            tempBoard[cell.row][cell.col] = "O";
            if (checkForWin(cell.row, cell.col)) {
                return cell;
            }

            tempBoard[cell.row][cell.col] = "X";
            if (checkForWin(cell.row, cell.col)) {
                return cell;
            }

            if (checkPotentialWin(tempBoard, cell.row, cell.col, "X", 4)) {
                return cell;
            }

            if (checkPotentialWin(tempBoard, cell.row, cell.col, "X", 5, true)) {
                return cell;
            }

            const blockMove = checkCornerMoves(tempBoard, "X");
            if (blockMove) {
                return blockMove;
            }
        }
    }

    if (aiDifficulty === "difficult" || aiDifficulty === "extreme") {
        // Block player's X moves in extreme difficulty
        const cornerMovesToBlock = [
            { row: 0, col: 0 }, // Top left
            { row: 0, col: cols - 1 }, // Top right
            { row: rows - 1, col: 0 }, // Bottom left
            { row: rows - 1, col: cols - 1 } // Bottom right
        ];

        for (const corner of cornerMovesToBlock) {
            if (gameBoard[corner.row][corner.col] === "X") {
                const blockMove = blockCornerMove(tempBoard, corner.row, corner.col);
                if (blockMove) {
                    return blockMove;
                }
            }
        }

        const centerMove = availableCells.find(cell => cell.row === Math.floor(rows / 2) && cell.col === Math.floor(cols / 2));
        if (centerMove) {
            return centerMove;
        }

        const cornerMoves = availableCells.filter(cell => (cell.row === 0 || cell.row === rows - 1) && (cell.col === 0 || cell.col === cols - 1));
        if (cornerMoves.length > 0) {
            return getRandomMove(cornerMoves);
        }

        const edgeMoves = availableCells.filter(cell => (cell.row === 0 || cell.row === rows - 1) || (cell.col === 0 || cell.col === cols - 1));
        if (edgeMoves.length > 0) {
            return getRandomMove(edgeMoves);
        }

        const cornerMove = checkCornerMoves(tempBoard, "X");
        if (cornerMove) {
            return cornerMove;
        }
    }
    return getRandomMove(availableCells);
}

function blockCornerMove(board, row, col) {
    // Check if the corner move is valid and not already occupied
    if (row >= 0 && row < rows && col >= 0 && col < cols && board[row][col] !== "O") {
        // Check if it's a corner move (2-block or 3-block)
        if ((row === 0 && col === 0) || (row === 0 && col === cols - 1) || (row === rows - 1 && col === 0) || (row === rows - 1 && col === cols - 1)) {
            // Check for 2-block corner configurations
            if ((row === 0 && col === 0 && (board[0][1] === "X" || board[1][0] === "X" || board[1][1] === "X")) ||
                (row === 0 && col === cols - 1 && (board[0][cols - 2] === "X" || board[1][cols - 1] === "X" || board[1][cols - 2] === "X")) ||
                (row === rows - 1 && col === 0 && (board[rows - 2][0] === "X" || board[rows - 1][1] === "X" || board[rows - 2][1] === "X")) ||
                (row === rows - 1 && col === cols - 1 && (board[rows - 1][cols - 2] === "X" || board[rows - 2][cols - 1] === "X" || board[rows - 2][cols - 2] === "X"))) {
                return { row, col }; // Return the corner move to block it
            }
            // Check for 3-block corner configurations
            if ((row === 0 && col === 0 && board[0][1] === "X" && board[1][0] === "X" && board[1][1] === "X") ||
                (row === 0 && col === cols - 1 && board[0][cols - 2] === "X" && board[1][cols - 1] === "X" && board[1][cols - 2] === "X") ||
                (row === rows - 1 && col === 0 && board[rows - 2][0] === "X" && board[rows - 1][1] === "X" && board[rows - 2][1] === "X") ||
                (row === rows - 1 && col === cols - 1 && board[rows - 1][cols - 2] === "X" && board[rows - 2][cols - 1] === "X" && board[rows - 2][cols - 2] === "X")) {
                return { row, col }; // Return the corner move to block it
            }
        }
    }
    return null; // Return null if the corner move cannot be blocked
}




    function checkPotentialWin(board, row, col, player, count, vertical = false) {
        const checkDirection = (r, c, rChange, cChange) => {
            let consecutiveCount = 0;
    
            while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === player) {
                consecutiveCount++;
                r += rChange;
                c += cChange;
            }
    
            return consecutiveCount;
        };
    
        const horizontalCount = checkDirection(row, col, 0, 1) + checkDirection(row, col, 0, -1) - 1;
        const verticalCount = checkDirection(row, col, 1, 0) + checkDirection(row, col, -1, 0) - 1;
        const diagonal1Count = checkDirection(row, col, 1, 1) + checkDirection(row, col, -1, -1) - 1;
        const diagonal2Count = checkDirection(row, col, 1, -1) + checkDirection(row, col, -1, 1) - 1;
    
        return (horizontalCount >= count) || (vertical && verticalCount >= count) ||
            (diagonal1Count >= count) || (diagonal2Count >= count);
    }
    
    
    
    function checkForWin(row, col) {
      // Check horizontally
      if (gameBoard[row].every((cell) => cell === currentPlayer)) {
          return true;
      }

      // Check vertically
      if (gameBoard.every((r) => r[col] === currentPlayer)) {
          return true;
      }

      // Check diagonally from top-left to bottom-right
      if (row === col && gameBoard.every((r, i) => r[i] === currentPlayer)) {
          return true;
      }

      // Check diagonally from top-right to bottom-left
      if (row + col === rows - 1 && gameBoard.every((r, i) => r[cols - 1 - i] === currentPlayer)) {
          return true;
      }

      // Check other diagonals
      let diagonal1 = [];
      let diagonal2 = [];

      for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
              if (i + j === row + col) {
                  diagonal1.push(gameBoard[i][j]);
              }
              if (i - j === row - col) {
                  diagonal2.push(gameBoard[i][j]);
              }
          }
      }

      if (diagonal1.length > 1 && diagonal1.every((cell) => cell === currentPlayer)) {
          return true;
      }

      if (diagonal2.length > 1 && diagonal2.every((cell) => cell === currentPlayer)) {
          return true;
      }

      return false;
    }

    function checkForTie() {
      return gameBoard.every((row) => row.every((cell) => cell !== ""));
    }
	
	// Check for player's potential corner moves
function checkCornerMoves(tempBoard, player) {
    // Define the corner cells
    const cornerCells = [
        { row: 0, col: 0 },
        { row: 0, col: cols - 1 },
        { row: rows - 1, col: 0 },
        { row: rows - 1, col: cols - 1 }
    ];

    // Loop through the corner cells
    for (const cell of cornerCells) {
        // Check if the cell is empty
        if (tempBoard[cell.row][cell.col] === "") {
            // Check if the cell is part of a potential corner move for the player
            // A two-block corner move is when the player has occupied two adjacent cells in the same corner
            let adjacentCells = 0; // Count the number of occupied adjacent cells in the corner
            let block = false; // Flag to indicate if the cell should be blocked

            // Check the adjacent cells in the same row, column, and diagonals
            const adjacentOffsets = [
                { row: cell.row, col: cell.col === 0 ? 1 : cell.col - 1 }, // Right
                { row: cell.row === 0 ? 1 : cell.row - 1, col: cell.col }, // Bottom
                { row: cell.row === 0 ? 1 : cell.row - 1, col: cell.col === 0 ? 1 : cell.col - 1 } // Diagonal
            ];

            for (const offset of adjacentOffsets) {
                if (tempBoard[offset.row][offset.col] === player) {
                    adjacentCells++;
                }
            }

            // If the player has occupied two adjacent cells, the cell should be blocked
            if (adjacentCells >= 2) {
                block = true;
            }

            // Return the cell if it should be blocked
            if (block) {
                return cell;
            }
        }
    }

    // Return null if no corner move is found
    return null;
}





    function updateWinTally(player) {
        if (player === "X") {
            playerXTally++;
        } else {
            playerOTally++;  // increment for player 2 (AI)
        }
    
        // Updates the tally display with the correct player names
        playerXWinsDisplay.textContent = `${player1Name} Wins: ${playerXTally}`;
        playerOWinsDisplay.textContent = `${player2Name} Wins: ${playerOTally}`;


        // Check if the game is over
        if (playerXTally === 5 || playerOTally === 5) {
            alert(`${player === "X" ? player1Name : player2Name} is the overall winner! Game Over!`);
            resetGame();
    
            // Redirect to index.html
            window.location.href = "index.html";
        }
    }
    


    function resetGame() {
      // Clear the board
      gameBoard = Array.from({ length: rows }, () => Array(cols).fill(""));
      document.querySelectorAll(".cell").forEach((cell) => {
          cell.textContent = "";
          cell.style.backgroundColor = ""; // Reset background color
      });

      // Reset player turn
      currentPlayer = "X";
    }

    resetButton.addEventListener("click", function () {
        playerXTally = 0;
        playerOTally = 0;
        playerXWinsDisplay.textContent = `${player1Name} Wins: 0`;
        playerOWinsDisplay.textContent = `${player2Name} Wins: 0`;
        document.getElementById('currentTurn').textContent = '';

        resetGame();
        // Clear input field for Player 1
        document.getElementById('player1Name').value = '';
    });
	const musicButton = document.getElementById('musicButton');
        const backgroundMusic = document.getElementById('backgroundMusic');

        musicButton.addEventListener('click', function() {
            if (backgroundMusic.paused) {
                backgroundMusic.play();
                musicButton.src = 'music.png';
            } else {
                backgroundMusic.pause();
                musicButton.src = 'mute.png';
            }
        });

});
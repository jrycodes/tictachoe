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

});
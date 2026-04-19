document.addEventListener("DOMContentLoaded", function () {


    const board = document.querySelector(".sudoku-board");
    const sliderLabel = document.getElementById('slider-value');
    const slider = document.getElementById('empty-cells-slider'); // Correctly get the slider element
    let numEmptyCells = parseInt(slider.value); // Get and convert the slider's value to an integer


    // Event listener for the slider to update the label
    slider.addEventListener("input", () => {
        numEmptyCells = parseInt(slider.value, 10);
        sliderLabel.textContent = numEmptyCells;
    });

    
    // Add event listeners for the buttons
    document.getElementById("reset").addEventListener("click", generateSudokuBoard);
    document.getElementById("check").addEventListener("click", () => {
        if (checkSolution()) {
            alert("Congratulations! The solution is correct!");
        } else {
            alert("There are mistakes in your solution. Keep trying!");
        }
    });

    // Initialize the game
    generateSudokuBoard();


    // Step : Generate the Sudoku board
    function generateSudokuBoard() {
        let boardArray = Array(81).fill(0);
        createBoard()
        fillBoard(boardArray);
        removeNumbers(boardArray);
        populateBoard(boardArray);
    }

    // Function to create the Sudoku board
    function createBoard() {
        // Clear the board before adding cells (in case the function is called more than once)
        board.innerHTML = "";

        // Create 81 cells for the 9x9 grid
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement("div");
            cell.contentEditable = true; // Make cells editable
            cell.classList.add("cell"); // Add a class for styling
            board.appendChild(cell); // Append each cell to the board
        }
    }

    // Function to fill the board using backtracking
    function fillBoard(board) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = 0; i < 81; i++) {
            if (board[i] === 0) {
                shuffleArray(numbers);
                for (let num of numbers) {
                    if (isValidMove(board, i, num)) {
                        board[i] = num;
                        if (fillBoard(board)) return true;
                        board[i] = 0; // Backtrack
                    }
                }
                return false;
            }
        }
        return true;
    }

    // Function to remove numbers to create the puzzle
    function removeNumbers(board) {
        while (numEmptyCells > 0) {
            let index = Math.floor(Math.random() * 81);
            while (board[index] === 0) {
                index = Math.floor(Math.random() * 81);
            }
            let backup = board[index];
            board[index] = 0;
            if (!hasUniqueSolution([...board])) {
                board[index] = backup;
            } else {
                numEmptyCells--;
            }
        }
    }

    // Function to check if a move is valid
    function isValidMove(board, index, num) {
        const row = Math.floor(index / 9);
        const col = index % 9;

        for (let i = 0; i < 9; i++) {
            if (board[row * 9 + i] === num || board[col + i * 9] === num) return false;
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[(boxRow + i) * 9 + (boxCol + j)] === num) return false;
            }
        }

        return true;
    }

    // Function to check if the board has a unique solution
    function hasUniqueSolution(board) {
        let solutionCount = 0;

        function solve(board) {
            for (let i = 0; i < 81; i++) {
                if (board[i] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValidMove(board, i, num)) {
                            board[i] = num;
                            solve(board);
                            if (solutionCount > 1) return;
                            board[i] = 0;
                        }
                    }
                    return;
                }
            }
            solutionCount++;
        }

        solve([...board]);
        return solutionCount === 1;
    }

    // Helper function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Function to reset the board
    function resetBoard() {
        const initialBoard = Array(81).fill(0);
        fillBoard(initialBoard);
        removeNumbers(initialBoard);
        populateBoard(initialBoard);
    }

    // Function to populate the board with numbers
    function populateBoard(boardArray) {
        const cells = board.querySelectorAll("div");
        cells.forEach((cell, index) => {
            cell.textContent = boardArray[index] !== 0 ? boardArray[index] : "";
            cell.contentEditable = boardArray[index] === 0;
            cell.classList.toggle("fixed", boardArray[index] !== 0);
        });
    }
    
    // Function to check if the user's solution is correct
    function checkSolution() {
        const cells = board.querySelectorAll("div");

        function getNumber(index) {
            const num = parseInt(cells[index].textContent);
            return isNaN(num) ? 0 : num;
        }

        function hasUniqueNumbers(numbers) {
            const seen = new Set();
            for (let num of numbers) {
                if (num === 0) continue;
                if (seen.has(num)) return false;
                seen.add(num);
            }
            return true;
        }

        for (let row = 0; row < 9; row++) {
            const numbers = [];
            for (let col = 0; col < 9; col++) {
                numbers.push(getNumber(row * 9 + col));
            }
            if (!hasUniqueNumbers(numbers)) return false;
        }

        for (let col = 0; col < 9; col++) {
            const numbers = [];
            for (let row = 0; row < 9; row++) {
                numbers.push(getNumber(row * 9 + col));
            }
            if (!hasUniqueNumbers(numbers)) return false;
        }

        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const numbers = [];
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const index = (boxRow * 3 + row) * 9 + (boxCol * 3 + col);
                        numbers.push(getNumber(index));
                    }
                }
                if (!hasUniqueNumbers(numbers)) return false;
            }
        }

        return true;
    }

});

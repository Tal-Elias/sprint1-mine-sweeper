'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gBoard
var gEmptyCells
var gTimerIntervalId
var gStartTime

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    showCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 1
}

function onInit() {
    gGame.isOn = true
    gGame.showCount = 0
    gGame.markedCount = 0
    gEmptyCells = []

    gBoard = buildBoard()
    renderBoard(gBoard)
    markedCounter()
    placeMinesOnBoard(gLevel.MINES)

    document.querySelector('.reset').innerText = '😊'
    document.querySelector('.lives span').innerText = gGame.lives
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                position: { i, j }
            }
            board[i][j] = cell
            gEmptyCells.push(cell)
        }
    }
    // board[1][1].isMine = true
    // board[3][3].isMine = true
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className}"
                            onclick="onCellClicked(this, ${i}, ${j})">
                            <button oncontextmenu="onCellMarked(this, ${i}, ${j}),
                            onContextMenu(event)"></button></td>`
        }
        strHTML += `</tr>`
        const elContainer = document.querySelector('.board')
        elContainer.innerHTML = strHTML
    }
}

function setMinesNegsCount(board, rowIdx, colIdx) {
    var mineCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) mineCount++
        }
    }
    return mineCount
}

function countNegsAroundCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, i, j)
        }
    }
}

function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (!currCell.isShown && !currCell.isMarked && !currCell.isMine) {
                const elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.innerText = (currCell.minesAroundCount === 0) ? '' : currCell.minesAroundCount
                currCell.isShown = true
                gGame.showCount++
            }
        }
    }
}

function onCellClicked(elCell, i, j) {
    var cell = gBoard[i][j]
    if (!gGame.isOn || cell.isMarked || cell.isShown) return
    if (gGame.showCount < 2) startTimer()
    gGame.showCount++
    countNegsAroundCount()
    if (cell.minesAroundCount === 0) expandShown(gBoard, i, j)
    cell.isShown = true
    if (!cell.isMine) {
        elCell.innerText = cell.minesAroundCount
    } else {
        if (gGame.lives === 1) clearInterval(gTimerIntervalId)
        cell.isMine = true
        elCell.innerText = MINE
        gGame.lives--
        document.querySelector('.lives span').innerText = gGame.lives
        if (!gGame.lives) revealMines()
    }
    checkGameOver()
}

function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return
    var cell = gBoard[i][j]
    if (!cell.isMarked && !cell.isShown) {
        cell.isMarked = true
        elCell.innerText = FLAG
        gGame.markedCount++
        markedCounter()
    } else {
        if (!cell.isShown) {
            cell.isMarked = false
            elCell.innerText = ''
            gGame.markedCount--
            markedCounter()
        }
    }
    checkGameOver()
}

function placeMinesOnBoard(gNumOfMines) {
    for (var i = 0; i < gNumOfMines; i++) {
        var randomEmptyCell = getRandomInt(0, gEmptyCells.length - 1)
        gEmptyCells[randomEmptyCell].isMine = true
    }
}

function checkGameOver() {
    if ((gGame.showCount === gLevel.SIZE ** 2 - gLevel.MINES) &&
        gGame.markedCount === gLevel.MINES) {
        resetTimer()
        gGame.isOn = false
        document.querySelector('.reset').innerText = '😎'
        console.log('gameover');
    }
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                document.querySelector(`.cell-${i}-${j}`).innerText = MINE
            }
        }
    }
    document.querySelector('.reset').innerText = '😣'
    gGame.isOn = false
}

function chooseLevel(num) {
    resetTimer()
    if (num === 4) {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        gGame.lives = 1
        onInit()
    }
    if (num === 8) {
        gLevel.SIZE = 8
        gLevel.MINES = 14
        gGame.lives = 3
        onInit()
    }
    if (num === 12) {
        gLevel.SIZE = 12
        gLevel.MINES = 32
        gGame.lives = 3
        onInit()
    }
}

function markedCounter() {
    document.querySelector('.count span').innerText = (gLevel.MINES - gGame.markedCount)
}

function startTimer() {
    gStartTime = Date.now()

    gTimerIntervalId = setInterval(function () {
        var delta = Date.now() - gStartTime
        var elTimer = document.querySelector('.timer span')
        elTimer.innerText = `${(delta / 1000).toFixed()}`
    }, 100)
}

function resetTimer() {
    clearInterval(gTimerIntervalId)
    const elTimer = document.querySelector('.timer span')
    elTimer.innerText = '00'
}









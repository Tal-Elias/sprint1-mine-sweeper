'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gBoard
var gEmptyCells
var gTimerIntervalId
var gStartTime
var gRevealedMines
var gIsFirstClick
var gHints
var gIsHint

var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 2
}

var gGame = {
    isOn: false,
    showCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

function onInit() {
    gGame.isOn = true
    gGame.showCount = 0
    gGame.markedCount = 0
    gRevealedMines = 0
    gIsFirstClick = true
    gIsHint = false
    gHints = 3

    resetTimer()
    gBoard = buildBoard()
    renderBoard(gBoard)
    markedCounter()

    document.querySelector('.reset').innerText = '😊'
    document.querySelector('.lives span').innerText = gLevel.LIVES
    document.querySelector('.hint span').innerText = 3
}

function buildBoard() {
    const board = []
    gEmptyCells = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                pos: { i, j }
            }
            board[i][j] = cell
            gEmptyCells.push(cell)
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < board[0].length; j++) {
            var className = `cell cell-${i}-${j}`
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

function minesAroundCell() {
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
                currCell.isShown = true
                gGame.showCount++
                const elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.innerText = (!currCell.minesAroundCount) ? '' : currCell.minesAroundCount
                if (currCell.minesAroundCount === 0) {
                    expandShown(board, i, j)
                }
            }
        }
    }
}

function expandShownHint(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (!currCell.isShown && !currCell.isMarked && !currCell.isMine) {
                const elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.innerText = (!currCell.minesAroundCount) ? '' : currCell.minesAroundCount
                setTimeout(() => {
                    var className = `cell cell-${i}-${j}`
                    elCell.innerHTML = `<td class="${className}"
                    onclick="onCellClicked(this, ${i}, ${j})">
                    <button oncontextmenu="onCellMarked(this, ${i}, ${j}),
                    onContextMenu(event)"></button></td>`
                }, 1000);
            }
        }
    }
}

function onCellClicked(elCell, i, j) {
    var cell = gBoard[i][j]
    if (!gGame.isOn || cell.isMarked || cell.isShown) return
    if (gIsFirstClick) {
        placeMinesOnBoard(gLevel.MINES, i, j)
        minesAroundCell()
        startTimer()
        gIsFirstClick = false
    }
    cell.isShown = true
    gGame.showCount++
    if (!cell.isMine && !gIsHint && cell.minesAroundCount === 0) {
        expandShown(gBoard, i, j)
        elCell.innerText = ''
    } else {
        elCell.innerText = cell.minesAroundCount
    }
    if (!cell.isMine && gIsHint) {
        document.querySelector('.hint span').innerText--
        expandShownHint(gBoard, i, j);
        gIsHint = false
    }
    if (cell.isMine) {
        elCell.innerText = MINE
        gRevealedMines++
        gLevel.LIVES--
        document.querySelector('.lives span').innerText = gLevel.LIVES
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

function placeMinesOnBoard(gNumOfMines, clickedRow, clickedCol) {
    var clickedCell
    for (var idx = 0; idx < gEmptyCells.length; idx++) {
        if (gEmptyCells[idx].pos.i === clickedRow &&
            gEmptyCells[idx].pos.j === clickedCol) {
            clickedCell = idx
            break
        }
    }
    var safeCell = gEmptyCells.splice(clickedCell, 1)[0]
    for (var i = 0; i < gNumOfMines; i++) {
        var randomEmptyIdx = getRandomInt(0, gEmptyCells.length - 1)
        var randomEmptyCell = gEmptyCells.splice(randomEmptyIdx, 1)[0]
        randomEmptyCell.isMine = true
    }
    gEmptyCells.splice(clickedCell, 0, safeCell)
}

function checkGameOver() {
    var totalCells = gLevel.SIZE ** 2
    var totalMines = gLevel.MINES
    if ((gGame.showCount === totalCells - totalMines + gRevealedMines) &&
        gGame.markedCount === totalMines - gRevealedMines) {
        clearInterval(gTimerIntervalId)
        document.querySelector('.reset').innerText = '😎'
        gGame.isOn = false
        console.log('gameover');
        return
    }
    if (!gLevel.LIVES) {
        clearInterval(gTimerIntervalId)
        revealMines()
        gGame.isOn = false
    }
}

function revealMines() {
    gRevealedMines = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine) {
                document.querySelector(`.cell-${i}-${j}`).innerText = MINE
            }
        }
    }
    document.querySelector('.reset').innerText = '😣'
}

function chooseLevel(num) {
    if (num == 4) {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        gLevel.LIVES = 2
    }
    if (num === 8) {
        gLevel.SIZE = 8
        gLevel.MINES = 14
        gLevel.LIVES = 3
    }
    if (num === 12) {
        gLevel.SIZE = 12
        gLevel.MINES = 32
        gLevel.LIVES = 3
    }
    onInit()
}

function markedCounter() {
    document.querySelector('.count span').innerText = (gLevel.MINES - gGame.markedCount)
}

function startTimer() {
    gStartTime = Date.now()

    gTimerIntervalId = setInterval(function () {
        var delta = Date.now() - gStartTime
        gGame.secsPassed = `${(delta / 1000).toFixed()}`
        var elTimer = document.querySelector('.timer span')
        elTimer.innerText = `${(delta / 1000).toFixed()}`
    }, 100)
}

function resetTimer() {
    clearInterval(gTimerIntervalId)
    const elTimer = document.querySelector('.timer span')
    elTimer.innerText = '00'
}

function isHintCount() {
    if (!gHints) return
    if (!gIsHint) {
        gIsHint = true
        console.log(gIsHint);
        gHints--
    }
}
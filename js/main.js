'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gBoard
var size = 4

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    showCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard)
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 2,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    board[1][1].isMine = true
    board[3][3].isMine = true
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const className = `cell cell-${i}-${j}`
            if (cell.isMine) {
                strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})">${MINE}</td>`
            } else {
                strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})"></td>`
            }
        }
        strHTML += `</tr>`
    }
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
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
    console.log(mineCount);
    return mineCount
}

function onCellClicked(elCell, i, j) {
    console.log(elCell);
    // gBoard[i][j].isShown = true
    setMinesNegsCount(gBoard, i, j)
}

function onCellMarked(elCell) {
    console.log('marked');
}

function checkGameOver() {
    console.log('gameover');
}
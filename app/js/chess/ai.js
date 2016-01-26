'use strict'


angular.module('Tribetron').factory('ChessAI', [function() {
	
	const xMin = 0, yMin = 0, xMax = 7, yMax = 7
	const valuesForPiece = [50, 95, 95, 125, 240, 5000]

	var	getValueForPiece = function(piece, x, y) {
		function getValueOfCoordX(coord) {
			if (coord === 3 || coord === 4) return 6
			if (coord === 2 || coord === 5) return 3
			if (coord === 1 || coord === 6) return 1
			return 0
		}
		function getValueOfCoordY(coord) {
			if ( piece === -1 ) return coord
			if ( piece === 1) return 7 - coord
			return getValueOfCoordX(coord)
		}
		return valuesForPiece[Math.abs(piece) - 1] + getValueOfCoordX(x) + getValueOfCoordY(y)
	}

	var evaluateBoard = function(board) {
		var score = 0
		for (var y = yMin; y <= yMax; y++) {
			for (var x = xMin; x <= xMax; x++) {
				if (board[x][y] > 0)
					score += getValueForPiece(board[x][y], x, y)
				if(board[x][y] < 0)
					score -= getValueForPiece(board[x][y], x, y)
			}				
		}
		return score
	}
	
	var calculateScoreOfTheMove = function(move) {
		var score = evaluateBoard(move.boardAfterMove)
		move.calculatedScore = score
		return score
	}
		
	function AI(black, depth, evalueNBestMoves) {
		
		this.topMoves = function(chess) {
			var moves = chess.allowedMoves			
			if (this.black) {
				return _.chain(moves).sortBy(function(move) {
					return calculateScoreOfTheMove(move)
				}).first(this.evalueNBestMoves).compact().value()
			} else {				
				return _.chain(moves).sortBy(function(move) {
					return calculateScoreOfTheMove(move)
				}).last(this.evalueNBestMoves).compact().value()
			}
		}
		
		this.pickBestMove = function(chess) {
			
			var	topMoves = this.topMoves(chess)
			if (this.depth > 1) {
				var aiOpponent = new AI(!this.black, this.depth - 1, this.evalueNBestMoves)
				aiOpponent.notOriginal = true
				_.chain(topMoves).each(function(move) {
					chess.makeMove(move)
					move.calculatedScore = aiOpponent.pickBestMove(chess).calculatedScore
					chess.undoMove()
				})
			}
			return this.black ? _.chain(topMoves).min(function(move) { return move.calculatedScore }).value()
				: _.chain(topMoves).max(function(move) { return move.calculatedScore }).value()
		}
		
		this.playTurn = function(chess) {
			chess.aiTurn = true
			var move = this.pickBestMove(chess)
			if (!move) return
			chess.aiTurn = false
			chess.makeMove(move)
						
		}
		this.black = black
		this.depth = depth
		this.evalueNBestMoves = evalueNBestMoves
	}
	
	return {
		createAI : function(black) {
			return new AI(black, 3, 20)
		}
	}
}])
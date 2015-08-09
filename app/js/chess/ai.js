'use strict'

angular.module('Tribetron').factory('ChessAI', [function() {
		
	var evaluateBoard = function(chess, board) {
		return chess.evaluateBoard(board)
	}
	
	var calculateScoreOfTheMove = function(chess, move) {
		var score = evaluateBoard(chess, move.boardAfterMove)
		move.calculatedScore = score
		return score
	}
		
	function AI(black, depth, evalueNBestMoves) {
		
		this.topMoves = function(chess) {
			let moves = chess.allowedMoves			
			if (this.black) {
				return _.chain(moves).sortBy(function(move) {
					return calculateScoreOfTheMove(chess, move)
				}).first(this.evalueNBestMoves).compact().value()
			} else {				
				return _.chain(moves).sortBy(function(move) {
					return calculateScoreOfTheMove(chess, move)
				}).last(this.evalueNBestMoves).compact().value()
			}
		}
		
		this.pickBestMove = function(chess) {
			
			let	topMoves = this.topMoves(chess)
			if (this.depth > 1) {
				let aiOpponent = new AI(!this.black, this.depth - 1, this.evalueNBestMoves)
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
			let move = this.pickBestMove(chess)
			chess.makeMove(move)
			chess.aiTurn = false			
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
'use strict'

angular.module('Tribetron').factory('ChessAI', ['ChessBoard', 'ChessPiece', function(ChessBoard, ChessPiece) {
		
	var evaluateBoard = function(board) {
		function evaluate(pieces) {
			return _.chain(pieces).map(function(piece) { return piece.getValue() }).reduce(function(memo, num){ return memo + num }, 0).value()
		}
		return evaluate(board.getWhitePieces()) - evaluate(board.getBlackPieces())
	}
	
	var calculateScoreOfTheMove = function(board, move) {
		let boardCopy = angular.copy(board)
		boardCopy.setSelected(boardCopy.getSlot(move.piece.position))
		boardCopy.movePiece(boardCopy.selected, boardCopy.getSlot(move.position))
		var score = evaluateBoard(boardCopy)
		move.calculatedScore = score
		move.boardCopy = boardCopy
		return score
	}
		
	function AI(black, depth, evalueNBestMoves) {
		
		this.topMoves = function(board) {
			let pieces = this.black ? board.getBlackPieces() : board.getWhitePieces()
			if (this.black) {
				return _.chain(pieces).map(function(piece) { return piece.allowedMoves(board) }).flatten().compact().sortBy(function(move) {
					return calculateScoreOfTheMove(board, move)
				}).first(this.evalueNBestMoves).compact().value()
			} else {
				return _.chain(pieces).map(function(piece) { return piece.allowedMoves(board) }).flatten().compact().sortBy(function(move) {
					return calculateScoreOfTheMove(board, move)
				}).last(this.evalueNBestMoves).compact().value()
			}
		}
		
		this.pickBestMove = function(board) {
			
			let	topMoves = this.topMoves(board)
			if (this.depth > 1) {
				let aiOpponent = new AI(!this.black, this.depth - 1, this.evalueNBestMoves)
				aiOpponent.notOriginal = true
				_.chain(topMoves).each(function(move) {
					move.calculatedScore = aiOpponent.pickBestMove(move.boardCopy).calculatedScore
				})
			}
			return this.black ? _.chain(topMoves).min(function(move) { return move.calculatedScore }).value()
				: _.chain(topMoves).max(function(move) { return move.calculatedScore }).value()
		}
		
		this.playTurn = function(board) {
			board.aiTurn = true
			let move = this.pickBestMove(board)
			board.setSelected(board.getSlot(move.piece.position))
			board.movePiece(board.selected, board.getSlot(move.position))
			board.aiTurn = false			
		}
		this.black = black
		this.depth = depth
		this.evalueNBestMoves = evalueNBestMoves
	}
	
	return {
		createAI : function(black) {
			return new AI(black, 3, 10)
		}
	}
}])
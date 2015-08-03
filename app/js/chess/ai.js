'use strict'

angular.module('Tribetron').factory('ChessAI', ['ChessBoard', 'ChessPiece', function(ChessBoard, ChessPiece) {
		
	var evaluateBoard = function(board) {
		function evaluate(pieces) {
			return _.chain(pieces).map(function(piece) { return piece.getValue() }).reduce(function(memo, num){ return memo + num }, 0).value()
		}
		return evaluate(board.getWhitePieces()) - evaluate(board.getBlackPieces())
	}
		
	function AI(black) {
				
		this.pickBestMove = function(board) {
			
			function calculateScoreOfTheMove(move) {
				var boardCopy = angular.copy(board)
				boardCopy.setSelected(boardCopy.getSlot(move.piece.position))
				boardCopy.movePiece(boardCopy.selected, boardCopy.getSlot(move.position))
				return evaluateBoard(boardCopy)
			}
			
			var pieces = this.black ? board.getBlackPieces() : board.getWhitePieces()
			if (this.black) {
				return _.chain(pieces).map(function(piece) { return piece.allowedMoves(board) }).flatten().compact().min(function(move) {
					return calculateScoreOfTheMove(move)
				}).value()
			} else {
				return _.chain(pieces).map(function(piece) { return piece.allowedMoves(board) }).flatten().compact().max(function(move) {
					return calculateScoreOfTheMove(move)
				}).value()
			}
		}
		
		this.playTurn = function(board) {
			board.aiTurn = true
			var move = this.pickBestMove(board)
			board.setSelected(board.getSlot(move.piece.position))
			board.movePiece(board.selected, board.getSlot(move.position))
			board.aiTurn = false			
		}
		this.black = black
	}
	
	return {
		createAI : function(black) {
			return new AI(black)
		}
	}
}])
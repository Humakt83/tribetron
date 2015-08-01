'use strict'

angular.module('Tribetron').factory('ChessPiece', ['ChessBoard', function(ChessBoard) {
	
	var xMin = 0, yMin = 0, xMax = 7, yMax = 7
	
	var filterOutOfBoardMoves = function(moves) {
		return _.compact(_.filter(moves, function(move) {
			return move.x >= xMin && move.x <= xMax && move.y >= yMin && move.y <= yMax
		}))
	}
	
	var filterMovesThatCollideWithOwnPiece = function(moves, whitePiece, board) {
		return _.compact(_.filter(moves, function(move) {
			var piece = board.getSlot(move).piece
			return !piece || piece.whitePiece !== whitePiece
		}))
	}
	
	var filterIllegalMoves = function(moves, whitePiece, board) {
		return _.compact(filterMovesThatCollideWithOwnPiece(filterOutOfBoardMoves(moves), whitePiece, board))
	}
	
	function Pawn() {
		this.getMoves = function(position, board, whitePiece) {
			var moves = []
			var sign = whitePiece ? -1 : 1
			moves.push(new Position(position.x, position.y + sign))
			if ((position.y === 6 && whitePiece) || (position.y === 1 && !whitePiece)) moves.push(new Position(position.x, position.y + (sign * 2)))
			var diagonalAttacks = [new Position(position.x - 1, position.y + sign), new Position(position.x + 1, position.y + sign)]
			_.each(filterOutOfBoardMoves(diagonalAttacks), function (attack) {
				var piece = board.getSlot(attack).piece
				//TODO: Quirky pawn attack diagonal logic
				if (piece && piece.whitePiece !== whitePiece) {
					moves.push(attack)
				}
			})
			return moves
		}
		this.value = 50
	}
	
	function Bishop() {
		this.value = 95
	}
	
	function Knight() {
		this.value = 95
	}
	
	function Rook() {
		this.value = 125
	}
	
	function Queen() {
		this.value = 240
	}
	
	function King() {
		this.value = 1000
		this.getMove
	}
	
	function Piece(pieceType, x, y, whitePiece) {
		this.allowedMoves = function(board) {
			var moves = pieceType.getMoves(this.position, board, whitePiece)
			return filterIllegalMoves(moves, this.whitePiece, board)
		}
		this.move = function(newPosition) {
			this.moved = true;
			this.position = newPosition
		}
		this.pieceType = pieceType
		this.position = new Position(x, y)
		this.moved = false
		this.whitePiece = whitePiece
	}
	
	function Position(x, y) {
		this.x = x
		this.y = y
	}
	
}])
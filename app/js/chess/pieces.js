'use strict'

angular.module('Tribetron').factory('ChessPiece', ['ChessBoard', function(ChessBoard) {
	
	var xMin = 0, yMin = 0, xMax = 7, yMax = 7
	
	var isMoveInBoard(move) {
		return move.x >= xMin && move.x <= xMax && move.y >= yMin && move.y <= yMax
	}
	
	var filterOutOfBoardMoves = function(moves) {
		return _.compact(_.filter(moves, function(move) {
			return isMoveInBoard(move)
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
	
	var getMovesUntilBlocked = function(board, position, xModifier, yModifier) {
		var moves = [], blocked = false
		var move = position.newPosition(xModifier, yModifier)
		do {
			moves.push(move.newPosition(0, 0))
			blocked = blocked || board.getSlot(move).piece
			move = move.newPosition(xModifier, yModifier)
		} while(isMoveInBoard(move) && !blocked)
		return moves
	}
	
	var diagonalMoves = function(board, position) {
		return getMovesUntilBlocked(board, position, 1, 1)
			.concat(getMovesUntilBlocked(board, position, -1, -1))
			.concat(getMovesUntilBlocked(board, position, 1, -1))
			.concat(getMovesUntilBlocked(board,position, -1, 1))
	}
	
	var horizontalAndVerticalMoves = function(board, position) {
		return getMovesUntilBlocked(board, position, 0, 1)
			.concat(getMovesUntilBlocked(board, position, 0, -1))
			.concat(getMovesUntilBlocked(board, position, 1, 0))
			.concat(getMovesUntilBlocked(board,position, -1, 0))
	}
	
	function Pawn() {
		this.getMoves = function(position, board, whitePiece) {
			var moves = []
			var sign = whitePiece ? -1 : 1
			moves.push(position.newPosition(0, sign))
			if ((position.y === 6 && whitePiece) || (position.y === 1 && !whitePiece)) moves.push(position.newPosition(0, (sign * 2)))
			var diagonalAttacks = [position.newPosition(-1, sign), position.newPosition(1, sign)]
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
		this.getMoves = function(position, board) {
			return diagonalMoves(board, position)
		}
		this.value = 95
	}
	
	function Knight() {
		this.getMoves = function(position) {
			return [position.newPosition(1,2), position.newPosition(1,-2), position.newPosition(-1,2), position.newPosition(-1,-2),
				position.newPosition(2,1), position.newPosition(2,-1), position.newPosition(-2,1), position.newPosition(-2,-1)
		}
		this.value = 95
	}
	
	function Rook() {
		this.getMoves = function(position, board) {
			return horizontalAndVerticalMoves(board, position)
		}
		this.value = 125
	}
	
	function Queen() {
		this.getMoves = function(position, board) {
			return diagonalMoves(board,position)
				.concat(horizontalAndVerticalMoves(board, position))
		}
		this.value = 240
	}
	
	function King() {
		this.getMoves = function(position) {
			return [position.newPosition(0,1), position.newPosition(0,-1), position.newPosition(1,0), position.newPosition(-1,0)]
		}
		this.value = 1000
	}
	
	function Piece(pieceType, x, y, whitePiece) {
		this.allowedMoves = function(board) {
			var moves = pieceType.getMoves(this.position, board, whitePiece)
			return filterIllegalMoves(moves, this.whitePiece, board)
		}
		this.move = function(position) {
			this.moved = true;
			this.position = position
		}
		this.pieceType = pieceType
		this.position = new Position(x, y)
		this.moved = false
		this.whitePiece = whitePiece
	}
	
	function Position(x, y) {
		this.newPosition = function(xModifier, yModifier) {
			return new Position(this.x + xModifier, this.y + yModifier)
		}
		this.x = x
		this.y = y
	}
	
}])
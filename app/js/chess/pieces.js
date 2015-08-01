'use strict'

angular.module('Tribetron').factory('ChessPiece', function() {
	
	var xMin = 0, yMin = 0, xMax = 7, yMax = 7
	
	var isMoveInBoard = function(move) {
		return move.x >= xMin && move.x <= xMax && move.y >= yMin && move.y <= yMax
	}
	
	var filterOutOfBoardMoves = function(moves) {
		return _.compact(_.filter(moves, function(move) {
			return isMoveInBoard(move)
		}))
	}
	
	var filterMovesThatCollideWithOwnPiece = function(moves, whitePiece, board) {
		return _.compact(_.filter(moves, function(move) {
			var slot = board.getSlot(move)
			var piece = slot ? slot.piece : undefined
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
			var slot = board.getSlot(move)
			var piece = slot ? slot.piece : undefined
			blocked = blocked || piece
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
		this.cssName = 'totter'
	}
	
	function Bishop() {
		this.getMoves = function(position, board) {
			return diagonalMoves(board, position)
		}
		this.value = 95
		this.cssName = 'medic'
	}
	
	function Knight() {
		this.getMoves = function(position) {
			return [position.newPosition(1,2), position.newPosition(1,-2), position.newPosition(-1,2), position.newPosition(-1,-2),
				position.newPosition(2,1), position.newPosition(2,-1), position.newPosition(-2,1), position.newPosition(-2,-1)]
		}
		this.value = 95
		this.cssName = 'hunter'
	}
	
	function Rook() {
		this.getMoves = function(position, board) {
			return horizontalAndVerticalMoves(board, position)
		}
		this.value = 125
		this.cssName = 'psycho'
	}
	
	function Queen() {
		this.getMoves = function(position, board) {
			return diagonalMoves(board,position)
				.concat(horizontalAndVerticalMoves(board, position))
		}
		this.value = 240
		this.cssName = 'lazor'
	}
	
	function King() {
		this.getMoves = function(position) {
			return [position.newPosition(0,1), position.newPosition(0,-1), position.newPosition(1,0), position.newPosition(-1,0),
				position.newPosition(1,1), position.newPosition(-1,-1), position.newPosition(1,-1), position.newPosition(-1,1)]
		}
		this.value = 1000
		this.cssName = 'hacker'
	}
	
	function Piece(pieceType, x, y, whitePiece) {
		this.allowedMoves = function(board) {
			var moves = pieceType.getMoves(this.position, board, whitePiece)
			return filterIllegalMoves(moves, this.whitePiece, board)
		}
		this.move = function(x, y) {
			this.moved = true;
			this.position = new Position(x, y)
		}
		this.getClass = function() {
			var addendum = whitePiece ? '' : '_enemy'
			return pieceType.cssName + addendum
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
	
	return {
		createPawn : function(x, y, whitePiece) {
			return new Piece(new Pawn(), x, y, whitePiece)
		},
		createBishop : function(x, y, whitePiece) {
			return new Piece(new Bishop(), x, y, whitePiece)
		},
		createKnight : function(x, y, whitePiece) {
			return new Piece(new Knight(), x, y, whitePiece)
		},
		createRook : function(x, y, whitePiece) {
			return new Piece(new Rook(), x, y, whitePiece)
		},
		createQueen : function(x, y, whitePiece) {
			return new Piece(new Queen(), x, y, whitePiece)
		},
		createKing : function(x, y, whitePiece) {
			return new Piece(new King(), x, y, whitePiece)
		}
	}
	
})
'use strict'

angular.module('Tribetron').factory('ChessPiece', [function() {
	
	var filterOutOfBoardMoves = function(moves, board) {
		return _.compact(_.filter(moves, function(move) {
			return board.isPositionInsideBoard(move.position ? move.position : move)
		}))
	}
	
	var filterMovesThatCollideWithOwnPiece = function(moves, whitePiece, board) {
		return _.compact(_.filter(moves, function(move) {
			var slot = board.getSlot(move.position)
			var piece = slot ? slot.piece : undefined
			return !piece || piece.whitePiece !== whitePiece
		}))
	}
	
	var filterIllegalMoves = function(moves, whitePiece, board) {
		return _.compact(filterMovesThatCollideWithOwnPiece(filterOutOfBoardMoves(moves, board), whitePiece, board))
	}
	
	var getMovesUntilBlocked = function(board, position, xModifier, yModifier) {
		var moves = [], blocked = false
		var move = position.newPosition(xModifier, yModifier)
		do {
			moves.push(new Move(move.newPosition(0, 0)))
			var slot = board.getSlot(move)
			var piece = slot ? slot.piece : undefined
			blocked = blocked || piece
			move = move.newPosition(xModifier, yModifier)
		} while(board.isPositionInsideBoard(move) && !blocked)
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
		this.getMoves = function(position, board, whitePiece, piece) {
			function blocked(move) {
				return board.getSlot(move).piece
			}
			function addLevelupForMove(move) {
				if (move.y === 7 || move.y === 0) {
					return function() {
						board.pawnIsLeveled(piece)
					}
				}
				return function() {}
			}
			function handleMovesForward(moves, sign) {
				var moveForward = position.newPosition(0, sign)
				if (!blocked(moveForward)) { 
					moves.push(new Move(moveForward, addLevelupForMove(moveForward)))
					if ((position.y === 6 && whitePiece) || (position.y === 1 && !whitePiece)) {
						var movesForwardTwice = position.newPosition(0, (sign * 2))
						if (!blocked(movesForwardTwice)) moves.push(new Move(movesForwardTwice, null, true))
					}
				}
			}
			function handleDiagonalAttacks(moves, sign) {
				var diagonalAttacks = [position.newPosition(-1, sign), position.newPosition(1, sign)]
				_.each(filterOutOfBoardMoves(diagonalAttacks, board), function (attack) {
					var piece = board.getSlot(attack).piece
					if (piece && piece.whitePiece !== whitePiece) {
						moves.push(new Move(attack, addLevelupForMove(attack)))
					} else if (board.madeMoves.length > 0 && _.last(board.madeMoves).pawnDoubleForward) {
						var previousMove = _.last(board.madeMoves)
						if (previousMove.position.y === position.y && previousMove.position.x === attack.x) {
							moves.push(new Move(attack, function() {
								board.getSlot(previousMove.position).piece = undefined
							}))
						}
					}
				})
			}
			var moves = []
			var sign = whitePiece ? -1 : 1
			handleMovesForward(moves, sign)
			handleDiagonalAttacks(moves, sign)
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
			return [new Move(position.newPosition(1,2)), new Move(position.newPosition(1,-2)), new Move(position.newPosition(-1,2)), new Move(position.newPosition(-1,-2)),
				new Move(position.newPosition(2,1)), new Move(position.newPosition(2,-1)), new Move(position.newPosition(-2,1)), new Move(position.newPosition(-2,-1))]
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
			return [new Move(position.newPosition(0,1)), new Move(position.newPosition(0,-1)), new Move(position.newPosition(1,0)), new Move(position.newPosition(-1,0)),
				new Move(position.newPosition(1,1)), new Move(position.newPosition(-1,-1)), new Move(position.newPosition(1,-1)), new Move(position.newPosition(-1,1))]
		}
		this.value = 1000
		this.cssName = 'hacker'
	}
	
	function Piece(pieceType, x, y, whitePiece) {
		this.allowedMoves = function(board) {
			var moves = this.pieceType.getMoves(this.position, board, this.whitePiece, this)
			return filterIllegalMoves(moves, this.whitePiece, board)
		}
		this.move = function(x, y) {
			this.moved = true;
			this.position = new Position(x, y)
		}
		this.getClass = function() {
			var addendum = this.whitePiece ? '' : '_enemy'
			return this.pieceType.cssName + addendum
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
	
	function Move(position, effect, pawnDoubleForward) {
		this.position = position
		this.effect = effect ? effect : function(){}
		this.pawnDoubleForward = pawnDoubleForward
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
		},
		getTypesPawnCanTurnInto : function() {
			return [new Queen(), new Rook(), new Knight(), new Bishop()]
		}
		
	}
	
}])
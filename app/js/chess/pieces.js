'use strict'

angular.module('Tribetron').factory('ChessPiece', ['PositionService', function(PositionService) {
	
	var filterOutOfBoardMoves = function(moves, board) {
		return _.compact(_.filter(moves, function(move) {
			return board.isPositionInsideBoard(move.position ? move.position : move)
		}))
	}
	
	var filterMovesThatCollideWithOwnPiece = function(moves, whitePiece, board) {
		return _.compact(_.filter(moves, function(move) {
			var slot = board.getSlot(move.position)
			var piece = slot.piece
			return !piece || piece.whitePiece !== whitePiece
		}))
	}
	
	var filterIllegalMoves = function(moves, whitePiece, board) {
		return _.compact(filterMovesThatCollideWithOwnPiece(filterOutOfBoardMoves(moves, board), whitePiece, board), board)
	}
	
	var getMovesUntilBlocked = function(board, position, xModifier, yModifier, pieceBeingMoved) {
		var moves = [], blocked = false
		var move = position.newPosition(xModifier, yModifier)
		do {
			moves.push(new Move(pieceBeingMoved, move.newPosition(0, 0)))
			var slot = board.getSlot(move)
			var piece = slot ? slot.piece : undefined
			blocked = blocked || piece
			move = move.newPosition(xModifier, yModifier)
		} while(board.isPositionInsideBoard(move) && !blocked)
		return moves
	}
	
	var diagonalMoves = function(board, position, piece) {
		return getMovesUntilBlocked(board, position, 1, 1, piece)
			.concat(getMovesUntilBlocked(board, position, -1, -1, piece))
			.concat(getMovesUntilBlocked(board, position, 1, -1, piece))
			.concat(getMovesUntilBlocked(board,position, -1, 1, piece))
	}
	
	var horizontalAndVerticalMoves = function(board, position, piece) {
		return getMovesUntilBlocked(board, position, 0, 1, piece)
			.concat(getMovesUntilBlocked(board, position, 0, -1, piece))
			.concat(getMovesUntilBlocked(board, position, 1, 0, piece))
			.concat(getMovesUntilBlocked(board,position, -1, 0, piece))
	}
	
	function Pawn() {		
		this.getMoves = function(position, pieceBeingMoved, board, whitePiece) {
			function blocked(move) {
				return board.getSlot(move).piece
			}
			function addLevelupForMove(move) {
				if (move.y === 7 || move.y === 0) {
					return function() {
						board.pawnIsLeveled(pieceBeingMoved)
					}
				}
				return function() {}
			}
			function handleMovesForward(moves, sign) {
				var moveForward = position.newPosition(0, sign)
				if (!blocked(moveForward)) { 
					moves.push(new Move(pieceBeingMoved, moveForward, addLevelupForMove(moveForward)))
					if ((position.y === 6 && whitePiece) || (position.y === 1 && !whitePiece)) {
						var movesForwardTwice = position.newPosition(0, (sign * 2))
						if (!blocked(movesForwardTwice)) moves.push(new Move(pieceBeingMoved, movesForwardTwice, null, true))
					}
				}
			}
			function handleDiagonalAttacks(moves, sign) {
				var diagonalAttacks = [position.newPosition(-1, sign), position.newPosition(1, sign)]
				_.each(filterOutOfBoardMoves(diagonalAttacks, board), function (attack) {
					var piece = board.getSlot(attack).piece
					if (piece && piece.whitePiece !== whitePiece) {
						moves.push(new Move(pieceBeingMoved, attack, addLevelupForMove(attack)))
					} else if (board.madeMoves.length > 0 && _.last(board.madeMoves).pawnDoubleForward) {
						var previousMove = _.last(board.madeMoves)
						if (previousMove.position.y === position.y && previousMove.position.x === attack.x) {
							moves.push(new Move(pieceBeingMoved, attack, function() {
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
		this.getMoves = function(position, piece, board) {
			return diagonalMoves(board, position, piece)
		}
		this.value = 95
		this.cssName = 'medic'
	}
	
	function Knight() {
		this.getMoves = function(position, piece) {
			return [new Move(piece, position.newPosition(1,2)), new Move(piece, position.newPosition(1,-2)), new Move(piece, position.newPosition(-1,2)), new Move(piece, position.newPosition(-1,-2)),
				new Move(piece, position.newPosition(2,1)), new Move(piece, position.newPosition(2,-1)), new Move(piece, position.newPosition(-2,1)), new Move(piece, position.newPosition(-2,-1))]
		}
		this.value = 95
		this.cssName = 'hunter'
	}
	
	function Rook() {
		this.getMoves = function(position, piece, board) {
			return horizontalAndVerticalMoves(board, position, piece)
		}
		this.value = 125
		this.cssName = 'psycho'
	}
	
	function Queen() {
		this.getMoves = function(position, piece, board) {
			return diagonalMoves(board,position, piece)
				.concat(horizontalAndVerticalMoves(board, position, piece))
		}
		this.value = 240
		this.cssName = 'lazor'
	}
	
	function King() {
		this.getMoves = function(position, piece, board, whitePiece) {
			var toweringMoves = []
			if (!piece.moved) {
				var rookLeft = board.getSlot(position.newPosition(-4, 0))
				var rookRight = board.getSlot(position.newPosition(3, 0))
				if (rookLeft.piece && !rookLeft.piece.moved && !board.getSlot(position.newPosition(-1,0)).piece && !board.getSlot(position.newPosition(-2,0)).piece && !board.getSlot(position.newPosition(-3,0)).piece) {
					toweringMoves.push(new Move(piece, position.newPosition(-2,0), function() {
						board.getSlot(rookLeft.piece.position.newPosition(3,0)).movePiece(rookLeft)
					}))
				}
				if (rookRight.piece && !rookRight.piece.moved && !board.getSlot(position.newPosition(1,0)).piece && !board.getSlot(position.newPosition(2,0)).piece) {
					toweringMoves.push(new Move(piece, position.newPosition(2,0), function() {
						board.getSlot(rookRight.piece.position.newPosition(-2,0)).movePiece(rookRight)
					}))
				}
			}
			return toweringMoves.concat([new Move(piece, position.newPosition(0,1)), new Move(piece, position.newPosition(0,-1)), new Move(piece, position.newPosition(1,0)), new Move(piece, position.newPosition(-1,0)),
				new Move(piece, position.newPosition(1,1)), new Move(piece, position.newPosition(-1,-1)), new Move(piece, position.newPosition(1,-1)), new Move(piece, position.newPosition(-1,1))])
		}
		this.value = 10000
		this.cssName = 'hacker'
	}
	
	function Piece(pieceType, whitePiece) {
		this.allowedMoves = function(board) {
			var moves = this.pieceType.getMoves(this.position, this, board, this.whitePiece)
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
		this.getValue = function() {
			function valueOfCoord(coord) {
				if (coord === 3 || coord === 4) return 8
				if (coord === 2 || coord === 5) return 4
				if (coord === 1 || coord === 3) return 2
				return 0
			}
			return valueOfCoord(this.position.x) + valueOfCoord(this.position.y) + this.pieceType.value
		}
		this.pieceType = pieceType
		this.position = undefined
		this.moved = false
		this.whitePiece = whitePiece
	}
	
	function Move(piece, position, effect, pawnDoubleForward) {
		if (!piece) throw "No piece for move!"
		this.piece = piece
		this.position = position
		this.effect = effect ? effect : function(){}
		this.pawnDoubleForward = pawnDoubleForward
	}
	
	return {
		createPawn : function(whitePiece) {
			return new Piece(new Pawn(), whitePiece)
		},
		createBishop : function(whitePiece) {
			return new Piece(new Bishop(), whitePiece)
		},
		createKnight : function(whitePiece) {
			return new Piece(new Knight(), whitePiece)
		},
		createRook : function(whitePiece) {
			return new Piece(new Rook(), whitePiece)
		},
		createQueen : function(whitePiece) {
			return new Piece(new Queen(), whitePiece)
		},
		createKing : function(whitePiece) {
			return new Piece(new King(), whitePiece)
		},
		getTypesPawnCanTurnInto : function() {
			return [new Queen(), new Rook(), new Knight(), new Bishop()]
		}
		
	}
	
}])
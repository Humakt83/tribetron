'use strict'

angular.module('Tribetron').factory('ChessPiece', ['PositionService', function(PositionService) {

	const cssNames = ['totter', 'hunter', 'medic', 'psycho', 'lazor', 'hacker']
	
	const valuesForPiece = [50, 95, 95, 125, 240, 5000]
	
	var filterOutOfBoardMoves = function(moves, chess) {
		return _.compact(_.filter(moves, function(move) {
			return chess.isPositionInsideBoard(move.position ? move.position : move)
		}))
	}
	
	var filterMovesThatCollideWithOwnPiece = function(moves, whitePiece, chess) {
		return _.compact(_.filter(moves, function(move) {
			var slot = chess.getSlot(move.position)
			return !((whitePiece && slot > 0) || (!whitePiece && slot < 0))
		}))
	}
	
	var filterMovesThatCauseMate = function(moves, whitePiece, chess) {
		if (chess.aiTurn) return moves
		var pieceToLookFor = whitePiece ? 6 : -6
		return _.compact(_.filter(moves, function(move) {
			if (chess.doNotCheckForCheck) return true
			chess.doNotCheckForCheck = true
			chess.makeMove(move, true)
			var noKingRemains = _.find(_.flatten(chess.getFutureMoves()), function(futureMove) {
				return !_.chain(futureMove.boardAfterMove).flatten().contains(pieceToLookFor).value()
			})
			chess.undoMove(true)
			chess.doNotCheckForCheck = false
			return noKingRemains === undefined
		}))
	}
	
	var filterIllegalMoves = function(moves, whitePiece, chess) {
		return _.compact(filterMovesThatCauseMate(filterMovesThatCollideWithOwnPiece(filterOutOfBoardMoves(moves, chess), whitePiece, chess), whitePiece, chess))
	}
	
	var getMovesUntilBlocked = function(chess, position, xModifier, yModifier, pieceBeingMoved) {
		var moves = [], blocked = false
		var newPosition = position.newPosition(xModifier, yModifier)
		while (chess.isPositionInsideBoard(newPosition) && !blocked) {
			moves.push(new Move(pieceBeingMoved, position, newPosition, chess))
			blocked = blocked || chess.getSlot(newPosition) != 0
			newPosition = newPosition.newPosition(xModifier, yModifier)
		}
		return moves
	}
	
	var diagonalMoves = function(chess, position, piece) {
		return getMovesUntilBlocked(chess, position, 1, 1, piece)
			.concat(getMovesUntilBlocked(chess, position, -1, -1, piece))
			.concat(getMovesUntilBlocked(chess, position, 1, -1, piece))
			.concat(getMovesUntilBlocked(chess,position, -1, 1, piece))
	}
	
	var horizontalAndVerticalMoves = function(chess, position, piece) {
		return getMovesUntilBlocked(chess, position, 0, 1, piece)
			.concat(getMovesUntilBlocked(chess, position, 0, -1, piece))
			.concat(getMovesUntilBlocked(chess, position, 1, 0, piece))
			.concat(getMovesUntilBlocked(chess, position, -1, 0, piece))
	}
	
	var getPawnMoves = function(position, pieceBeingMoved, chess, whitePiece) {
		function blocked(move) {
			return chess.getSlot(move) != 0
		}
		function addLevelupForMove(move) {
			if (move.y === 7 || move.y === 0) {
				return function() {
					chess.pawnIsLeveled()
				}
			}
			return function() {}
		}
		function handleMovesForward(moves, sign) {
			var moveForward = position.newPosition(0, sign)
			if (!blocked(moveForward)) { 
				moves.push(new Move(pieceBeingMoved, position, moveForward, chess, addLevelupForMove(moveForward)))
				if ((position.y === 6 && whitePiece) || (position.y === 1 && !whitePiece)) {
					var movesForwardTwice = position.newPosition(0, (sign * 2))
					if (!blocked(movesForwardTwice)) {
						var move = new Move(pieceBeingMoved, position, movesForwardTwice, chess)
						move.pawnDoubleForward = true
						moves.push(move)
					}
				}
			}
		}
		function handleDiagonalAttacks(moves, sign) {
			var diagonalAttacks = [position.newPosition(-1, sign), position.newPosition(1, sign)]
			_.each(filterOutOfBoardMoves(diagonalAttacks, chess), function (attack) {
				var piece = chess.getSlot(attack)
				if ((piece < 0 && whitePiece ) || (piece > 0 && !whitePiece )) {
					moves.push(new Move(pieceBeingMoved, position, attack, chess, addLevelupForMove(attack)))
				} else if (chess.madeMoves.length > 0 && _.last(chess.madeMoves).pawnDoubleForward) {
					var previousMove = _.last(chess.madeMoves)
					if (previousMove.position.y === position.y && previousMove.position.x === attack.x) {
						moves.push(new Move(pieceBeingMoved, position, attack, chess, function() {
							chess.board[previousMove.position.y][previousMove.position.x] = 0
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
	
	var getBishopMoves = function(position, piece, chess) {
		return diagonalMoves(chess, position, piece)
	}
	
	var getKnightMoves = function(position, piece, chess) {
		return [new Move(piece, position, position.newPosition(1,2), chess), new Move(piece, position, position.newPosition(1,-2), chess), new Move(piece, position, position.newPosition(-1,2), chess), 
			new Move(piece, position, position.newPosition(-1,-2), chess), new Move(piece, position, position.newPosition(2,1), chess), 
			new Move(piece, position, position.newPosition(2,-1), chess), new Move(piece, position, position.newPosition(-2,1), chess), new Move(piece, position, position.newPosition(-2,-1), chess)]
	}
	
	var getRookMoves = function(position, piece, chess) {
		return _.chain(horizontalAndVerticalMoves(chess, position, piece)).each(function(move) {
			if (piece > 0)
				if (position.x === 0) move.leftWhiteRookMoved = true
				else move.rightWhiteRookMoved = true
			else if (position.x === 0) move.leftBlackRookMoved = true
			else move.rightBlackRookMoved = true
		}).value()
	}
	
	var getQueenMoves = function(position, piece, chess) {
		return diagonalMoves(chess,position, piece)
			.concat(horizontalAndVerticalMoves(chess, position, piece))
	}
	
	var getKingMoves = function(position, piece, chess, whitePiece) {
		var toweringMoves = []
		if (!chess.moveMadeOfType(whitePiece ? 'whiteKingMoved' : 'blackKingMoved')) {
			var rookLeftPosition = position.newPosition(-4,0)			
			var rookRightPosition = position.newPosition(3,0)
			var rookLeft = chess.getSlot(rookLeftPosition)
			var rookRight = chess.getSlot(rookRightPosition)
			var rook = whitePiece? 4: -4
			var leftRookMoved = chess.moveMadeOfType(whitePiece ? 'leftWhiteRookMoved' : 'leftBlackRookMoved')
			var rightRookMoved = chess.moveMadeOfType(whitePiece ? 'rightWhiteRookMoved' : 'rightBlackRookMoved')
			if (rookLeft === rook && !leftRookMoved && chess.getSlot(position.newPosition(-1,0)) === 0 && chess.getSlot(position.newPosition(-2,0)) === 0 && chess.getSlot(position.newPosition(-3,0)) === 0) {
				toweringMoves.push(new Move(piece, position, position.newPosition(-2,0), chess, function() {
					chess.board[rookLeftPosition.y][rookLeftPosition.x] = 0
					var newRookPosition = rookLeftPosition.newPosition(3, 0)
					chess.board[newRookPosition.y][newRookPosition.x] = rookLeft
				}))
			}
			if (rookRight === rook && !rightRookMoved && chess.getSlot(position.newPosition(1,0)) === 0 && chess.getSlot(position.newPosition(2,0)) === 0) {
				toweringMoves.push(new Move(piece, position, position.newPosition(2,0), chess, function() {
					chess.board[rookRightPosition.y][rookRightPosition.x] = 0
					var newRookPosition = rookRightPosition.newPosition(-2, 0)
					chess.board[newRookPosition.y][newRookPosition.x] = rookRight
				}))
			}
		}
		var moves = toweringMoves.concat([new Move(piece, position, position.newPosition(0,1), chess), new Move(piece, position, position.newPosition(0,-1), chess), 
			new Move(piece, position, position.newPosition(1,0), chess), new Move(piece, position, position.newPosition(-1,0), chess),
			new Move(piece, position, position.newPosition(1,1), chess), new Move(piece, position, position.newPosition(-1,-1), chess), 
			new Move(piece, position, position.newPosition(1,-1), chess), new Move(piece, position, position.newPosition(-1,1), chess)])
		_.each(moves, function(move) {
			if (whitePiece)
				move.whiteKingMoved = true
			else
				move.blackKingMoved = true
		})
		return moves
	}
	
	const movesForPiece = [getPawnMoves, getKnightMoves, getBishopMoves, getRookMoves, getQueenMoves, getKingMoves]
	
	function Move(piece, oldPosition, newPosition, chess, effect) {
		this.piece = piece
		this.originalPosition = oldPosition
		this.position = newPosition
		this.boardBeforeMove = chess.board
		this.boardAfterMove = chess.boardAfterMove(oldPosition, newPosition)
		this.effect = effect ? effect : function(){}
	}
	
	return {
		createPawn : function(whitePiece) {
			return whitePiece ? 1 : -1
		},
		createBishop : function(whitePiece) {
			return whitePiece ? 3 : -3
		},
		createKnight : function(whitePiece) {
			return whitePiece ? 2 : -2
		},
		createRook : function(whitePiece) {
			return whitePiece ? 4 : -4
		},
		createQueen : function(whitePiece) {
			return whitePiece ? 5 : -5
		},
		createKing : function(whitePiece) {
			return whitePiece ? 6 : -6
		},
		getTypesPawnCanTurnInto : function(whitePiece) {
			return _.chain([2, 3, 4, 5]).map(function(piece) { return whitePiece? piece : (-1 * piece) }).value()
		},
		getMoves : function(piece, position, chess) {
			var whitePiece = piece > 0
			return filterIllegalMoves(movesForPiece[Math.abs(piece) - 1](position, piece, chess, whitePiece), whitePiece, chess)
		},
		getCssName : function(piece) {
			var blackPiece = piece < 0 ? '_enemy' : ''
			return cssNames[Math.abs(piece) - 1] + blackPiece
		},
		getValueForPiece : function(piece, x, y) {
			function getValueOfCoord(coord) {
				if (coord === 3 || coord === 4) return 6
				if (coord === 2 || coord === 5) return 3
				if (coord === 1 || coord === 6) return 1
				return 0
			}
			return valuesForPiece[Math.abs(piece) - 1] + getValueOfCoord(x) + getValueOfCoord(y)
		}
				
	}
	
}])
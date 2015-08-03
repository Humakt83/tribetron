'use strict'

angular.module('Tribetron').factory('ChessBoard', ['ChessPiece', '$modal', function(ChessPiece, $modal) {
	
	function Slot(x, y, darkBackground, piece) {
		this.getClass = function() {
			return this.piece ? this.piece.getClass() : ""
		}
		this.movePiece = function(from) {
			this.piece = from.piece
			from.piece = undefined
			this.piece.move(this.positionX, this.positionY)
		}
		this.positionX = x
		this.positionY = y
		this.piece = piece
		this.darkBackground = darkBackground
	}
	
	function Board() {
		function initBoard() {
			function determinePiece(x, y) {
				if (y === 1 || y === 6) return ChessPiece.createPawn(x, y, y === 6)
				if ((x === 0 || x === 7) && (y === 7 || y === 0)) return ChessPiece.createRook(x, y, y === 7)
				if ((x === 1 || x === 6) && (y === 7 || y === 0)) return ChessPiece.createKnight(x, y, y === 7)
				if ((x === 2 || x === 5) && (y === 7 || y === 0)) return ChessPiece.createBishop(x, y, y === 7)
				if (x === 3 && (y === 7 || y === 0)) return ChessPiece.createQueen(x, y, y === 7)
				if (x === 4 && (y === 7 || y === 0)) return ChessPiece.createKing(x, y, y === 7)
				return
			}
			var board = []
			for (var y = 0; y < 8; y++) {
				board.push([])
				for (var x = 0; x < 8; x++) {
					board[y].push(new Slot(x, y, (x + y) % 2 == 0, determinePiece(x,y)))
				}
			}
			return board
		}
		
		this.getSlot = function(position) {
			if (!this.isPositionInsideBoard(position)) return
			return this.board[position.y][position.x]
		}
		
		this.pawnIsLeveled = function(piece) {
			if (this.copy) return
			$modal.open({
				templateUrl: './partials/chesspawn.html',
				controller: 'PawnLevelsUp',
				size: 'sm',
				resolve: {
					pawn: function () {
						return piece
					}
				}
			})
		}
		
		this.movePiece = function(from, to) {
			var move = _.find(this.selectedAllowedMoves, function(move) {
				return move.position.x === to.positionX && move.position.y === to.positionY
			})
			this.madeMoves.push(move)
			move.effect()				
			to.movePiece(from)			
			this.turnOfWhite = !this.turnOfWhite
			this.selected = undefined
		}
		
		this.isSelectable = function(slot) {
			if (this.selected) {
				if (_.find(this.selected.piece.allowedMoves(this), function(move) {
					return move.position.x === slot.positionX && move.position.y === slot.positionY
				})) {
					return true
				}
			}
			return slot.piece && slot.piece.whitePiece === this.turnOfWhite 
				&& slot.piece.allowedMoves(this).length > 0
		}
		
		this.isPositionInsideBoard = function(position) {
			var xMin = 0, yMin = 0, xMax = 7, yMax = 7
			return position.x >= xMin && position.x <= xMax && position.y >= yMin && position.y <= yMax
		}
		
		this.getPieceSlots = function(whitePieces) {
			return _.chain(this.board).flatten().flatten().filter(function(slot) {
					return slot.piece && slot.piece.whitePiece === whitePieces
				}).value()
		}
		
		this.getPieces = function(whitePieces) {
			return _.chain(this.getPieceSlots(whitePieces)).map(function(slot) {
				return slot.piece
			}).value()
		}
		
		this.isCheck = function() {
			if (this.turnOfWhite) {
				return this.isKingChecked(this.getWhiteKingSlot(), this.getBlackPieces())
			}
			return this.isKingChecked(this.getBlackKingSlot(), this.getWhitePieces())
		}
		
		this.isKingChecked = function(king, piecesOfOpponent) {
			if (!king) return true
			var thisMap = this
			var check = false
			_.each(piecesOfOpponent, function(piece) {
				_.each(piece.allowedMoves(thisMap), function(move) {
					check = check || (move.position.x === king.positionX && move.position.y === king.positionY)
				})
			})
			return check
		}
		
		this.getWhiteKingSlot = function() {
			return _.find(this.getPieceSlots(true), function(slot) {
				return slot.piece.pieceType.constructor.name == 'King'
			})
		}
		
		this.getBlackKingSlot = function() {
			return _.find(this.getPieceSlots(false), function(slot) {
				return slot.piece.pieceType.constructor.name == 'King'
			})
		}
		
		this.getWhitePieces = function() {
			return this.getPieces(true)
		}
		
		this.getBlackPieces = function() {
			return this.getPieces(false)
		}
		
		this.isStaleMate = function() {
			if (this.isCheck()) return false
			var possibleMoves = 0
			var thisBoard = this
			if (this.turnOfWhite) {
				_.each(this.getWhitePieces(), function(piece) {
					possibleMoves += piece.allowedMoves(thisBoard).length
				})
			} else {
				_.each(this.getBlackPieces(), function(piece) {
					possibleMoves += piece.allowedMoves(thisBoard).length
				})
			}
			return possibleMoves <= 0
		}
		
		this.isCheckMate = function() {
			return !this.getWhiteKingSlot() || !this.getBlackKingSlot()
		}
		
		this.isGameOver = function() {
			return this.isStaleMate() || this.isCheckMate()
		}
		
		this.setSelected = function(slot) {
			this.selected = slot
			this.selectedAllowedMoves = slot.piece.allowedMoves(this)
		}
		
		this.selectedAllowedMoves = []
		this.board = initBoard();
		this.selected = undefined
		this.turnOfWhite = true
		this.madeMoves = []
		this.copy = false
	}
	
	return {
		createBoard : function() {
			return new Board()
		}
	}
}])

angular.module('Tribetron').controller('PawnLevelsUp', ['$scope', '$modalInstance', 'ChessPiece', 'pawn', function ($scope, $modalInstance, ChessPiece, pawn) {
    	
    $scope.allowedPieces = ChessPiece.getTypesPawnCanTurnInto()
	
	$scope.levelup = function(pieceType) {
		pawn.pieceType = pieceType
		$modalInstance.close()
	}
	
}]);
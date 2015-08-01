'use strict'

angular.module('Tribetron').factory('ChessBoard', ['ChessPiece', function(ChessPiece) {
	
	var xMin = 0, yMin = 0, xMax = 7, yMax = 7
	
	var isPositionInBoard = function(position) {
		return position.x >= xMin && position.x <= xMax && position.y >= yMin && position.y <= yMax
	}
	
	function Slot(x, y, darkBackground, piece) {
		this.getClass = function() {
			return this.piece ? this.piece.getClass() : ""
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
			if (!isPositionInBoard(position)) return
			return this.board[position.y][position.x]
		}
		this.movePiece = function(from, to) {
			to.piece = from.piece
			from.piece = undefined
			to.piece.move(to.positionX, to.positionY)
			this.turnOfWhite = !this.turnOfWhite
			this.selected = undefined
		}
		this.isSelectable = function(slot) {
			if (this.selected) {
				if (_.find(this.selected.piece.allowedMoves(this), function(move) {
					return move.x === slot.positionX && move.y === slot.positionY
				})) {
					return true
				}
			}
			return slot.piece && slot.piece.whitePiece === this.turnOfWhite 
				&& slot.piece.allowedMoves(this).length > 0
		}	
		this.board = initBoard();
		this.selected = undefined
		this.turnOfWhite = true
	}
	
	return {
		createBoard : function() {
			return new Board()
		}
	}
}])
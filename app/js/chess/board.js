'use strict'

angular.module('Tribetron').factory('ChessBoard', ['ChessPiece', function(ChessPiece) {
	
	function Slot(x, y, darkBackground, piece) {
		this.getClass = function() {
			return piece ? piece.getClass() : ""
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
			var board = [8]
			for (var y = 0; y < 8; y++) {
				board[y] = [8]
				for (var x = 0; x < 8; x++) {
					board[y][x] = new Slot(x, y, (x + y) % 2 != 0, determinePiece(x,y))
				}
			}
			return board
		}
		this.board = initBoard();
	}
	
	return {
		createBoard : function() {
			return new Board()
		}
	}
}])
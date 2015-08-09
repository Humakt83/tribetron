'use strict'

angular.module('Tribetron').factory('ChessBoard', ['ChessPiece', '$modal', 'PositionService', function(ChessPiece, $modal, PositionService) {
	
	const xMin = 0, yMin = 0, xMax = 7, yMax = 7
	
	function Board() {
		function initBoard() {
			function determinePiece(x, y) {
				if (y === 1 || y === 6) return ChessPiece.createPawn(y === 6)
				if ((x === 0 || x === 7) && (y === 7 || y === 0)) return ChessPiece.createRook(y === 7)
				if ((x === 1 || x === 6) && (y === 7 || y === 0)) return ChessPiece.createKnight(y === 7)
				if ((x === 2 || x === 5) && (y === 7 || y === 0)) return ChessPiece.createBishop(y === 7)
				if (x === 3 && (y === 7 || y === 0)) return ChessPiece.createQueen(y === 7)
				if (x === 4 && (y === 7 || y === 0)) return ChessPiece.createKing(y === 7)
				return 0
			}
			var board = []
			for (var y = yMin; y <= yMax; y++) {
				board.push([])
				for (var x = xMin; x <= xMax; x++) {
					board[y].push(determinePiece(x,y))
				}
			}
			return board
		}
		
		this.evaluateBoard = function(board) {
			var score = 0
			for (var y = yMin; y <= yMax; y++) {
				for (var x = xMin; x <= xMax; x++) {
					if (board[x][y] > 0)
						score += ChessPiece.getValueForPiece(board[x][y], x, y)
					if(board[x][y] < 0)
						score -= ChessPiece.getValueForPiece(board[x][y], x, y)
				}				
			}
			return score
		}		
		
		this.getSlot = function(position) {
			if (!this.isPositionInsideBoard(position)) return
			return this.board[position.y][position.x]
		}
		
		this.pawnIsLeveled = function() {
			let position = _.last(this.madeMoves).position
			//if (this.aiTurn || this.doNotCheckForCheck) {
				let queen = this.turnOfWhite ? 5 : - 5
				this.board[position.y][position.x] = queen
			/*} else {
				var thisChess = this
				$modal.open({
					templateUrl: './partials/chesspawn.html',
					controller: 'PawnLevelsUp',
					size: 'sm'					
				}).result.then(function(result) {
					result = thisChess.turnOfWhite ? result : result * (-1)
					thisChess.board[position.y][position.x] = result
				})
			}*/
			
		}
		
		this.movePiece = function(from, to) {
			var move = _.find(this.allowedMoves, function(move) {
				return move.position.x === to.x && move.position.y === to.y
					&& move.originalPosition.x === from.x && move.originalPosition.y === from.y
			})
			this.makeMove(move)
			this.selected = undefined
		}
		
		this.makeMove = function(move, doNotSetMoves) {
			this.madeMoves.push(move)
			this.board = move.boardAfterMove
			move.effect()
			this.turnOfWhite = !this.turnOfWhite
			if (!doNotSetMoves) this.setAllowedMoves()
		}
		
		this.getFutureMoves = function() {
			var futureMoves = []
			for (let y = 0; y <= yMax; y++) {
				for (let x = 0; x <= xMax; x++) {
					let piece = this.board[y][x]
					if ((piece > 0 && this.turnOfWhite) || (piece < 0 && !this.turnOfWhite)) {
						futureMoves.push(ChessPiece.getMoves(piece, PositionService.createPosition(x, y), this))
					}
				}
			}
			return futureMoves
		}
		
		this.setAllowedMoves = function() {
			//var millis = new Date().getTime()
			this.allowedMoves = []
			for (let y = 0; y <= yMax; y++) {
				for (let x = 0; x <= xMax; x++) {
					let piece = this.board[y][x]
					if ((piece > 0 && this.turnOfWhite) || (piece < 0 && !this.turnOfWhite)) {
						this.allowedMoves.push(ChessPiece.getMoves(piece, PositionService.createPosition(x, y), this))
					}
				}
			}
			this.selected = undefined
			this.allowedMoves = _.compact(_.flatten(this.allowedMoves))
			//console.log(new Date().getTime() - millis)
		}
		
		this.boardAfterMove = function(from, to) {
			if (to.y > yMax || to.x > xMax || to.y < 0 || to.x < 0) return
			let copyBoard = _.clone(this.board)
			for (let x = 0; x <= xMax; x++) { copyBoard[x] = _.clone(this.board[x])}
			copyBoard[to.y][to.x] = copyBoard[from.y][from.x]
			copyBoard[from.y][from.x] = 0			
			return copyBoard
		}
		
		this.moveMadeOfType = function(moveType) {
			return _.find(this.madeMoves, function(move) {
				return _.has(move, moveType)
			})
		}
			
		this.isPositionInsideBoard = function(position) {
			return position.x >= xMin && position.x <= xMax && position.y >= yMin && position.y <= yMax
		}
		
		this.getPieces = function(whitePieces) {
			return _.chain(this.board).flatten().flatten().filter(function(slot) {
					return (slot > 0 && whitePieces) || (slot < 0 && !whitePieces)
				}).sort().reverse().value()
		}
		
		this.isCheck = function() {
			return false
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
		
		this.isMovable = function(x, y) {
			if (this.selected) {
				let sel = this.selected
				return _.find(this.allowedMoves, function(move) {
					return move.originalPosition.x === sel.x && move.originalPosition.y === sel.y
						&& move.position.x === x && move.position.y === y
				})
			}
			return _.find(this.allowedMoves, function(move) {
				return move.originalPosition.x === x && move.originalPosition.y === y
			})
		}
		
		this.canSetSelected = function(x, y) {
			let movable = _.find(this.allowedMoves, function(move) {
				return move.originalPosition.x === x && move.originalPosition.y === y
			})
			return movable && ((this.turnOfWhite && this.board[y][x] > 0) || (!this.turnOfWhite && this.board[y][x] < 0))
		}
		
		this.undoMove = function(doNotSetMoves) {
			this.board = _.last(this.madeMoves).boardBeforeMove
			this.madeMoves.pop()
			this.turnOfWhite = !this.turnOfWhite
			if (!doNotSetMoves) this.setAllowedMoves()
		}
		
		this.getWhitePieces = function() {
			return this.getPieces(true)
		}
		
		this.getBlackPieces = function() {
			return this.getPieces(false)
		}
		
		this.isStaleMate = function() {
			if (this.isCheck()) return false
			return this.allowedMoves.length <= 0
		}
		
		this.isCheckMate = function() {
			return false
		}
		
		this.isGameOver = function() {
			return this.isStaleMate() || this.isCheckMate()
		}
		
		this.setSelected = function(x, y) {
			this.selected = PositionService.createPosition(x, y)
		}
		
		this.board = initBoard();
		this.selected = undefined
		this.turnOfWhite = true
		this.madeMoves = []
		this.aiTurn = false
		this.allowedMoves = []
		this.setAllowedMoves()
	}
	
	return {
		createBoard : function() {
			return new Board()
		}
	}
}])

angular.module('Tribetron').controller('PawnLevelsUp', ['$scope', '$modalInstance', 'ChessPiece', function ($scope, $modalInstance, ChessPiece) {
    
	$scope.piece = ChessPiece
    $scope.allowedPieces = ChessPiece.getTypesPawnCanTurnInto()
	
	$scope.levelup = function(pieceType) {
		$modalInstance.close(pieceType)
	}
	
}]);
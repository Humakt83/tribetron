'use strict'

angular.module('Tribetron').controller('ChessController', ['$scope', '$location', 'Player', 'ChessBoard', 'ChessAI', 'ChessPiece', 'PositionService', '$modalStack', '$interval', 
		function($scope, $location, Player, ChessBoard, ChessAI, ChessPiece, PositionService, $modalStack, $interval) {
	
	$scope.selectPiece = function(x, y) {
		if (!$scope.gameOver) {
			if (!$scope.chessBoard.selected || $scope.chessBoard.canSetSelected(x, y)) {
				$scope.chessBoard.setSelected(x, y)
			} else if ($scope.chessBoard.isMovable(x, y)) {
				$scope.chessBoard.movePiece($scope.chessBoard.selected, PositionService.createPosition(x, y))
				$scope.waitInterval = $interval(function() {
					if (!$modalStack.getTop()) {
						$scope.checkState()
						if (!$scope.gameOver) {
							$scope.aiTurn()
						}
					}
				}, 50)

			}
		}
	}
	
	$scope.piece = ChessPiece
	
	$scope.position = PositionService
	
	$scope.aiOnBlack = true
	
	$scope.aiTurn = function() {
		$interval.cancel($scope.waitInterval)
		$scope.ai.playTurn($scope.chessBoard)
		$scope.checkState()
	}
	
	$scope.checkState = function() {
		$scope.blackPieces = $scope.chessBoard.getBlackPieces()
		$scope.whitePieces = $scope.chessBoard.getWhitePieces()
		$scope.check = $scope.chessBoard.isCheck()
		$scope.gameOver = $scope.chessBoard.isGameOver()
	}
	
	$scope.chessBoard = ChessBoard.createBoard()
	$scope.ai = ChessAI.createAI($scope.aiOnBlack)
	$scope.checkState()
	
	if (!$scope.aiOnBlack) {
		$scope.aiTurn()
	}
	
}])
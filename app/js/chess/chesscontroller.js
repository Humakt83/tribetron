'use strict'

angular.module('Tribetron').controller('ChessController', ['$scope', '$location', 'Player', 'ChessBoard', 'ChessAI', '$modalStack', '$interval', function($scope, $location, Player, ChessBoard, ChessAI, $modalStack, $interval) {
	
	$scope.selectPiece = function(slot) {
		if (!$scope.gameOver && $scope.chessBoard.isSelectable(slot)) {
			if (!$scope.chessBoard.selected || ($scope.chessBoard.selected && slot.piece 
					&& $scope.chessBoard.selected.piece.whitePiece === slot.piece.whitePiece)) {
				$scope.chessBoard.setSelected(slot)
			} else {
				$scope.chessBoard.movePiece($scope.chessBoard.selected, slot)
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
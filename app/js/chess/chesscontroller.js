'use strict'

angular.module('Tribetron').controller('ChessController', ['$scope', '$location', 'Player', 'ChessBoard', function($scope, $location, Player, ChessBoard) {
	
	$scope.selectPiece = function(slot) {
		if (!$scope.gameOver && $scope.chessBoard.isSelectable(slot)) {
			if (!$scope.chessBoard.selected || ($scope.chessBoard.selected && slot.piece 
					&& $scope.chessBoard.selected.piece.whitePiece === slot.piece.whitePiece)) {
				$scope.chessBoard.selected = slot
			} else {
				$scope.chessBoard.movePiece($scope.chessBoard.selected, slot)
				$scope.gameOver = $scope.chessBoard.isGameOver()
			}
		}
	}
	
	$scope.chessBoard = ChessBoard.createBoard()
}])
'use strict'

angular.module('Tribetron').controller('ChessController', ['$scope', '$location', 'Player', 'ChessBoard', function($scope, $location, Player, ChessBoard) {
	
	$scope.board = ChessBoard.createBoard()
}])
'use strict'

angular.module('Tribetron').controller('GameController', ['$scope', 'AreaMap', function($scope, AreaMap) {
	$scope.map = AreaMap.createMap(10,10)
	$scope.title = 'Tribetron'
}])
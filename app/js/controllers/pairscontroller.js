'use strict'

angular.module('Tribetron').controller('PairsController', ['$scope', '$location', 'Robot', 'Player', 'Campaign', function($scope, $location, Robot, Player, Campaign) {

	function Card(typeName) {
		this.getTurnedClass = function() {
			return this.turned ? 'turned-card' : ''
		}
		this.typeName = typeName
		this.turned = false
	}

	function init() {
		Campaign.getScenario(Campaign.getCampaign().currentScenario).success(function(result) {
			$scope.numberOfPairsLeft = result.pairs
			$scope.maxClicks = result.maxClicks
			$scope.clicks = 0
			$scope.reward = result.reward
			$scope.pairs = new Array()
			$scope.cardsSelected = []
			var types = Robot.getTypesAsObjects()
			for (var i = 0; i < $scope.numberOfPairsLeft; i++) {
				if (i >= types.length) {
					throw "Too many pairs"
				}
				$scope.pairs.push(new Card(types[i].typeName), new Card(types[i].typeName))
			}
			$scope.pairs = _.shuffle($scope.pairs)
		})
	}
	
	if (!Player.getPlayer()) {
		$location.path('/')
		return
	}
	
	init()
	
	$scope.clickCard = function(card) {
		$scope.clicks++
		
		card.turned = true
		
		if ($scope.cardsSelected.length == 2) {
			angular.forEach($scope.cardsSelected, function(card) { card.turned = false })
			$scope.cardsSelected = [card]
		} else if ($scope.cardsSelected.length == 1 && $scope.cardsSelected[0].typeName == card.typeName) {
			$scope.cardsSelected = []
			$scope.numberOfPairsLeft--
		} else {
			$scope.cardsSelected.push(card)
		}
		
		if ($scope.numberOfPairsLeft < 1) {
			$scope.victory = true
		}
		
		if ($scope.clicks >= $scope.maxClicks) {
			$scope.pairsOver = true
		}
	}
	
	$scope.skip = function() {
		$location.path('/game')
	}
	
	$scope.win = function() {
		Player.getPlayer().money += $scope.reward
		$location.path('/game')
	}

}])
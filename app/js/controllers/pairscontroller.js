'use strict'

angular.module('Tribetron').controller('PairsController', ['$scope', '$location', 'Robot', 'Player', 'Campaign', function($scope, $location, Robot, Player, Campaign) {

	function Card(typeName) {
		this.typeName = typeName
		this.turned = false
	}

	function init() {
        var scenario = Campaign.getCampaign().loadedScenario
			
        function generateRowsOfCards(cards) {
            var rows = []
            var cardsPerRowRemaining = 4
            var i = 0
            rows[i] = []
            angular.forEach(cards, function(card) {
                rows[i].push(card)
                cardsPerRowRemaining--
                if (cardsPerRowRemaining < 1) {
                    i++
                    rows[i] = []
                    cardsPerRowRemaining = 4
                }
            })
            return rows
        }

        $scope.numberOfPairsLeft = scenario.pairs
        $scope.maxClicks = scenario.maxClicks
        $scope.clicks = 0
        $scope.reward = scenario.reward
        var cards = []
        $scope.cardsSelected = []
        var types = Robot.getTypesAsObjects()

        for (var i = 0; i < $scope.numberOfPairsLeft; i++) {
            if (i >= types.length) {
                throw "Too many pairs"
            }
            cards.push(new Card(types[i].typeName), new Card(types[i].typeName))
        }

        $scope.rows = generateRowsOfCards(_.shuffle(cards))
	}
	
	if (!Player.getPlayer()) {
		$location.path('/')
		return
	}
	
	init()
	
	$scope.clickCard = function(card) {
		function setPairsOverMessage(victory) {
			$scope.pairsOverText = victory ? 'You have passed this memory challenge. Collect your reward and continue campaign' : 'Your memory is flawed. Press "Skip" to continue campaign.'
		}
		
		if (card.turned || $scope.pairsOver) {
			return
		}
		
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
			$scope.pairsOver = true
			setPairsOverMessage(true)
		}
		
		if ($scope.clicks >= $scope.maxClicks) {
			$scope.pairsOver = true
			setPairsOverMessage(false)
		}
	}
	
	$scope.skip = function() {
		$location.path('/game')
	}
	
	$scope.win = function() {
		Player.getPlayer().money += $scope.reward
		$location.path('/game')
	}
	
	$scope.shouldFloat = function(indexValue) {
		return indexValue !== 0 && indexValue % 4 === 0 ? '': 'card-float'
	}
}])
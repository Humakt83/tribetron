'use strict'

const SAVENAME_PLAYER = 'tribetronSave.player'
const SAVENAME_CAMPAIGN = 'tribetronSave.campaign'

angular.module('Tribetron').factory('SaveGame', function() {

	return {
		save: function(player, campaign) {
			localStorage.clear()
			var storedBits = []
			localStorage[SAVENAME_PLAYER] = JSON.stringify(player, function(key, val) {
	   			if (val !== null && typeof val == "object") {
	        		if (storedBits.indexOf(val) >= 0) {
	            		return
	        		}
	        		storedBits.push(val)
	    		}
	    		return val
			})
			localStorage[SAVENAME_CAMPAIGN] = JSON.stringify(campaign)
		}
	}

})

angular.module('Tribetron').factory('LoadGame', ['$location', 'Campaign', 'Player', function($location, Campaign, Player) {

	return {
		load: function() {
			Player.loadPlayer(JSON.parse(localStorage[SAVENAME_PLAYER]))
			Campaign.loadCampaign(JSON.parse(localStorage[SAVENAME_CAMPAIGN]))
			$location.path('/game')
		},
		isThereNoSave: function() {
			return localStorage[SAVENAME_PLAYER] === undefined
		}
	}
}])
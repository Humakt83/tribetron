'use strict'

angular.module('Tribetron').factory('Campaign', ['$http', function($http) {
	
	function Campaign(result) {
		this.advanceCampaign = function() {
			var scenarioIndex = this.scenarios.indexOf(this.currentScenario)
			if (scenarioIndex >= this.scenarios.length)
				throw 'Campaign over'
			else 
				this.currentScenario = this.scenarios[scenarioIndex + 1]
		}
		this.scenarios = result.scenarios
		this.currentScenario = this.scenarios[0]
	}
	
	var campaign;
	
	return {
		getCampaignJson: function() {
			return $http.get('res/campaign.json')
		},
		createCampaign: function(campaignJson) {
			campaign = new Campaign(campaignJson)
			return campaign
		},
		getCampaign: function() {
			return campaign
		},
		getScenario: function(scenario) {
			return $http.get('res/' + scenario + '.json')
		}
	
	}
}])
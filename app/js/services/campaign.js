'use strict'

angular.module('Tribetron').factory('Campaign', ['$http', function($http) {
	
	function Campaign(result) {
		this.advanceCampaign = function() {
			var scenarioIndex = this.scenarios.indexOf(this.currentScenario)
			if (scenarioIndex + 1 >= this.scenarios.length)
				throw 'Campaign over'
			else 
				this.currentScenario = this.scenarios[scenarioIndex + 1]
		}
		this.isCompleted = function() {
			return this.scenarios.indexOf(this.currentScenario) + 1 >= this.scenarios.length
		}
		if (result) {
			this.scenarios = result.scenarios
			this.currentScenario = this.scenarios[0]
		}
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
		},
        setLoadedScenario: function(scenario) {
            campaign.loadedScenario = scenario
        },
		reset: function() {
			campaign = undefined
		},
		loadCampaign: function(campaignToSet) {
			campaign = new Campaign()
			campaign.scenarios = campaignToSet.scenarios
			campaign.currentScenario = campaignToSet.currentScenario
			campaign.loaded = true
		}
	
	}
}])
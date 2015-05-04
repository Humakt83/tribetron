var soundID = 'Tribetron'
	
function loadSound () {
	function handleLoad(event) {
		$('#music').show()
	}
	createjs.Sound.registerSound('Tribetron.mp3', soundID)
	createjs.Sound.on("fileload", handleLoad)
}

function toggleSound() {
	var music = $('#music')
	var playing = music.attr('src').indexOf('Off') == -1
	if (!playing) {
		createjs.Sound.stop(soundID)
	} else {
		createjs.Sound.play(soundID)
	}
	music.attr('src', playing ? 'img/soundOff.png' : 'img/soundOn.png')
}
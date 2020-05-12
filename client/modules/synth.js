(() => {
	let quando = this['quando']
	if (!quando) {
		alert('Fatal error: audio_transf must be included after client.js')
	}
	let self = quando.synth = {}

	self.myFunction = () => {
		document.getElementById("demo").innerHTML = "YOU CLICKED ME!";
	  }
	


	self.call_pingPongDelay = (tag, delay_intensity, delay_L, delay_R) => {
		if (!tag) {
			console.error('No tag specified for call_alienTransform');
		};

		fetch('/synthesize/grabfile', {
			method: 'POST',
			body: JSON.stringify({ 'tag': tag }),
			headers: {
				"Content-Type": "application/json",
				Accept: 'application/json'
			}
		})
			.then(function (response) {
				response.json().then(function (data) {
					console.log('\tResponse data >> >>> ', data);
					let filename = data.filename;
					console.log('\t filename = ', filename);
					console.log('call_pingPongDelay() started .....');

					let audioElement = document.createElement('audio');
					audioElement.src = '/client/media/watson/' + filename;
					// const audioElement = '/client/media/voice.mp3';
					console.log('audioELement >> ', audioElement);
					
					var audioContext = new AudioContext();

					var input = audioContext.createGain();
					var merger = audioContext.createChannelMerger(2);
					var output = audioContext.createGain();

					var leftDelay = audioContext.createDelay();
					var rightDelay = audioContext.createDelay();
					var feedback = audioContext.createGain();

					const track = audioContext.createMediaElementSource(audioElement);


					input.connect(feedback, 0);
					leftDelay.connect(rightDelay);
					rightDelay.connect(feedback);
					feedback.connect(leftDelay);
					merger.connect(output);
					input.connect(output);
					output.connect(audioContext.destination);

					console.log('\t', delay_intensity)
					feedback.gain.value = parseInt(delay_intensity) / 10;

					leftDelay.connect(merger, 0, 0);
					rightDelay.connect(merger, 0, 1);

					leftDelay.delayTime.value = delay_L / 8;
					rightDelay.delayTime.value = delay_R / 8;


					function play (startAfter, pitch, duration) {
					var time = audioContext.currentTime + startAfter;
					track.connect(input);
					audioElement.play();
					}

					play(delay_intensity, delay_L, delay_R);
				})
			})

	}


	self.call_advancedVoiceCreator = (tag, type='sine', voice_frequency=20, intensity=0.01) => {
		if (!tag) {
			console.error('No tag specified for call_advancedVoiceCreator');
		};

		fetch('/synthesize/grabfile', {
			method: 'POST',
			body: JSON.stringify({ 'tag': tag }),
			headers: {
				"Content-Type": "application/json",
				Accept: 'application/json'
			}
		})
			.then(function (response) {
				response.json().then(function (data) {
					console.log('\tResponse data >> >>> ', data);
					let filename = data.filename;
					console.log('\t filename = ', filename);
					console.log('call_advancedVoiceCreator() started .....');

					const audioContext = new AudioContext();
					let gainNode = audioContext.createGain();
					gainNode.gain.value = 0.5;

					let audioElement = document.createElement('audio');
					audioElement.src = '/client/media/watson/' + filename;
					// const audioElement = '/client/media/voice.mp3';
					console.log('audioElement >> ', audioElement);

					const track = audioContext.createMediaElementSource(audioElement);

					const getLiveAudio = (audioContext) => {
						return navigator.mediaDevices.getUserMedia({ audio: true })
							.then(stream => audioContext.createMediaStreamSource(stream));
					};

					// const source_live = await getLiveAudio(audioContext);
					const source_file = track;

					let oscillator = audioContext.createOscillator();
					oscillator.frequency.value = voice_frequency; 
					oscillator.type = type;

					let oscillatorGain = audioContext.createGain();
					oscillatorGain.gain.value = intensity / 100;

					let delay = audioContext.createDelay();
					delay.delayTime.value = 0.12;

					track.connect(gainNode).connect(delay);
					delay.connect(audioContext.destination);

					oscillator.connect(oscillatorGain);
					oscillatorGain.connect(delay.delayTime);

					oscillator.start();
					audioElement.play();
				})
			})

	}

	self.call_megaphoneTransform = (tag, intensity) => {
		if (!tag) {
			console.error('No tag specified for call_alienTransform');
		};

		fetch('/synthesize/grabfile', {
			method: 'POST',
			body: JSON.stringify({ 'tag': tag }),
			headers: {
				"Content-Type": "application/json",
				Accept: 'application/json'
			}
		})
			.then(function (response) {
				response.json().then(function (data) {
					console.log('\tResponse data >> >>> ', data);
					let filename = data.filename;
					console.log('\t filename = ', filename);
					console.log('call_alienTransform() started .....');

					const audioContext = new AudioContext();
					let gainNode = audioContext.createGain();

					let audioElement = document.createElement('audio');
					audioElement.src = '/client/media/watson/' + filename;
					// const audioElement = '/client/media/voice.mp3';
					console.log('audioELement >> ', audioElement);
					const track = audioContext.createMediaElementSource(audioElement);

					const getLiveAudio = (audioContext) => {
						return navigator.mediaDevices.getUserMedia({ audio: true })
							.then(stream => audioContext.createMediaStreamSource(stream));
					};

					const source_live = getLiveAudio(audioContext);
					const source_file = track;

					let waveShaper = audioContext.createWaveShaper();
					waveShaper.curve = makeDistortionCurve(intensity);
					// node package @https://www.npmjs.com/package/make-distortion-curve
					function makeDistortionCurve(intensity) {
						var k = typeof amount === 'number' ? amount : intensity; // amount 0 - 100 for distortion effect
						var n_samples = 44100;
						var curve = new Float32Array(n_samples);
						var deg = Math.PI / 180;
						var x;
						for (let i = 0; i < n_samples; ++i) {
							x = i * 2 / n_samples - 1;
							curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
						}
						return curve;

					}

					let lpf1 = audioContext.createBiquadFilter();
					lpf1.type = "lowpass";
					lpf1.frequency.value = 2000.0;
					let lpf2 = audioContext.createBiquadFilter();
					lpf2.type = "lowpass";
					lpf2.frequency.value = 2000.0;
					let hpf1 = audioContext.createBiquadFilter();
					hpf1.type = "highpass";
					hpf1.frequency.value = 500.0;
					let hpf2 = audioContext.createBiquadFilter();
					hpf2.type = "highpass";
					hpf2.frequency.value = 500.0;
					let compressor = audioContext.createDynamicsCompressor();
					lpf1.connect(lpf2);
					lpf2.connect(hpf1);
					hpf1.connect(hpf2);
					hpf2.connect(waveShaper);
					waveShaper.connect(compressor);
					compressor.connect(audioContext.destination);

					// source_live.connect(lpf1);
					audioElement.play();
					track.connect(lpf1);

				})
			})

	}

	self.call_predatorTransform = (tag, intensity) => {
		if (!tag) {
			console.error('No tag specified for call_predatorTransform');
		};

		fetch('/synthesize/grabfile', {
			method: 'POST',
			body: JSON.stringify({ 'tag': tag }),
			headers: {
				"Content-Type": "application/json",
				Accept: 'application/json'
			}
		})
			.then(function (response) {
				response.json().then(function (data) {
					console.log('\t Response data >> >>> ', data);
					let filename = data.filename;
					console.log('\t filename = ', filename);

					console.log('call_predatorTransform() started .....');
					const audioContext = new AudioContext();
					let gainNode = audioContext.createGain();
					gainNode.gain.value = intensity / 10;

					let audioElement = document.createElement('audio');
					audioElement.src = '/client/media/watson/' + filename;
					// const audioElement = '/client/media/voice.mp3';
					console.log('audioELement >> ', audioElement);
					const track = audioContext.createMediaElementSource(audioElement);

					const source_file = track;

					let dee = new Jungle(audioContext);
					dee.setPitchOffset(-0.1);

					let freq_depth2 = new Jungle(audioContext);
					freq_depth2.setPitchOffset(-0.2);

					let freq_depth3 = new Jungle(audioContext);
					freq_depth3.setPitchOffset(-0.4);

					let freq_depth4 = new Jungle(audioContext);
					freq_depth4.setPitchOffset(-0.8);

					let compressor = audioContext.createDynamicsCompressor();

					source_file.connect(dee.input);
					source_file.connect(freq_depth2.input);
					source_file.connect(freq_depth3.input);
					source_file.connect(freq_depth4.input);

					dee.output.connect(compressor);
					freq_depth2.output.connect(compressor);
					freq_depth3.output.connect(compressor);
					freq_depth4.output.connect(compressor);

					compressor.connect(gainNode).connect(audioContext.destination);
					audioElement.play();
					// console.log('\t >>>> MUTED FOR NOW <<<< ')
					track.connect(audioContext.destination);
					// source_live.connect(audioContext.destination);

				})
			})

	};

})()


const quando = window['quando']
if (!quando) {
    alert('Fatal Error: media must be included after quando_browser')
}
let self = quando.media = {}
// setup audio wave
let audio_context = false
let amp = false
let oscillator = false
let last_frequency = 300 // Hz
let last_volume = 0.5 // volume 0 to 1

function _clear_audio() {
    let audio = document.getElementById('quando_audio')
    audio.src = ''
    // Remove all event listeners...
    audio.parentNode.replaceChild(audio.cloneNode(true), audio)
}

self.play_audio = (audio_in, loop = false) => {
    if (audio_in) {
        audio_in = '/client/media/' + encodeURI(audio_in)
    }
    let audio = document.getElementById('quando_audio')
    audio.loop = loop
    if (audio.src != (window.location.origin + audio_in)) { // src include http://127.0.0.1/
        if (audio.src) {
            audio.pause()
        }
        audio.src = audio_in
        audio.autoplay = true
        audio.addEventListener('ended', _clear_audio)
        audio.load()
    }
}

self.clear_video = () => {
    let video = document.getElementById('quando_video')
    video.src = ''
    video.style.visibility = 'hidden'
    // Remove all event listeners...
    video.parentNode.replaceChild(video.cloneNode(true), video)
}

self.play_video = (vid, loop = false) => {
    if (vid) {
        vid = '/client/media/' + encodeURI(vid)
    }
    let video = document.getElementById('quando_video')
    video.loop = loop
    if (video.src != (window.location.origin + vid)) { // i.e. ignore when already playing
        if (video.src) {
            video.pause()
        }
        video.src = vid
        video.autoplay = true
        video.addEventListener('ended', self.clear_video)
        video.style.visibility = 'visible'
        video.load()
    }
}

self.projection = (front = true) => {
    let scale = 1
    if (!front) {
        scale = -1
    }
    document.getElementById('html').style.transform = 'scale(' + scale + ',1)'
}

function _play_shape(equal, shape) {
    if (equal) {
        if (!audio_context) {
            audio_context = new AudioContext()
        }
        if (!amp) {
            amp = audio_context.createGain()
            amp.connect(audio_context.destination)
            amp.gain.value = last_volume
        }
        if (!oscillator) {
            oscillator = audio_context.createOscillator()
            oscillator.connect(amp)
            oscillator.start()
            oscillator.frequency.value = last_frequency
        }
        if (oscillator.type != shape) {
            oscillator.type = shape
        }
    }
}

self.play_wave = (shape = 'stop') => {
    if (shape == 'stop') {
        oscillator.stop()
        oscillator = false
    } else {
        _play_shape(shape == 'sine', 'sine')
        _play_shape(shape == 'triangle', 'triangle')
        _play_shape(shape == 'square', 'square')
        _play_shape(shape == 'sawtooth', 'sawtooth')
    }
}

self.wave_frequency = (min_hz, max_hz, val) => {
    let _hz = ((max_hz - min_hz)*val) + min_hz
    if (oscillator) {
        oscillator.frequency.value = _hz
    }
    last_frequency = _hz // for initialisation
}

self.wave_volume = (min_percent, max_percent, val) => {
    let _volume = (((max_percent - min_percent)* val) + min_percent)/100
    if (amp) {
        amp.gain.value = _volume
    }
    last_volume = _volume
}
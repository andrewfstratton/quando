const quando = window['quando']
if (!quando) {
    alert('Fatal Error: media must be included after quando_browser')
}
let self = quando.media = {}
// setup audio wave
let audio_context = new AudioContext()
let oscillator = false
let last_frequency = 300 // Hz

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
        if (!oscillator) {
            oscillator = audio_context.createOscillator()
            oscillator.connect(audio_context.destination)
        }
        oscillator.type = shape
        oscillator.frequency.value = last_frequency
        oscillator.start()
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

self.vary_wave_frequency = (min_hz, max_hz, val) => {
    let mid_hz = ((max_hz - min_hz)*val) + min_hz
    if (oscillator) {
        oscillator.frequency.value = mid_hz
    }
    last_frequency = mid_hz // for initialisation
}

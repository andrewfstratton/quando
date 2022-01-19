const quando = window['quando']
if (!quando) {
    alert('Fatal Error: media must be included after quando_browser')
}
let self = quando.media = {}
// setup audio wave
let audio_context = new AudioContext()
let last_frequency = 300 // Hz
let last_volume = 0.5 // volume 0 to 1

function _channel() {
    let amp = audio_context.createGain()
    amp.connect(audio_context.destination)
    amp.gain.value = 0.5 // middle value at start
    return {
        "amp" : amp,
    }
}
let channels = [_channel(), _channel(), _channel(), _channel()]

function _clear_audio(chan) {
    if (chan.audio_src) {
        chan.audio_src = false
    }
    if (chan.audio) {
        chan.audio.pause()
        chan.audio = false
    }
    if (chan.source) {
        chan.source.disconnect(chan.amp)
        chan.source = false
    }
    if (chan.oscillator) {
        chan.oscillator.disconnect(chan.amp)
        chan.oscillator = false
    }
}

self.play_audio = (audio_in, loop = false, channel = 0, volume=100) => {
    const chan = channels[channel]
    chan.amp.gain.value = volume/100
    if (audio_in) {
        let audio_src = '/media/' + encodeURI(audio_in)
        // Don't interrupt when already playing
        if (audio_src != chan.audio_src) {
            _clear_audio(chan)
            let audio = new Audio(audio_src)
            let source = audio_context.createMediaElementSource(audio)
            chan.audio = audio
            chan.source = source
            chan.audio_src = audio_src
            source.connect(chan.amp)
            audio.loop = loop
            audio.addEventListener('ended', () => {
                _clear_audio(chan)
            })
            audio.play()
        }
    } else { // stop playing and clear if present
        _clear_audio(chan)
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
        vid = '/media/' + encodeURI(vid)
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

self.play_wave = (shape, channel = 0, volume=100) => {
    let chan = channels[channel]
    chan.amp.gain.value = volume/100
    _clear_audio(chan)
    let amp = chan.amp
    if (!chan.oscillator) {
        let osc = audio_context.createOscillator()
        osc.connect(amp)
        osc.start()
        osc.frequency.value = last_frequency
        chan.oscillator = osc
    }
    if (chan.oscillator.type != shape) {
        chan.oscillator.type = shape
    }
}

self.wave_frequency = (min_hz, max_hz, channel, val) => {
    let _hz = ((max_hz - min_hz)*val) + min_hz
    let osc = channels[channel].oscillator
    if (osc) {
        osc.frequency.value = _hz
    }
    last_frequency = _hz // for initialisation
}

self.mix_volume = (from, to, val) => {
    if (from >= 0) {
        channels[from].amp.gain.value = 1-val
    }
    if (to >= 0) {
        channels[to].amp.gain.value = val
    }
}
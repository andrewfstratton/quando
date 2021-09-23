const quando = window['quando']
if (!quando) {
    alert('Fatal Error: media must be included after quando_browser')
}
let self = quando.media = {}

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
    if (audio.src != encodeURI(window.location.origin + audio_in)) { // src include http://127.0.0.1/
        if (audio.src) {
            audio.pause()
        }
        audio.src = audio_in
        audio.autoplay = true
        audio.addEventListener('ended', _clear_audio)
        audio.load()
    }
}

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
    if (video.src != encodeURI(window.location.origin + vid)) { // i.e. ignore when already playing
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

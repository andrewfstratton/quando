let exec = () => {
quando.ar.whenMarker('B', 'flat', (markerID = 'B')=>{
quando.ar.showGLTF(markerID, 'Avocado.gltf', 2500, false)
})
quando.ar.whenMarker('C', 'flat', (markerID = 'C')=>{
quando.ar.showGLTF(markerID, 'tests/jupiter.gltf', 0.1, true)
})
quando.call_tts('humble as a mumble in the jungle ya diiiiig')
}
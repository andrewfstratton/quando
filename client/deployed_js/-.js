let exec = () => {
quando.ar.whenMarker('B', 'flat', (markerID = 'B')=>{
quando.change_inv('add', 'Key')
quando.ar.showGLTF(markerID, 'tests/jupiter.gltf', 0.1, true)
})
}
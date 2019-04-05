let exec = () => {
quando.ar.whenMarker('D', 'wall', (markerID = 'D')=>{
quando.ar.showImage(markerID, 'tree.jpg', 100, 'flat')
})
quando.change_inv('add', 'bfg')
quando.show_inv()
}
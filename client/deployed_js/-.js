let exec = () => {
quando.ar.whenMarker('hiro', 'flat', (markerID = 'hiro')=>{
quando.ar.showImage(markerID, 'visrec.png', 105, 'flat')
})
quando.call_vis_rec('person', ()=>{
quando.text('Hi!', true)
})
quando.call_vis_rec('mug', ()=>{
quando.text('chill with the coffee you bitch', true)
})
}
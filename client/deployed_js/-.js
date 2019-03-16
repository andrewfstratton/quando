let exec = () => {
quando.display(0,()=>{
quando.title('1')
quando.AR.showGLTF('tests/jupiter.gltf', 'A', 0.1, true)
quando.AR.onScan('A', ()=>{
quando.text('f', true)
})
quando.AR.onLoss('A', ()=>{
quando.text('l', true)
})
})
}
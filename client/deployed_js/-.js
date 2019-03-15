let exec = () => {
quando.display(1,()=>{
quando.title('test')
quando.AR.showGLTF('tests/jupiter.gltf', 'A', 0.1, true)
quando.AR.onScan('A', ()=>{
quando.change_inv('add', 'b')
quando.init_inv_watch('b', ()=>{
alert('nice')
})
})
})
}
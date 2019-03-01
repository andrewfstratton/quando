let exec = () => {
quando.display(0,()=>{
quando.title('TEST')
quando.text('How old am I?', false)
quando.addQuestion('69', ()=>{
quando.augReality.showGLTF('', 100, false)
})
})
quando.display(1,()=>{
quando.title('YERRR')
quando.image.set(true,'green_light.png')
})
}
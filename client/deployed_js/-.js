let exec = () => {
quando.promptInput()
quando.addQuestion('balraj', ()=>{
quando.image.set(false,'green_light.png')
})
quando.addToneHandler('anger',  ()=>{
quando.image.set(false,'red_light.png')
})
}
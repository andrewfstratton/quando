let exec = () => {
quando.display(0,()=>{
quando.title('Main display')
quando.addLabel(3, 'Train Active Visual Stimuli')
quando.addLabel(1, 'Train Passive Visual Stimuli')
quando.addLabel(2, 'Predict state')
})
quando.display(3,()=>{
quando.title('Train Active Visual Stimuli')
quando.eeg.fetchDataForLabel(4, 10, 'visualstimuli')
quando.image.set(true,'illusion.gif')
quando.time.after(10, 'seconds', ()=>{
quando.text('Finished,,, leave this page as soon as you can', false)
quando.addLabel(0, 'Main display')
})
})
quando.display(1,()=>{
quando.title('Train Passive Visual Stimuli')
quando.eeg.fetchDataForLabel(5, 10, 'visualstimuli')
quando.image.set(true,'blue.jpg')
quando.time.after(10, 'seconds', ()=>{
quando.text('Training complete', false)
quando.addLabel(0, 'Main display')
})
})
quando.display(2,()=>{
quando.title('Predict state')
quando.eeg.onLabel(4, 'visualstimuli', 0, () => {quando.text('Spooky...', false)
})
quando.eeg.onLabel(5, 'visualstimuli', 0, () => {quando.text('Meh...', false)
})
quando.addLabelStatement('Show active', ()=>{
quando.image.set(true,'illusion.gif')
})
quando.addLabelStatement('Show passive', ()=>{
quando.image.set(true,'blue.jpg')
})
quando.addLabel(0, 'Main display')
})
}
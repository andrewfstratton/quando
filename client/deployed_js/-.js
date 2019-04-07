let exec = () => {
quando.display(0,()=>{
quando.title('Main display')
quando.addLabel(3, 'Train eyes open')
quando.addLabel(1, 'Train eyes closed')
quando.addLabel(2, 'Predict state')
})
quando.display(3,()=>{
quando.title('Train eyes open')
quando.eeg.fetchDataForLabel('eyesopen', 5, 'andrei')
quando.time.after(5, 'seconds', ()=>{
quando.text('Training done... blink to go back', false)
quando.eeg.onEye('Blink', () => {quando.showDisplay(0)
})
quando.addLabel(0, 'Main display')
})
})
quando.display(1,()=>{
quando.title('Train eyes closed')
quando.eeg.fetchDataForLabel('eyesclosed', 5, 'andrei')
quando.time.after(5, 'seconds', ()=>{
quando.text('Training done... smile to go back', false)
quando.eeg.onFaceExpression('Smile', 0.5, () => {quando.showDisplay(0)
})
quando.addLabel(0, 'Main display')
})
})
quando.display(2,()=>{
quando.title('Predict state')
quando.eeg.onLabel('eyesopen', 'andrei', 1, () => {quando.text('Eyes open', false)
quando.image.set(true,'eyesopen.jpg')
})
quando.eeg.onLabel('eyesclosed', 'andrei', 1, () => {quando.text('Eyes closed', false)
quando.image.set(true,'eyesclosed.jpg')
})
quando.addLabel(0, 'Main display')
})
}
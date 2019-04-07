let exec = () => {
quando.eeg.onRotation('Yaw', 0, 40, false, (val) => {quando.cursor_left_right(50, 50, false, val)
})
quando.eeg.onRotation('Pitch', 0, 30, false, (val) => {quando.cursor_up_down(50, 50, false, val)
})
quando.eeg.onNodding('Yes', () => {quando.text('YESSSSSS!!!', false)
quando.time.after(1, 'seconds', ()=>{
quando.text('', false)
})
})
quando.eeg.onNodding('No', () => {quando.text('NO!!!!!!!!!!!', false)
quando.time.after(1, 'seconds', ()=>{
quando.text('', false)
})
})
}
let exec = () => {
 quando.pick.set(9, [() => {
quando.image.set(false,'books.jpg')
},
() => {
quando.image.set(false,'blue.jpg')
},
() => {
quando.image.set(false,'Nao.png')
}])
 quando.pick.set(10, [() => {
quando.video('videos/video1.mp4', true)
},
() => {
quando.video('videos/video2.mp4', true)
},
() => {
quando.video('videos/video3.mp4', true)
}])
 quando.pick.set(11, [() => {
quando.audio('audio/audio1.mp3', true)
},
() => {
quando.audio('audio/audio2.mp3', true)
},
() => {
quando.audio('audio/audio3.mp3', true)
}])
 quando.pick.set(3, [() => {
quando.text('Calibration starting in 5...', false)
},
() => {
quando.text('Calibration starting in 4...', false)
},
() => {
quando.text('Calibration starting in 3...', false)
},
() => {
quando.text('Calibration starting in 2...', false)
},
() => {
quando.text('Calibration starting in 1...', false)
},
() => {
quando.showDisplay(4)
}])
quando.add_message_handler('image selection', (data) => {
let val = data.val
quando.clear(false,false,false,true,true,true,false,false)
quando.pick.one(9, true)
})
quando.add_message_handler('video selection', (data) => {
let val = data.val
quando.clear(false,false,false,true,true,true,false,false)
quando.pick.one(10, true)
})
quando.add_message_handler('audio selection', (data) => {
let val = data.val
quando.clear(false,false,false,true,true,true,false,false)
quando.pick.one(11, true)
})
quando.add_message_handler('enable cursor', (data) => {
let val = data.val
quando.eeg.onRotation('Pitch', 0, 30, false, (val) => {quando.cursor_up_down(50, 50, false, val)
})
quando.eeg.onRotation('Yaw', 0, 40, false, (val) => {quando.cursor_left_right(50, 50, false, val)
})
})
quando.display(0,()=>{
quando.title('Calibration Intro')
quando.time.every(1, 'seconds', ()=>{
quando.pick.one(3, true)
})
})
quando.display(4,()=>{
quando.title('Calibration process')
quando.text('Calibrating, remain still...', false)
quando.image.set(true,'red-dot.png')
quando.eeg.onRotation('Yaw', 0, 180, false, (val) => {quando.showDisplay(1)
})
})
quando.display(1,()=>{
quando.title('Main page')
quando.send_message('enable cursor', val)
quando.addLabel(7, 'Stimulus Selection')
quando.addLabel(5, 'Train first thought')
quando.addLabel(6, 'Train second thought')
quando.addLabel(25, 'Predict thought')
})
quando.display(7,()=>{
quando.title('Stimulus Selection')
quando.send_message('enable cursor', val)
quando.addLabel(23, 'Select image')
quando.addLabel(22, 'Select video')
quando.addLabel(21, 'Select audio')
quando.addLabel(1, 'Main page')
})
quando.display(23,()=>{
quando.title('Select image')
quando.text('Nod yes for a selection and no to skip image', false)
quando.send_message('image selection', val)
quando.eeg.onNodding('Yes', () => {quando.showDisplay(1)
})
quando.eeg.onNodding('No', () => {quando.send_message('image selection', val)
})
})
quando.display(22,()=>{
quando.title('Select video')
quando.text('Nod yes for a selection and no to skip video', false)
quando.send_message('video selection', val)
quando.eeg.onNodding('Yes', () => {quando.showDisplay(1)
})
quando.eeg.onNodding('No', () => {quando.send_message('video selection', val)
})
})
quando.display(21,()=>{
quando.title('Select audio')
quando.text('Nod yes for a selection and no to skip audio', false)
quando.send_message('audio selection', val)
quando.eeg.onNodding('Yes', () => {quando.showDisplay(1)
})
quando.eeg.onNodding('No', () => {quando.send_message('audio selection', val)
})
})
quando.display(5,()=>{
quando.title('Train first thought')
quando.replay_video_audio()
quando.eeg.fetchDataForLabel('thought1', 10, 'multiple')
quando.time.after(10, 'seconds', ()=>{
quando.clear(true,false,false,true,true,true,false,false)
quando.send_message('enable cursor', val)
quando.text('Training complete', false)
quando.addLabel(1, 'Main page')
})
})
quando.display(6,()=>{
quando.title('Train second thought')
quando.replay_video_audio()
quando.eeg.fetchDataForLabel('thought2', 10, 'multiple')
quando.time.after(10, 'seconds', ()=>{
quando.clear(true,false,false,true,true,true,false,false)
quando.send_message('enable cursor', val)
quando.text('Training complete', false)
quando.addLabel(1, 'Main page')
})
})
quando.display(25,()=>{
quando.title('Predict thought')
quando.send_message('enable cursor', val)
quando.eeg.onLabel('thought1', 'multiple', true, () => {quando.text('First trained stimulation', false)
})
quando.eeg.onLabel('thought2', 'multiple', true, () => {quando.text('Second trained stimulation', false)
})
quando.addLabel(1, 'Main page')
})
}
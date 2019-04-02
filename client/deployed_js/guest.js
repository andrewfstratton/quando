quando.display(0,()=>{
quando.title('Display 1')

quando.image('red_light.png')

quando.addLabelStatement('Next', ()=>{

quando.showDisplay(3)
})
})
quando.display(3,()=>{
quando.title('Display 2')

quando.image('amber_light.png')

quando.addLabelStatement('Next', ()=>{

quando.showDisplay(1)
})
})
quando.display(1,()=>{
quando.title('Display 3')

quando.image('green_light.png')
})
quando.eeg.onRotation('Yaw', 0, 20, false, (val) => {
quando.cursor_left_right(50, 50, false, val)
})
quando.eeg.onRotation('Pitch', 0, 30, false, (val) => {
quando.cursor_up_down(50, 50, false, val)
})

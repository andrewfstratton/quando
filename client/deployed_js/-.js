let exec = () => {
quando.display(0,()=>{
quando.title('the cyberzone')
quando.text('Welcome recruit, to the Cyberz0ne..! YOu have been identified as a -bug__ in the system and we need your skills to defeat the regime. To join our movement, you must pass a series of tests. ', false)
quando.call_tts('Welcome recruit, to the Cyberzone! You have been identified as a bbbbbugggggggg in the system and we need your skills to defeat the regime. To join our movement, you must pass a sssss-series of tests. ')
quando.image.set(true,'cyberzone_bg.jpg')
quando.addLabel(2, 'Beg1n TEST..')
})
quando.display(2,()=>{
quando.title('Beg1n TEST..')
quando.title('', false)
quando.text('To  begin, we need to be sure of your identity..', false)
quando.text('Show us a picture of yourself. We will know if it is not a person.', true)
quando.ar.whenMarker('hiro', 'flat', (markerID = 'hiro')=>{
quando.ar.showImage(markerID, 'visrec.png', 100, 'flat')
quando.addLabel(7, 'NEXT')
})
quando.call_vis_rec('person', ()=>{
quando.text('Understood, we see you. Please scan the marker labelled HIRO to verify we have you.', false)
})
})
quando.display(7,()=>{
quando.title('NEXT')
quando.title('', false)
quando.text('testing is thirsty work, do you have a mug of some liquid I can have?', false)
quando.call_vis_rec('mug', ()=>{
quando.text('*slurp* AAAAaaaHhhH thanks', false)
quando.addLabel(8, '**G_L**i,TCH... --_')
quando.addLabel(3, 'NEXT: cognition test')
})
})
quando.display(8,()=>{
quando.title('**G_L**i,TCH... --_')
quando.text('What are you doing? There&apos;s nothing here. Leave, NOW.', false)
quando.change_inv('add', 'glitch_key')
quando.addLabel(3, 'NEXT: cognition test')
})
quando.display(3,()=>{
quando.title('NEXT: cognition test')
quando.title('', false)
quando.text('Next we have to test your cognitive thinking skills. ', false)
quando.text(' Look at marker A and tell us what planet you see.', true)
quando.ar.whenMarker('A', 'flat', (markerID = 'A')=>{
quando.ar.showGLTF(markerID, 'tests/jupiter.gltf', 0.1, true)
})
quando.promptInput()
quando.addQuestion('Jupiter', ()=>{
quando.addLabel(5, 'NEXT: Social Engineering')
quando.text('Good, you can think.', false)
})
})
quando.display(5,()=>{
quando.title('NEXT: Social Engineering')
quando.title('', false)
quando.text('It&apos;s time to test your social engineering skills. This is Brandon. Brandon is an op. We need something from him, but he&apos;s been feeling low. Say something joyful and nice about him to get him on our side. ', false)
quando.image.set(true,'brandon.PNG')
quando.promptInput()
quando.addToneHandler('anger',  ()=>{
quando.text('&quot;cmon man why you gotta be like that :(&quot;', false)
quando.image.set(true,'brandon-sad.png')
})
quando.addToneHandler('joy',  ()=>{
quando.text('&quot;aw thanks bud! that makes me feel so much better! Here, take this donut.&quot;', false)
quando.image.set(true,'brandon.PNG')
quando.change_inv('add', 'donut')
quando.addLabel(10, 'NEXT: Puzzle Zone')
})
})
quando.display(10,()=>{
quando.title('NEXT: Puzzle Zone')
quando.title('', false)
quando.init_inv_watch('donut', ()=>{
quando.text('Aw cool dude you got the donut, gimme that', false)
quando.time.after(1, 'seconds', ()=>{
quando.change_inv('remove', 'donut')
quando.audio('aud_chomp.wav', true)
})
quando.time.after(10, 'seconds', ()=>{
quando.audio('', false)
quando.text('DAMn, good donut', false)
quando.addLabel(11, 'NEXT: Real Puzzle Zone')
})
})
})
quando.display(11,()=>{
quando.title('NEXT: Real Puzzle Zone')
window.location.href='key-puzzle.js'
})
}
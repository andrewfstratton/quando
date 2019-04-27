let exec = () => {
quando.game.init_puzz('a23', ()=>{
}, ()=>{
quando.game.clear_puzzList()
quando.text('no', false)
})
quando.addLabelStatement('1', ()=>{
quando.game.change_puzzList('a')
})
quando.addLabelStatement('2', ()=>{
quando.game.change_puzzList('2')
})
quando.addLabelStatement('3', ()=>{
quando.game.change_puzzList('3')
})
quando.call_vis_rec('hand', ()=>{
quando.text('YES', false)
})
}
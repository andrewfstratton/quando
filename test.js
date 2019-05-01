quando.display(0, () => {
  quando.title('Main page')
  quando.text('Press the label to show an image of books', false)
  
  quando.addLabelStatement('Show books', () => {
    quando.image.set(true,'books.jpg')
  })
})
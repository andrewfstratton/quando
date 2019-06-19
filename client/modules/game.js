(function () {
  var quando = this['quando']
  if (!quando) {
    alert('Fatal Error: Game must be included after quando_browser')
  }
  var self = quando.game = {}

  //ok, so these following variables  track the inventory and puzzList
  //lists as they change, by performing success checks on both initalization of
  //blocks and changes to the lists. If the success checks are valid, then
  //the code in the block's boxes are called.

  //inventory management variables
  self.inventory = []
  self.watching_inv = false
  self.goal_item = ''

  //puzzle tracking variables
  self.puzzList = []
  self.watching_puzz = false
  self.puzz_goal = ''
  
  //empty functions for inventory and puzzle tracking
  self.on_inv_match = function() {}
  self.on_puzz_success = function() {}
  self.on_puzz_failure = function() {}

  //add/remove elements to inventory
  self.change_inv = function(changeType, item) {
    //if we need to add and the player does NOT already have the item
    if (changeType == 'add' && !self.inventory.includes(item)) {
      //add the item
      self.inventory.push(item)
      //wait a little bit before alerting, just feels better
      window.setTimeout(alert(item + ' added to inventory!'), 700)
    //if we need to remove and the player DOES have the item
    } else if (changeType == 'remove' && self.inventory.includes(item)) {
      //remove item from wherever it is in array
      self.inventory.splice(self.inventory.indexOf(item), 1)
      //wait a little bit before alerting, just feels better
      window.setTimeout(alert(item + ' has been used!'), 500)
    } 

    //if we're watching the inventory, and the inventory contains what it should
    //we fire the function specified in the handler
    if (self.watching_inv == true) {
      if (self.inventory.includes(self.goal_item)) {
        self.on_inv_match()
        self.stop_inv_watch()
      }
    }
  }

  self.get_inv = function() {
    return self.inventory
  }

  //shows inv as label, could do with replacing label to custom element for UX reasons
  self.show_inv = function() {
    self.addLabelStatement('Inventory: '+self.get_inv().toString(), ()=>{})
  }

  //initialise inventory watching
  self.init_inv_watch = function(item, fn) {
    self.watching_inv = true
    self.goal_item = item
    self.on_inv_match = fn

    //if we're watching the inventory, and the inventory contains what it should
    //we fire the function specified in the block
    if (self.inventory.includes(item)) {
      self.on_inv_match()
      self.stop_inv_watch()
    }
  }

  //reset params, stop watching inv
  self.stop_inv_watch = function() {
    self.watching_inv = false
    self.goal_item = ''
    self.on_inv_match = function() {}
  }

  //initialize puzzle tracker
  self.init_puzz = function(goal, success, failure) {
    self.puzz_goal = goal
    self.watching_puzz = true
    self.on_puzz_success = success
    self.on_puzz_failure = failure

    //if we're watching the puzzle, and it is the goal, do what's in the block box
    if (self.watching_puzz == true) {
      if (self.get_puzzList().length >= self.puzz_goal.length) {
        if (self.get_puzzList() == self.puzz_goal) {
          self.on_puzz_success()
          self.watching_puzz = false
        } else {
        self.on_puzz_failure()
        self.puzzList = []
        }
      }
    }
  }

  //add/remove elements to puzzle list
  self.change_puzzList = function(data) {
    self.puzzList.push(data)

    if (self.get_puzzList() == self.puzz_goal) {
      self.on_puzz_success()
      self.watching_puzz = false
    } else if (self.get_puzzList().length >= self.puzz_goal.length) {
      self.on_puzz_failure()
      self.puzzList = []
    }

  }

  self.get_puzzList = function() {
    //remove the commas between elements added when using toString()
    return (self.puzzList.toString().replace(/,/g, ''))
  }

  self.clear_puzzList = function() {
    self.puzzList = []
    alert('puzzle failed...')
  }

  //stop puzzle tracking, resetting params
  self.stop_puzz_tracking = function() {
    self.puzz_goal = ''
    self.watching_puzz = false
    self.on_puzz_success = function() {}
  }

  self.addQuestion = function (answer, fn) {
    //add on click event listener to the input prompt
    let input = document.getElementById('inp')
    let button = document.getElementById('inpButton')
    answer = answer.toUpperCase()

    button.addEventListener("click", function(){
      if (input.value.toUpperCase() == answer) {
        fn()
        button.innerHTML = "You got it right!"
      } else {
        button.innerHTML = "Sorry, try again..."
      }
    })
  }

}) ()
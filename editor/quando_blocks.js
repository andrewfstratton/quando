(function () {
  let self = this['quando_blocks'] = {}
  let PREFIX = 'quando_' // TODO share with quando_editor
  self.CONFIG = {
    ADVANCED_COLOUR: '#ff8888',
    DISPLAY_COLOUR: '#ffcc88',
    MEDIA_COLOUR: '#b3ffb3',
    STYLE_COLOUR: '#ffccff',
    CLIENT_COLOUR: '#9cc9c9',
    TIME_COLOUR: '#ffb3b3',
    LEAP_MOTION_COLOUR: '#aaaaaa',
    DEVICE_COLOUR: '#e6ccff',
    ROBOT_COLOUR: '#8888ff',
    BLOCKLY_SATURATION: 1, // default for hue only colour - probably not used anymore - see http://colorizer.org/
    BLOCKLY_VALUE: 1 // ditto
  }

  let ajax_get = (url, callback) => {
    let xhr = new XMLHttpRequest()
    xhr.onload = () => {
      callback(xhr.responseText)
    }
    xhr.open('GET', url, true)
    xhr.send(null)
  }

  self.addBlocks = (quando_editor) => {
    let STATEMENT = 'STATEMENT'
    let DURATION = 'DURATION'
    let MENU_UNITS_MINS = { name: 'Units_mins', title: '', menu: ['Seconds', 'Minutes'] }
    let MENU_UNITS_HOURS = { name: 'Units_hours', title: '', menu: ['Seconds', 'Minutes', 'Hours'] }
    let FREQUENCY = 'FREQUENCY'
    let UNITS_MENU = 'UNITS_MENU'

    let EVERY_BLOCK = 'Every'
    quando_editor.defineTime({
      name: EVERY_BLOCK,
      interface: [
                { name: DURATION, title: '', number: '1' }, MENU_UNITS_HOURS,
                { statement: STATEMENT }
      ],
      javascript: (block) => {
        let seconds = quando_editor.getNumber(block, DURATION)
        if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Minutes') {
          seconds *= 60
        }
        if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Hours') {
          seconds *= 60 * 60
        }
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.every(' +
                    seconds +
                    ', function() {\n' + statement + '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    quando_editor.defineTime({
      name: 'After',
      interface: [
                { name: DURATION, title: '', number: '1' }, MENU_UNITS_HOURS,
                { statement: STATEMENT }
      ],
      javascript: (block) => {
        let seconds = quando_editor.getNumber(block, DURATION)
        if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Minutes') {
          seconds *= 60
        }
        if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Hours') {
          seconds *= 60 * 60
        }
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.after(' +
                    seconds +
                    ', function() {\n' +
                    statement +
                    '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    let ID_GREETING = 'Greeting'
    quando_editor.defineMedia({
      name: 'Show "',
      title: 'Show Text',
      interface: [{ name: ID_GREETING, title: '"', text: '.type your text here..' }, { title: '"' }],
      javascript: (block) => {
        return 'quando.text("' + quando_editor.getText(block, ID_GREETING) + '");\n'
      }
    })

    let SHOW_TITLE = 'Show Title'
    quando_editor.defineMedia({
      name: 'Show Title "',
      interface: [{ name: SHOW_TITLE, title: '', text: '.type your title here..' }, { title: '"' }],
      javascript: (block) => {
        return 'quando.title("' + quando_editor.getText(block, SHOW_TITLE) + '");\n'
      }
    })

    let _getOnContained = (block, container, contained, otherwise) => {
      let result = otherwise
      if (quando_editor.getParent(block, container)) {
        result = contained
      }
      return result
    }
    let _getStyleOnContained = (block, container) => {
      return 'set' + _getOnContained(block, container, 'Display', 'Default') + 'Style'
    }

    let COLOUR = 'colour'
    quando_editor.defineStyle({
      name: 'Background',
      title: 'Background Display Colour',
      interface: [
                { name: COLOUR, title: '', colour: '#ff0000' }
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let colour = quando_editor.getColour(block, COLOUR)
        return `quando.${method}('#quando_image', 'background-color', '${colour}');\n`
      }
    })

    let IMAGE = 'Images'
    let FILE_IMAGE = {name: IMAGE, title: '', file: 'images'}
    quando_editor.defineMedia({
      name: 'Display',
      title: '\uD83D\uDCF7 Show Image',
      interface: [ FILE_IMAGE ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let image = quando_editor.getFile(block, IMAGE)
        return `quando.image_update_video("/client/media/${image}");\n` +
                    `quando.${method}('#quando_image', 'background-image', 'url("/client/media/${image}")');\n`
      }
    })

    let VIDEO = 'Video'
    let MEDIA_LOOP_MENU = 'MEDIA_LOOP_MENU'
    let CHECK_STOP_WITH_DISPLAY = '   With display'
    let FILE_VIDEO = { name: VIDEO, title: '', file: 'video' }
    quando_editor.defineMedia({
      name: 'Show Video',
      title: '\uD83D\uDCFA Play',
      interface: [
                { name: MEDIA_LOOP_MENU, title: '', menu: ['Once', 'Forever'] },
                { title: 'Video' },
        FILE_VIDEO],
            // extras: [
            //     {title: CHECK_STOP_WITH_DISPLAY, check:true},
            // ],
      javascript: (block) => {
        let video_url = quando_editor.getFile(block, VIDEO)
        let loop = (quando_editor.getMenu(block, MEDIA_LOOP_MENU) == 'Forever')
        let result = "quando.video('/client/media/" + video_url + "'" + ', ' + loop + ');\n'
        return result
      }
    })
    let AUDIO = 'Audio'
    let FILE_AUDIO = {name: AUDIO, title: '', file: 'audio'}
    quando_editor.defineMedia({
      name: 'Play',
      title: '\uD83D\uDD0A Play',
      interface: [
                { name: MEDIA_LOOP_MENU, title: '', menu: ['Once', 'Forever'] },
                { title: 'Audio' },
        FILE_AUDIO ],
            // extras: [
            //     {title: CHECK_STOP_WITH_DISPLAY, check:true  },
            // ],
      javascript: (block) => {
        let _url = quando_editor.getFile(block, AUDIO)
        let loop = (quando_editor.getMenu(block, MEDIA_LOOP_MENU) == 'Forever')
        let result = "quando.audio('/client/media/" + _url + "'" + ', ' + loop + ');\n'
        return result
      }
    })
    let CHECK_TEXT = ' Text'
    let CHECK_TITLE = ' Title'
    let CHECK_IMAGE = ' Image'
    let CHECK_VIDEO = ' Video'
    let CHECK_AUDIO = ' Audio'
    let CLEAR = 'Clear'
    quando_editor.defineMedia({
      name: CLEAR,
      interface: [
                { name: CHECK_TEXT, check: false },
                { name: CHECK_TITLE, check: false },
                { name: CHECK_IMAGE, check: false },
                { name: CHECK_VIDEO, check: false },
                { name: CHECK_AUDIO, check: false }
      ],
      javascript: (block) => {
        result = ''
        if (quando_editor.getCheck(block, CHECK_TEXT)) {
          result += 'quando.text();\n'
        }
        if (quando_editor.getCheck(block, CHECK_TITLE)) {
          result += 'quando.title();\n'
        }
        if (quando_editor.getCheck(block, CHECK_IMAGE)) {
          result += `quando.setDisplayStyle('#quando_image', 'background-image', 'url("/client/transparent.png")');\n`
        }
        if (quando_editor.getCheck(block, CHECK_VIDEO)) {
          result += 'quando.clear_video();\n'
        }
        if (quando_editor.getCheck(block, CHECK_AUDIO)) {
          result += 'quando.clear_audio();\n'
        }
        return result
      }
    })

    let DIG_COLOUR = 0
    let WHEN_VITRINE_BLOCK = 'When Display Case'
    let WHEN_VITRINE_TEXT = 'title'
    quando_editor.defineDisplay({
      name: WHEN_VITRINE_BLOCK,
      title: 'When Display',
      next: false,
      previous: false,
      interface: [{
        name: WHEN_VITRINE_TEXT, title: '', text: 'Title and label'
      },
            { statement: STATEMENT }
      ],
      javascript: (block) => {
        let title = quando_editor.getText(block, WHEN_VITRINE_TEXT)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = `quando.vitrine("${block.id}", function() {\n` +
                    `quando.title("${title}");\n` +
                    `${statement}});\n`
        return result
      }
    })

    function _update_menus (ev, block_id, text = false) {
      let topBlocks = Blockly.mainWorkspace.getAllBlocks()
      let matchBlock = [PREFIX + LABEL_TO_BLOCK, PREFIX + SHOW_DISPLAY]
      for (let checkblock of topBlocks) {
        if (matchBlock.includes(checkblock.type)) {
          let menuid = quando_editor.getMenu(checkblock, LABEL_TO_MENU)
          if (menuid == block_id) {
            if (text) {
              quando_editor.setMenuText(checkblock, LABEL_TO_MENU, text)
            } else {
              quando_editor.resetMenu(checkblock, LABEL_TO_MENU)
            }
          }
        }
      }
    }

    Blockly.mainWorkspace.addChangeListener((ev) => {
      let workspace = Blockly.Workspace.getById(ev.workspaceId)
      let block = workspace.getBlockById(ev.blockId)
      if (ev.type == Blockly.Events.CHANGE) {
        if (block.type == PREFIX + WHEN_VITRINE_BLOCK) {
          _update_menus(ev, block.id, ev.newValue)
        }
        quando_editor.updateExtras(block) // Any Extras menu will be updated
      } else if (ev.type == Blockly.Events.CREATE) {
        if (block.type == PREFIX + WHEN_VITRINE_BLOCK) {
          _update_menus(ev, block.id, quando_editor.getText(block, WHEN_VITRINE_TEXT))
        }
        quando_editor.updateExtras(block) // Any Extras menu will be updated
      } else if (ev.type == Blockly.Events.DELETE) {
        _update_menus(ev, ev.ids[0])
      }
    })

        // Build the drop down list of Vitrines
    let _label_menu = () => {
      let topBlocks = Blockly.mainWorkspace.getAllBlocks()
      let choices = [['-----', 0]]
      for (let block of topBlocks) {
        if (block.type == PREFIX + WHEN_VITRINE_BLOCK) {
          let text = quando_editor.getText(block, 'title')
          choices.push([text, block.id])
        }
      }
      return choices
    }
    let LABEL_TO_MENU = 'to'
    let _label_javascript = (block) => {
      let menuid = quando_editor.getMenu(block, LABEL_TO_MENU)
            // find when block on id, then get it's title
      let whenblock = Blockly.mainWorkspace.getBlockById(menuid)
      let title = quando_editor.getText(whenblock, WHEN_VITRINE_TEXT)
      let result = `quando.addLabel("${menuid}", "${title}");\n`
      return result
    }
    let LABEL_TO_BLOCK = 'Label to'
    let LABEL_TEXT = 'text'
    quando_editor.defineDisplay({
            // TODO must be in a vitrine...?
      name: LABEL_TO_BLOCK,
      title: 'Label',
      interface: [
        {
          name: LABEL_TO_MENU,
          menu: _label_menu
        }
      ],
      javascript: _label_javascript
    })

    let SHOW_DISPLAY = 'Show Display'
    let SHOW_DISPLAY_MENU = 'show display menu'
    quando_editor.defineDisplay({
      name: SHOW_DISPLAY,
      interface: [{
        name: LABEL_TO_MENU,
        title: '',
        menu: _label_menu
      }],
      javascript: (block) => {
        let menuid = quando_editor.getMenu(block, LABEL_TO_MENU)
                // find when block on id, then get it's title
        let whenblock = Blockly.mainWorkspace.getBlockById(menuid)
        let result = `quando.showVitrine("${menuid}");\n`
        return result
      }
    })

    let WHEN_LABEL_BLOCK = 'When Label'
    let WHEN_LABEL_TEXT = 'When label text'
    quando_editor.defineDisplay({
      name: WHEN_LABEL_BLOCK,
      interface: [
                { name: WHEN_LABEL_TEXT, title: '', text: '**Put label text here**' },
                { statement: STATEMENT }
      ],
      javascript: (block) => {
        let text = quando_editor.getText(block, WHEN_LABEL_TEXT)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = `quando.addLabelStatement("${text}", function() {\n${statement}});\n`
        return result
      }
    })

    let STYLE_BLOCK = 'Style'
    let STYLE_MENU = 'style'
    let DIV_MENU = 'div'
    quando_editor.defineStyle({
      name: STYLE_BLOCK,
      title: '',
      interface: [
        { menu: [['Title', '#quando_title'], ['Text', '#quando_text'], ['Labels', '.quando_label']],
          name: DIV_MENU, title: '' },
        {
          menu: ['Font Colour', 'Background Colour'],
          name: STYLE_MENU,
          title: ''
        },
                { name: COLOUR, title: '', colour: '#ff0000' }
      ],
      javascript: (block) => {
        let result = ''
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        let style = quando_editor.getMenu(block, STYLE_MENU)
        let value = quando_editor.getColour(block, COLOUR)
        if (style == 'Font Colour') {
          style = 'color'
        } else {
          style = 'background-color ' // not actually javascript?!
                    // so backgroundColor won't work - has to be CSS interpreted...'
          let bigint = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value)
          let r = parseInt(bigint[1], 16)
          let g = parseInt(bigint[2], 16)
          let b = parseInt(bigint[3], 16)
          value = `rgba(${r}, ${g}, ${b}, 0.6)`
          if (div == '.quando_label') { // Need to put in the transition opacity - I think this is working now
            result += `quando.${method}('${div}.focus', '${style}', 'rgba(${r}, ${g}, ${b}, 1)');\n`
          }
        }
        result += `quando.${method}('${div}', '${style}', '${value}');\n`
        return result
      }
    })

    let FONT_SIZE_BLOCK = 'Font Size'
    let FONT_SIZE = 'font size'
    quando_editor.defineStyle({
      name: FONT_SIZE_BLOCK,
      interface: [
                { menu: [['Title', '#quando_title'], ['Text', '#quando_text'], ['Labels', '.quando_label']],
                  name: DIV_MENU, title: '' },
                { name: FONT_SIZE, title: '', number: 100 }, {title: '+ characters across screen'}
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        let value = 100 / quando_editor.getNumber(block, FONT_SIZE)
        result = `quando.${method}('${div}', 'font-size', '${value}vw');\n`
        return result
      }
    })

    let FONT_TYPE_BLOCK = 'Font'
    let FONT_NAME_MENU = 'font name'
    quando_editor.defineStyle({
      name: FONT_TYPE_BLOCK,
      interface: [
                { menu: [['Title', '#quando_title'], ['Text', '#quando_text'], ['Labels', '.quando_label']],
                  name: DIV_MENU, title: '' },
        {
          menu: ['sans-serif', 'Arial', 'Helvetica', 'Arial Black', 'Gadget', 'Comic Sans MS', 'cursive',
            'Impact', 'Charcoal', 'Lucida Sans Unicode', 'Lucida Grande', 'Tahoma', 'Geneva',
            'Trebuchet MS', 'Verdana',
            'serif', 'Georgia', 'Palatino Linotype', 'Book Antiqua', 'Palatino',
            'Times New Roman', 'Times',
            'monospace', 'Courier New', 'Courier',
            'Lucida Console', 'Monaco'],
          name: FONT_NAME_MENU,
          title: ''
        }
      ],
      javascript: (block) => {
        let result = ''
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        let font_name = quando_editor.getMenu(block, FONT_NAME_MENU)
        result += `quando.${method}('${div}', 'font-family', '${font_name}', ',');\n`
        return result
      }
    })

    let EXPLORATION_RULE = 'Exploration Rule'
    quando_editor.defineBlock({
      name: EXPLORATION_RULE,
      title: 'When',
      category: 'experiment',
      colour: '#55bb55',
      interface: [
                { name: 'title', title: '', text: ''},
                { name: 'text', title: '', text: ''}
      ],
      extras: [
                { name: 'text3', title: '', text: ''},
                { name: 'text4', title: '', text: ''},
                { name: 'text5', title: '', text: ''},
                { statement: STATEMENT }
      ]
    })

    let EXPLORATION_ACTION = 'Exploration Action'
    quando_editor.defineBlock({
      name: EXPLORATION_ACTION,
      title: 'Do',
      category: 'experiment',
      colour: '#5555bb',
      interface: [
                { name: 'title', title: '', text: ''},
                { name: 'text', title: '', text: ''}
      ],
      extras: [
                { name: 'text3', title: '', text: ''},
                { name: 'text4', title: '', text: ''},
                { name: 'text5', title: '', text: ''}
      ]
    })

    quando_editor.defineDevice({
      name: 'When Device',
      interface: [
                { name: 'name', title: '', text: 'Box' },
                { statement: STATEMENT }
      ],
      javascript: (block) => {
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.' + fn + '(' +
                    'function() {\n' +
                    statement +
                    '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    let MICROBIT_GESTURE_MENU = 'MicroBit Gesture'
    quando_editor.defineMicrobit({
      name: 'When micro:bit',
      interface: [
                { menu: [['Up', 'ubitUp'], ['Down', 'ubitDown'], ['Forward', 'ubitForward'],
                  ['Backward', 'ubitBackward'], ['Left', 'ubitLeft'], ['Right', 'ubitRight'],
                  ['A Button', 'ubitA'], ['B Button', 'ubitB']],
                  name: MICROBIT_GESTURE_MENU, title: '' },
                { statement: STATEMENT }
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, MICROBIT_GESTURE_MENU)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.ubit.' + fn + '(' +
                    'function() {\n' +
                    statement +
                    '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    let LEAP_GESTURE_MENU = 'Leap Gesture Menu'
    quando_editor.defineLeap({
      name: 'When Leap',
      interface: [
                { menu: [['Fist', 'handClosed'], ['Flat', 'handOpen']], name: LEAP_GESTURE_MENU, title: '' },
                { statement: STATEMENT }
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, LEAP_GESTURE_MENU)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = `quando.leap.${fn}(\nfunction() {\n` +
                    statement +
                    '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    let WHEN_IDLE = 'When Idle for'
    let ACTIVE_STATEMENT = 'ACTIVE_STATEMENT'
    quando_editor.defineTime({
      name: WHEN_IDLE,
      next: false,
      previous: false,
      interface: [
                { name: DURATION, title: '', number: '1' }, MENU_UNITS_MINS,
                { statement: STATEMENT },
                { row: 'Then When Active', statement: ACTIVE_STATEMENT }
      ],
      javascript: (block) => {
        let seconds = quando_editor.getNumber(block, DURATION)
        if (quando_editor.getMenu(block, MENU_UNITS_MINS.name) === 'Minutes') {
          seconds *= 60
        }
        let statement = quando_editor.getStatement(block, STATEMENT)
        let active_statement = quando_editor.getStatement(block, ACTIVE_STATEMENT)
        let result = 'quando.idle(' +
                    seconds +
                    ', function() {\n' + statement + '}, function() {\n' +
                    active_statement + '});\n'
        return result
      }
    })

    quando_editor.defineTime({
      name: 'Check',
      interface: [
                { name: FREQUENCY, title: '', number: 1 },
        {
          menu: ['Second', 'Minute', 'Hour', 'Day'],
          name: UNITS_MENU,
          title: 'times per'
        },
                { statement: STATEMENT }
      ],
      javascript: (block) => {
        let frequency = quando_editor.getNumber(block, FREQUENCY)
        let seconds = 1
        switch (quando_editor.getMenu(block, UNITS_MENU)) {
          case 'Minute': seconds = 60
            break
          case 'Hour': seconds = 60 * 60
            break
          case 'Day': seconds = 60 * 60 * 24
            break
        };
        let time = seconds / frequency
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.every(' +
                    time +
                    ', function() {\n' +
                    statement +
                    '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    let CONTENT_POSITION = 'Position'
    let DIRECTION_MENU = 'Direction'
    let POSITION_SIZE = 'Position Size'
    quando_editor.defineClient({
      name: CONTENT_POSITION,
      interface: [
        { menu: [['Title', '#quando_title'], ['Text', '#quando_text'], ['Labels', '#quando_labels']],
          name: DIV_MENU, title: '' },
        { name: POSITION_SIZE, title: '', number: 0 }, {title: '%'},
        { menu: ['top', 'bottom', 'left', 'right'], name: DIRECTION_MENU, title: 'from' }
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        let direction = quando_editor.getMenu(block, DIRECTION_MENU)
        let value = quando_editor.getNumber(block, POSITION_SIZE)
        result = `quando.${method}('${div}', '${direction}', '${value}%');\n`
        if (direction == 'bottom') {
          result += `quando.${method}('${div}', 'top', 'unset');\n` // override the set top 0px
        } else if (direction == 'right') {
          result += `quando.${method}('${div}', 'left', 'unset');\n` // override the set left
        }
        return result
      }
    })

    let CONTENT_SIZE = 'Size'
    let DIMENSION_MENU = 'Dimension'
    quando_editor.defineClient({
      name: CONTENT_SIZE,
      interface: [
        { menu: [['Title', '#quando_title'], ['Text', '#quando_text'], ['Labels', '#quando_labels']],
          name: DIV_MENU, title: '' },
        { name: POSITION_SIZE, title: '', number: 100 }, {title: '%'},
        { menu: ['height', 'width'], name: DIMENSION_MENU, title: 'of' }
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        let dimension = quando_editor.getMenu(block, DIMENSION_MENU)
        let value = quando_editor.getNumber(block, POSITION_SIZE)
        result = `quando.${method}('${div}', '${dimension}', '${value}%');\n`
        return result
      }
    })

    let PROJECTION_ACTION = 'Projection Action'
    quando_editor.defineDisplay({
      name: PROJECTION_ACTION,
      title: '',
      interface: [
                { name: 'front_rear', menu: ['Normal', 'Rear'], title: '' },
                { title: 'Projection'}
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let front_rear = quando_editor.getMenu(block, 'front_rear')
        let scale = '1,1'
        if (front_rear == 'Rear') {
          scale = '-1,1'
        }
        result = `quando.${method}('html', 'transform', 'scale(${scale})');\n`
        return result
      }
    })

    function _clamp_degrees (degrees) {
      return degrees >= 0 ? degrees % 360 : (degrees % 360) + 360 // necessary since % of negatives don't work ?!
    }

    let VALUE_CURSOR = 'Change Cursor'
    let CHANGE_CURSOR_MENU = 'Cursor menu'
    let DEVICE_LEFT_RIGHT = '\u21D4'
    let DEVICE_UP_DOWN = '\u21D5'
    let CHANGE_PLUS_MINUS = 'plus minus'
        
    quando_editor.defineDevice({
      name: VALUE_CURSOR,
      interface: [
        { name: CHANGE_CURSOR_MENU,
          title: '',
          menu: [[DEVICE_LEFT_RIGHT, 'quando.cursor_left_right'],
            [DEVICE_UP_DOWN, 'quando.cursor_up_down']]
          }
      ],
      javascript: (block) => {
        let value = quando_editor.getMenu(block, CHANGE_CURSOR_MENU)
        let result = `${value}(val);\n`
        return result
      }
    })

    let MOVE_3D_OBJECT = 'Change 3D Object'
    let CHANGE_3D_OBJECT_MENU = '3D Object menu'
    let CHANGE_PLUS_MINUS = 'plus minus'
    quando_editor.defineDevice({
      name: MOVE_3D_OBJECT, title:'Move 3D Object',
      interface: [
        { name: CHANGE_3D_OBJECT_MENU,
          title: '',
          menu: [
            [DEVICE_LEFT_RIGHT, 'quando.object3d.left_right'],
            [DEVICE_UP_DOWN, 'quando.object3d.up_down'],
            ['Zoom', 'quando.object3d.in_out']]
          }
      ],
      extras: [
        {name: CHANGE_PLUS_MINUS, title: '+/-', number: 15}, {title: 'cm'}
      ],
      javascript: (block) => {
        let value = quando_editor.getMenu(block, CHANGE_3D_OBJECT_MENU)
        let extras = {}
        // convert to mm
        var plus_minus = 10 * quando_editor.getNumber(block, CHANGE_PLUS_MINUS)
        extras.min = -plus_minus
        extras.max = plus_minus
        extras = JSON.stringify(extras)
        let result = `${value}(val);\n`
        return result
      }
    })

    let ROTATE_3D_OBJECT = 'Rotate 3D Object'
    let ROTATE_3D_OBJECT_MENU = '3D Object menu'
    quando_editor.defineDevice({
      name: ROTATE_3D_OBJECT,
      interface: [
        { name: ROTATE_3D_OBJECT_MENU,
          title: '',
          menu: [
            ['\u21D4 Yaw', 'quando.object3d.yaw'],
            ['\u21D5 Pitch', 'quando.object3d.pitch'],
            ['\u2939\u2938 Roll', 'quando.object3d.roll']]
          }
      ],
      extras: [
        {name: CHANGE_PLUS_MINUS, title: '+/-', number: 15}, {title: 'cm'}
      ],
      javascript: (block) => {
        let value = quando_editor.getMenu(block, CHANGE_3D_OBJECT_MENU)
        let extras = {}
        // convert to mm
        var plus_minus = 10 * quando_editor.getNumber(block, CHANGE_PLUS_MINUS)
        extras.min = -plus_minus
        extras.max = plus_minus
        extras = JSON.stringify(extras)
        let result = `${value}(val);\n`
        return result
      }
    })


    let CHANGE_WITH_MICROBIT_ANGLE = 'When micro:bit angle '
    let CHANGE_VARIABLE = 'Variable'
    let CHANGE_ROLL = '\u2939\u2938 Roll'
    let CHANGE_PITCH = '\u21D5 Pitch'
    let CHANGE_HEADING = '\u21D4 Heading'
    let CHANGE_MAG_X = 'Mag X'
    let CHANGE_MAG_Y = 'Mag Y'
    let CHANGE_MID_ANGLE = 'Change Angle'
    let CHECK_INVERTED = 'Inverted'

    quando_editor.defineMicrobit({
      name: CHANGE_WITH_MICROBIT_ANGLE,
      interface: [
        { name: CHANGE_VARIABLE,
          title: '',
          menu: [CHANGE_HEADING, CHANGE_PITCH, CHANGE_ROLL,
            // CHANGE_MAG_X, CHANGE_MAG_Y
          ]},
        { statement: STATEMENT }
      ],
      extras: [
        {name: CHANGE_MID_ANGLE, title: '', number: 0}, {title: 'degrees'},
        {name: CHANGE_PLUS_MINUS, title: '+/-', number: 25}, {title: 'degrees'},
        {name: CHECK_INVERTED, check: false}
      ],
      javascript: (block) => {
        let variable = quando_editor.getMenu(block, CHANGE_VARIABLE)
        switch (variable) {
          case CHANGE_ROLL: variable = 'handleRoll'
            break
          case CHANGE_PITCH: variable = 'handlePitch'
            break
          case CHANGE_HEADING: variable = 'handleHeading'
            break
          case CHANGE_MAG_X: variable = 'handleMagX'
            break
          case CHANGE_MAG_Y: variable = 'handleMagY'
            break
        }
        let extras = {}
        extras.mid_angle = _clamp_degrees(quando_editor.getNumber(block, CHANGE_MID_ANGLE))
        extras.plus_minus = quando_editor.getNumber(block, CHANGE_PLUS_MINUS)
        if (quando_editor.getCheck(block, CHECK_INVERTED)) {
          extras['inverted'] = true
        }
        extras = JSON.stringify(extras)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = `quando.ubit.${variable}(function(val) {\n${statement}}, ${extras}` +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    let CHANGE_WITH_LEAP_DISTANCE = 'When Leap move'
    let LEAP_LEFT_RIGHT = '\u21D4'
    let LEAP_HEIGHT = '\u21D5'
    let LEAP_DEPTH = '\u2922 In-Out'
    quando_editor.defineLeap({
      name: CHANGE_WITH_LEAP_DISTANCE,
      interface: [
        { name: CHANGE_VARIABLE,
          title: '',
          menu: [LEAP_LEFT_RIGHT, LEAP_HEIGHT, LEAP_DEPTH]},
        { statement: STATEMENT }
      ],
      extras: [
        {name: CHANGE_PLUS_MINUS, title: '+/-', number: 15}, {title: 'cm'},
        {name: CHECK_INVERTED, check: false}
      ],
      javascript: (block) => {
        let extras = {}
        // convert to mm
        var plus_minus = 10 * quando_editor.getNumber(block, CHANGE_PLUS_MINUS)
        extras.min = -plus_minus
        extras.max = plus_minus
        let variable = quando_editor.getMenu(block, CHANGE_VARIABLE)
        switch (variable) {
          case LEAP_LEFT_RIGHT: variable = 'X'
            break
          case LEAP_HEIGHT: variable = 'Y'
            extras.min = 100 // 10 cm is minimum height set
            extras.max = 2 * plus_minus + 100 // ste to the right height...
            break
          case LEAP_DEPTH: variable = 'Z'
            break
        }
        if (quando_editor.getCheck(block, CHECK_INVERTED)) {
          extras['inverted'] = true
        }
        extras = JSON.stringify(extras)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = `quando.leap.handle${variable}(function(val) {\n${statement}}, ${extras}` +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    let CHANGE_WITH_LEAP_ANGLE = 'When Leap angle'
    let CHANGE_YAW = '\u21D4 Yaw'
    quando_editor.defineLeap({
      name: CHANGE_WITH_LEAP_ANGLE,
      interface: [
        { name: CHANGE_VARIABLE,
          title: '',
          menu: [CHANGE_YAW, CHANGE_PITCH, CHANGE_ROLL]},
          { statement: STATEMENT }
      ],
      extras: [
        {name: CHANGE_MID_ANGLE, title: '', number: 0}, {title: 'degrees'},
        {name: CHANGE_PLUS_MINUS, title: '+/-', number: 25}, {title: 'degrees'},
        {name: CHECK_INVERTED, check: false}
      ],
      javascript: (block) => {
        let variable = quando_editor.getMenu(block, CHANGE_VARIABLE)
        switch (variable) {
          case CHANGE_ROLL: variable = 'Roll'
            break
          case CHANGE_PITCH: variable = 'Pitch'
            break
          case CHANGE_YAW: variable = 'Yaw'
            break
        }
        let extras = {}
        extras.mid_angle = _clamp_degrees(quando_editor.getNumber(block, CHANGE_MID_ANGLE))
        extras.plus_minus = quando_editor.getNumber(block, CHANGE_PLUS_MINUS)
        if (quando_editor.getCheck(block, CHECK_INVERTED)) {
          extras['inverted'] = true
        }
        extras = JSON.stringify(extras)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = `quando.leap.handle${variable}(function(val) {\n${statement}\n}, ${extras}` +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    let SHOW_OBJECT3D = 'Object3D'
    let FILE_OBJECT3D = '\uD83C\uDF81 Show 3D Object'
    quando_editor.defineMedia({
      name: SHOW_OBJECT3D,
      title: '',
      interface: [ {name: FILE_OBJECT3D, file: 'objects'} ],
      javascript: (block) => {
        let object3d = quando_editor.getFile(block, FILE_OBJECT3D)
        // return `quando.object3d.loadOBJ('/client/media/', '${object3d}');\n`
        return `quando.object3d.loadGLTF('/client/media/${object3d}');\n`
      }
    })

    let DESCRIPTION_BLOCK = 'Description'
    let DESCRIPTION_TEXT = 'description_text'
    quando_editor.defineAdvanced({
      name: DESCRIPTION_BLOCK, title:' ',
      interface: [{name:DESCRIPTION_TEXT, title:' ', text:''},
        { statement: STATEMENT }
      ],
      javascript : (block) => {
        let description = quando_editor.getText(block, DESCRIPTION_TEXT)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let infix = ''
        if (description != '') {
          infix = ` // ${description}`
        }
        return `{${infix}\n${statement}}\n`
      }
    })
    
    let ROBOT_IP = 'Robot IP'
    let ROBOT_CONNECT = 'Connect'
    quando_editor.defineRobot({
      name: ROBOT_CONNECT,
      interface: [{ name: ROBOT_IP, title: '', text: '#ROBOT IP#' }],
      javascript: (block) => {
        return 'quando.robot.connect("' + quando_editor.getText(block, ROBOT_IP) + '");\n'
      }
    })

    let SCRIPT_BLOCK = 'Javascript: '
    let SCRIPT_TEXT = 'script_text'
    quando_editor.defineAdvanced({
      name: SCRIPT_BLOCK,
      interface: [{name:SCRIPT_TEXT, title:'', text:''}
      ],
      javascript : (block) => {
        let script = quando_editor.getRawText(block, SCRIPT_TEXT)
        return `${script};\n`
      }
    })

    let CURSOR_COLOUR_BLOCK = 'Cursor Opacity'
    let OPACITY = 'Opacity'
    quando_editor.defineCursor({
      name: CURSOR_COLOUR_BLOCK, title: 'Cursor',
      interface: [
        { name: COLOUR, title: '', colour: '#ffcc00' },
        { name: OPACITY, title: 'Opacity', number: 70 }, {title: '%'}
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let opacity = quando_editor.getNumber(block, OPACITY) / 100
        let colour = quando_editor.getColour(block, COLOUR)
        let bigint = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colour)
        let r = parseInt(bigint[1], 16)
        let g = parseInt(bigint[2], 16)
        let b = parseInt(bigint[3], 16)
        colour = `rgba(${r}, ${g}, ${b}, ${opacity})`
        result = `quando.${method}('#cursor', 'background-color', '${colour}');\n`
        return result
      }
    })

    let CURSOR_SIZE_BLOCK = 'Cursor'
    let SIZE = 'Size'
    quando_editor.defineCursor({
      name: CURSOR_SIZE_BLOCK,
      interface: [
        { name: SIZE, title: 'Size', number: 4.4 }, {title: '% of width'},
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let size = quando_editor.getNumber(block, SIZE)
        let margin = -size/2
        result = `quando.${method}('#cursor', ['width','height'], '${size}vw');\n`
        result += `quando.${method}('#cursor', ['margin-left', 'margin-top'], '${margin}vw');\n`
        return result
      }
    })

    let ROBOT_SAYS = 'Say'
    let ROBOT_TEXT_SAYS = 'Robot Text Says'
    let ROBOT_CHANGE_SPEED_SPEECH = 'Speech Speed'
    quando_editor.defineRobot({
      name: ROBOT_SAYS,
      interface: [{ name: ROBOT_TEXT_SAYS, title: '', text: 'Hello' }],
      extras: [
        {name: ROBOT_CHANGE_SPEED_SPEECH, title: 'Speed of speech', number: 100}
      ],
      javascript: (block) => {
        let txt = quando_editor.getText(block, ROBOT_TEXT_SAYS)
        let extras = {}
        extras.speed = quando_editor.getNumber(block, ROBOT_CHANGE_SPEED_SPEECH)
        extras = JSON.stringify(extras)
        return `quando.robot.say("${txt}",${extras});\n`
      }
    })

  } // self.addBlocks
})()

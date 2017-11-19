(function () {
  let self = this['quando_blocks'] = {}
  let PREFIX = 'quando_' // TODO share with quando_editor
  self.CONFIG = {
    DISPLAY_COLOUR: '#ffcc88',
    MEDIA_COLOUR: '#b3ffb3',
    STYLE_COLOUR: '#ffccff',
    CLIENT_COLOUR: '#9cc9c9',
    TIME_COLOUR: '#ffb3b3',
    LEAP_MOTION_COLOUR: '#aaaaaa',
    DEVICE_COLOUR: '#e6ccff',
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
        let seconds = quando_editor.getNumber(block, DURATION) * 1
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
        let seconds = quando_editor.getNumber(block, DURATION) * 1
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

        // let LEAP_BLOCK = 'When Hands';
        // let HAND_COUNT = 'hand_count';
        // quando_editor.defineLeapMotion({
        //     name: LEAP_BLOCK, next: false, previous: false,
        //     interface: [
        //         { name: HAND_COUNT, title: ' = ', number: 1 },
        //         { statement: STATEMENT }
        //     ],
        //     javascript: (block) => {
        //         let statement = quando_editor.getStatement(block, STATEMENT);
        //         let result = "quando.hands(" + quando_editor.getNumber(block, HAND_COUNT) + ",\n"
        //             + " function() {\n"
        //             + statement + "});";
        //         return result;
        //     }
        // });
        // let HANDED_BLOCK = 'When Hand ';
        // let HAND_LEFT = 'Left';
        // let HAND_RIGHT = 'Right';
        // quando_editor.defineLeapMotion({
        //     name: HANDED_BLOCK, next: false, previous: false,
        //     interface: [
        //         { name: HAND_LEFT, check: false },
        //         { name: HAND_RIGHT, check: false },
        //         { statement: STATEMENT }
        //     ],
        //     javascript: (block) => {
        //         let statement = quando_editor.getStatement(block, STATEMENT);
        //         let result = "quando.handed("
        //             + quando_editor.getCheck(block, HAND_LEFT) + ",\n"
        //             + quando_editor.getCheck(block, HAND_RIGHT) + ",\n"
        //             + " function() {\n"
        //             + statement + "});";
        //         return result;
        //     }
        // });

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
// console.log('change:'+checkblock.type)
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
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
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
        switch (div) {
          case 'Title': div = '#quando_title'
            break
          case 'Text': div = '#quando_text'
            break
          case 'Labels': div = '.quando_label'
            break
        }
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
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
                { name: FONT_SIZE, title: '', number: 100 }, {title: '+ characters across screen'}
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        switch (div) {
          case 'Title': div = '#quando_title'
            break
          case 'Text': div = '#quando_text'
            break
          case 'Labels': div = '.quando_label'
            break
        }
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
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
        {
          menu: ['sans-serif', 'Arial', 'Helvetica', 'Arial Black', 'Gadget', 'Comic Sans MS', 'cursive',
            'Impact', 'Charcoal', 'Lucida Sans Unicode', 'Lucida Grande', 'Tahoma', 'Geneva',
            'Trebuchet MS', 'Verdana',
            'serif', 'Georgia', 'Palatino Linotype', 'Book Antiqua', 'Palatino',
            'Times New Roman', 'Times',
            'monospace', 'Courier New', 'Courier',
            'Lucida Console', 'Monaco', ['duMMy', 'XXX']],
          name: FONT_NAME_MENU,
          title: ''
        }
      ],
      javascript: (block) => {
        let result = ''
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        switch (div) {
          case 'Title': div = '#quando_title'
            break
          case 'Text': div = '#quando_text'
            break
          case 'Labels': div = '.quando_label'
            break
        }
        let font_name = quando_editor.getMenu(block, FONT_NAME_MENU)
        result += `quando.${method}('${div}', 'font-family', '${font_name}', ',');\n`
        return result
      }
    })

        let EXPLORATION_RULE = 'Exploration Rule';
        quando_editor.defineBlock({
            name: EXPLORATION_RULE, title:'When', category: 'experiment', colour: '#55bb55',
            interface: [
                { name: 'title', title:'', text: ''},
                { name: 'text', title: '', text: ''}
            ],
            extras: [
                { name: 'text3', title: '', text: ''},
                { name: 'text4', title: '', text: ''},
                { name: 'text5', title: '', text: ''},
                { statement: STATEMENT }
            ]
        });

        let EXPLORATION_ACTION = 'Exploration Action';
        quando_editor.defineBlock({
            name: EXPLORATION_ACTION, title:'Do', category: 'experiment', colour: '#5555bb',
            interface: [
                { name: 'title', title:'', text: ''},
                { name: 'text', title: '', text: ''}
            ],
            extras:[
                { name: 'text3', title: '', text: ''},
                { name: 'text4', title: '', text: ''},
                { name: 'text5', title: '', text: ''}
                ]
        });

        quando_editor.defineDevice({
            name: 'When Device',
            interface: [
                { name: 'name', title: '', text: 'Box' },
                { statement: STATEMENT }
            ],
            javascript: (block) => {
                let statement = quando_editor.getStatement(block, STATEMENT);
                let result = "quando." + fn + "("
                    + "function() {\n"
                    + statement
                    + "}"
                    + _getOnContained(block, [WHEN_VITRINE_BLOCK], "", ", false")
                    + ");\n";
                return result;
            }
        });

    let MICROBIT_GESTURE_MENU = 'MicroBit Gesture'
    quando_editor.defineDevice({
      name: 'When micro:bit',
      interface: [
                { menu: ['Up', 'Down', 'Forward', 'Backward', 'Left', 'Right', 'A Button', 'B Button'], name: MICROBIT_GESTURE_MENU, title: '' },
                { statement: STATEMENT }
      ],
      javascript: (block) => {
        let fn = ''
        switch (quando_editor.getMenu(block, MICROBIT_GESTURE_MENU)) {
          case 'Up':
            fn = 'ubitUp'
            break
          case 'Down':
            fn = 'ubitDown'
            break
          case 'Forward':
            fn = 'ubitForward'
            break
          case 'Backward':
            fn = 'ubitBackward'
            break
          case 'Left':
            fn = 'ubitLeft'
            break
          case 'Right':
            fn = 'ubitRight'
            break
          case 'A Button':
            fn = 'ubitA'
            break
          case 'B Button':
            fn = 'ubitB'
            break
        };
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando_ubit.' + fn + '(' +
                    'function() {\n' +
                    statement +
                    '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    let LEAP_GESTURE_MENU = 'Leap Gesture Menu'
    quando_editor.defineDevice({
      name: 'When Leap',
      interface: [
                { menu: ['Fist', 'Flat'], name: LEAP_GESTURE_MENU, title: '' },
                { statement: STATEMENT }
      ],
      javascript: (block) => {
        let fn = ''
        switch (quando_editor.getMenu(block, LEAP_GESTURE_MENU)) {
          case 'Fist':
            fn = 'handClosed'
            break
          case 'Flat':
            fn = 'handOpen'
            break
        }
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando_leap.' + fn + '(' +
                    'function() {\n' +
                    statement +
                    '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    let WHEN_ROLL_MIN = 'Min'
    let WHEN_ROLL_MAX = 'Max'
    let MENU_ANGLE = 'Menu Angle'
    quando_editor.defineDevice({
      name: 'When Roll between ', title: 'When',
      interface: [
                { menu:['Roll','Pitch'], name: MENU_ANGLE, title:''},
                { name: WHEN_ROLL_MIN, title: 'angle between', number: '-90' },
                { name: WHEN_ROLL_MAX, title: 'and', number: '90' },
                {title: 'degrees'},
                { statement: STATEMENT }
      ],
      javascript: (block) => {
        let min = quando_editor.getNumber(block, WHEN_ROLL_MIN)
        let max = quando_editor.getNumber(block, WHEN_ROLL_MAX)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let fn =''
        switch (quando_editor.getMenu(block, MENU_ANGLE)) {
          case 'Roll' : fn = 'Roll'
            break
          case 'Pitch' : fn = 'Pitch'
            break
        }
        let result = `quando.ubit${fn}(${min}, ${max}, function() {\n${statement}}` +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    let WHEN_HEADING_MIN = 'Min'
    let WHEN_HEADING_MAX = 'Max'
    quando_editor.defineDevice({
      name: 'When heading between ',
      interface: [
                { name: WHEN_HEADING_MIN, title: '', number: '0' },
                { name: WHEN_HEADING_MAX, title: ' and ', number: '359' },
                {title: ' degrees'},
                { statement: STATEMENT }
      ],
      javascript: (block) => {
        let min = quando_editor.getNumber(block, WHEN_HEADING_MIN)
        let max = quando_editor.getNumber(block, WHEN_HEADING_MAX)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.ubitHeading(' + min + ',' + max + ',' +
                    'function() {\n' +
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
        let seconds = quando_editor.getNumber(block, DURATION) * 1
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
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
                { name: POSITION_SIZE, title: '', number: 0 }, {title: '%'},
                { menu: ['top', 'bottom', 'left', 'right'], name: DIRECTION_MENU, title: 'from' }
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        switch (div) {
          case 'Title': div = '#quando_title'
            break
          case 'Text': div = '#quando_text'
            break
          case 'Labels': div = '#quando_labels'
            break
        }
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
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
                { name: POSITION_SIZE, title: '', number: 100 }, {title: '%'},
                { menu: ['height', 'width'], name: DIMENSION_MENU, title: 'of' }
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        switch (div) {
          case 'Title': div = '#quando_title'
            break
          case 'Text': div = '#quando_text'
            break
          case 'Labels': div = '#quando_labels'
            break
        }
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

    let CHANGE_WITH_BLOCK = 'When Change'
    let CHANGE_VALUE = 'Value'
    let CHANGE_VARIABLE = 'Variable'
    let CURSOR_LEFT_RIGHT = '\u21D4 Cursor'
    let CURSOR_UP_DOWN = '\u21D5 Cursor'
    let LEAP_HEIGHT = 'Leap Up-Down'
    let LEAP_LEFT_RIGHT = 'Leap Left-Right'
    let LEAP_DEPTH = 'Leap In-Out'
    let UBIT_ROLL = 'micro:bit Roll'
    let UBIT_PITCH = 'micro:bit Pitch'
    let CHECK_INVERTED = 'Inverted'
    let DAMP_VALUE = 'Dampen'
    let CHANGE_MIN = 'Min'
    let CHANGE_MAX = 'Max'
    quando_editor.defineDevice({
      name: CHANGE_WITH_BLOCK,
      title: '',
      interface: [
                { name: CHANGE_VALUE, menu: [CURSOR_LEFT_RIGHT, CURSOR_UP_DOWN, 'VR Zoom'], title: '' },
                { name: CHANGE_VARIABLE, title: ' changes with ',
                  menu: [LEAP_HEIGHT, LEAP_LEFT_RIGHT, LEAP_DEPTH, UBIT_ROLL, UBIT_PITCH]}
      ],
      extras: [
                    {name: CHECK_INVERTED, check: false},
                    {name: CHANGE_MIN, number: '10'}, {title:'cm'},
                    {name: CHANGE_MAX, number: '40'}, {title:'cm'}
                    // {name: DAMP_VALUE, number: '0.25'}
      ],
      javascript: (block) => {
        let value = quando_editor.getMenu(block, CHANGE_VALUE)
        switch (value) {
          case CURSOR_UP_DOWN: value = 'cursor_up_down'
            break
          case CURSOR_LEFT_RIGHT: value = 'cursor_left_right'
            break
        }
        let cm = false
        let variable = quando_editor.getMenu(block, CHANGE_VARIABLE)
        switch (variable) {
          case UBIT_ROLL: variable = 'quando_ubit.handleRoll'
            break
          case UBIT_PITCH: variable = 'quando_ubit.handlePitch'
            break
          case LEAP_HEIGHT: variable = 'quando_leap.handleY'
            cm = true
            break
          case LEAP_LEFT_RIGHT: variable = 'quando_leap.handleX'
            cm = true
            break
          case LEAP_DEPTH: variable = 'quando_leap.handleZ'
            cm = true
            break
        }
        let extras = {}
        extras.min = quando_editor.getNumber(block, CHANGE_MIN) // converted to mm
        extras.max = quando_editor.getNumber(block, CHANGE_MAX)
        if (cm) {
          extras.min *= 10
          extras.max *= 10
        }
        if (quando_editor.getCheck(block, CHECK_INVERTED)) {
          extras['inverted'] = true
        }
        // extras.dampen = quando_editor.getNumber(block, DAMP_VALUE)
        // if (!extras.dampen) {
          // delete extras.dampen
        // }j
        extras = JSON.stringify(extras)
        let result = `${variable}(quando.${value}, ${extras}` +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    function _clamp_degrees(degrees) {
        return degrees >= 0 ? degrees % 360 : (degrees % 360) + 360 // necessary since % of negatives don't work ?!
    }

    let CHANGE_WITH_LEAP_ANGLE = 'Leap (Angle)'
    let LEAP_ROLL = 'Roll'
    let LEAP_PITCH = 'Pitch'
    let LEAP_YAW = 'Yaw'
    let CHANGE_MID_ANGLE = 'Change Angle'
    let CHANGE_PLUS_MINUS = 'plus minus'
    quando_editor.defineDevice({
      name: CHANGE_WITH_LEAP_ANGLE,
      interface: [
                { name: CHANGE_VARIABLE, title: '',
                  menu: [LEAP_ROLL, LEAP_PITCH, LEAP_YAW]},
                { name: CHANGE_VALUE, menu: [CURSOR_LEFT_RIGHT, CURSOR_UP_DOWN, 'VR Zoom'], title: 'changes' },
      ],
      extras: [
                    {name: CHANGE_MID_ANGLE, title:'', number: 0}, {title:'degrees'},
                    {name: CHANGE_PLUS_MINUS, title:'+/-', number: 25}, {title:'degrees'},
                    {name: CHECK_INVERTED, check: false}
      ],
      javascript: (block) => {
        let value = quando_editor.getMenu(block, CHANGE_VALUE)
        switch (value) {
          case CURSOR_UP_DOWN: value = 'cursor_up_down'
            break
          case CURSOR_LEFT_RIGHT: value = 'cursor_left_right'
            break
        }
        let variable = quando_editor.getMenu(block, CHANGE_VARIABLE)
        switch (variable) {
          case LEAP_ROLL: variable = 'Roll'
            break
          case LEAP_PITCH: variable = 'Pitch'
            break
          case LEAP_YAW: variable = 'Yaw'
            break
        }
        let extras = {}
        extras.mid_angle = _clamp_degrees(quando_editor.getNumber(block, CHANGE_MID_ANGLE))
        extras.plus_minus = quando_editor.getNumber(block, CHANGE_PLUS_MINUS)
        if (quando_editor.getCheck(block, CHECK_INVERTED)) {
          extras['inverted'] = true
        }
        extras = JSON.stringify(extras)
        let result = `quando_leap.handle${variable}(quando.${value}, ${extras}` +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })
  }
})()

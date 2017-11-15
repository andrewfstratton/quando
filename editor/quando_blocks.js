(function () {
  var self = this['quando_blocks'] = {}
  var PREFIX = 'quando_' // TODO share with quando_editor
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

  var ajax_get = function (url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
      callback(xhr.responseText)
    }
    xhr.open('GET', url, true)
    xhr.send(null)
  }

  self.addBlocks = function (quando_editor) {
    var STATEMENT = 'STATEMENT'
    var DURATION = 'DURATION'
    var MENU_UNITS_MINS = { name: 'Units_mins', title: '', menu: ['Seconds', 'Minutes'] }
    var MENU_UNITS_HOURS = { name: 'Units_hours', title: '', menu: ['Seconds', 'Minutes', 'Hours'] }
    var FREQUENCY = 'FREQUENCY'
    var UNITS_MENU = 'UNITS_MENU'

    var EVERY_BLOCK = 'Every'
    quando_editor.defineTime({
      name: EVERY_BLOCK,
      interface: [
                { name: DURATION, title: '', number: '1' }, MENU_UNITS_HOURS,
                { statement: STATEMENT }
      ],
      javascript: function (block) {
        var seconds = quando_editor.getNumber(block, DURATION) * 1
        if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Minutes') {
          seconds *= 60
        }
        if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Hours') {
          seconds *= 60 * 60
        }
        var statement = quando_editor.getStatement(block, STATEMENT)
        var result = 'quando.every(' +
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
      javascript: function (block) {
        var seconds = quando_editor.getNumber(block, DURATION) * 1
        if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Minutes') {
          seconds *= 60
        }
        if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Hours') {
          seconds *= 60 * 60
        }
        var statement = quando_editor.getStatement(block, STATEMENT)
        var result = 'quando.after(' +
                    seconds +
                    ', function() {\n' +
                    statement +
                    '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    var ID_GREETING = 'Greeting'
    quando_editor.defineMedia({
      name: 'Show "',
      title: 'Show Text',
      interface: [{ name: ID_GREETING, title: '"', text: '.type your text here..' }, { title: '"' }],
      javascript: function (block) {
        return 'quando.text("' + quando_editor.getText(block, ID_GREETING) + '");\n'
      }
    })

    var SHOW_TITLE = 'Show Title'
    quando_editor.defineMedia({
      name: 'Show Title "',
      interface: [{ name: SHOW_TITLE, title: '', text: '.type your title here..' }, { title: '"' }],
      javascript: function (block) {
        return 'quando.title("' + quando_editor.getText(block, SHOW_TITLE) + '");\n'
      }
    })

    var _getOnContained = function (block, container, contained, otherwise) {
      var result = otherwise
      if (quando_editor.getParent(block, container)) {
        result = contained
      }
      return result
    }
    var _getStyleOnContained = function (block, container) {
      return 'set' + _getOnContained(block, container, 'Display', 'Default') + 'Style'
    }

    var COLOUR = 'colour'
    quando_editor.defineStyle({
      name: 'Background',
      title: 'Background Display Colour',
      interface: [
                { name: COLOUR, title: '', colour: '#ff0000' }
      ],
      javascript: function (block) {
        var method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        var colour = quando_editor.getColour(block, COLOUR)
        return `quando.${method}('#quando_image', 'background-color', '${colour}');\n`
      }
    })

    var IMAGE = 'Images'
    var FILE_IMAGE = {name: IMAGE, title: '', file: 'images'}
    quando_editor.defineMedia({
      name: 'Display',
      title: '\uD83D\uDCF7 Show Image',
      interface: [ FILE_IMAGE ],
      javascript: function (block) {
        var method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        var image = quando_editor.getFile(block, IMAGE)
        return `quando.image_update_video("/client/media/${image}");\n` +
                    `quando.${method}('#quando_image', 'background-image', 'url("/client/media/${image}")');\n`
      }
    })
    var VIDEO = 'Video'
    var MEDIA_LOOP_MENU = 'MEDIA_LOOP_MENU'
    var CHECK_STOP_WITH_DISPLAY = '   With display'
    var FILE_VIDEO = { name: VIDEO, title: '', file: 'video' }
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
      javascript: function (block) {
        var video_url = quando_editor.getFile(block, VIDEO)
        var loop = (quando_editor.getMenu(block, MEDIA_LOOP_MENU) == 'Forever')
        var result = "quando.video('/client/media/" + video_url + "'" + ', ' + loop + ');\n'
        return result
      }
    })
    var AUDIO = 'Audio'
    var FILE_AUDIO = {name: AUDIO, title: '', file: 'audio'}
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
      javascript: function (block) {
        var _url = quando_editor.getFile(block, AUDIO)
        var loop = (quando_editor.getMenu(block, MEDIA_LOOP_MENU) == 'Forever')
        var result = "quando.audio('/client/media/" + _url + "'" + ', ' + loop + ');\n'
        return result
      }
    })
    var CHECK_TEXT = ' Text'
    var CHECK_TITLE = ' Title'
    var CHECK_IMAGE = ' Image'
    var CHECK_VIDEO = ' Video'
    var CHECK_AUDIO = ' Audio'
    var CLEAR = 'Clear'
    quando_editor.defineMedia({
      name: CLEAR,
      interface: [
                { name: CHECK_TEXT, check: false },
                { name: CHECK_TITLE, check: false },
                { name: CHECK_IMAGE, check: false },
                { name: CHECK_VIDEO, check: false },
                { name: CHECK_AUDIO, check: false }
      ],
      javascript: function (block) {
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

        // var LEAP_BLOCK = 'When Hands';
        // var HAND_COUNT = 'hand_count';
        // quando_editor.defineLeapMotion({
        //     name: LEAP_BLOCK, next: false, previous: false,
        //     interface: [
        //         { name: HAND_COUNT, title: ' = ', number: 1 },
        //         { statement: STATEMENT }
        //     ],
        //     javascript: function (block) {
        //         var statement = quando_editor.getStatement(block, STATEMENT);
        //         var result = "quando.hands(" + quando_editor.getNumber(block, HAND_COUNT) + ",\n"
        //             + " function() {\n"
        //             + statement + "});";
        //         return result;
        //     }
        // });
        // var HANDED_BLOCK = 'When Hand ';
        // var HAND_LEFT = 'Left';
        // var HAND_RIGHT = 'Right';
        // quando_editor.defineLeapMotion({
        //     name: HANDED_BLOCK, next: false, previous: false,
        //     interface: [
        //         { name: HAND_LEFT, check: false },
        //         { name: HAND_RIGHT, check: false },
        //         { statement: STATEMENT }
        //     ],
        //     javascript: function (block) {
        //         var statement = quando_editor.getStatement(block, STATEMENT);
        //         var result = "quando.handed("
        //             + quando_editor.getCheck(block, HAND_LEFT) + ",\n"
        //             + quando_editor.getCheck(block, HAND_RIGHT) + ",\n"
        //             + " function() {\n"
        //             + statement + "});";
        //         return result;
        //     }
        // });

    var DIG_COLOUR = 0
    var WHEN_VITRINE_BLOCK = 'When Display Case'
    var WHEN_VITRINE_TEXT = 'title'
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
      javascript: function (block) {
        var title = quando_editor.getText(block, WHEN_VITRINE_TEXT)
        var statement = quando_editor.getStatement(block, STATEMENT)
        var result = `quando.vitrine("${block.id}", function() {\n` +
                    `quando.title("${title}");\n` +
                    `${statement}});\n`
        return result
      }
    })

    function _update_menus (ev, block_id, text = false) {
      var topBlocks = Blockly.mainWorkspace.getAllBlocks()
      var matchBlock = [PREFIX + LABEL_TO_BLOCK, PREFIX + SHOW_DISPLAY]
      for (var checkblock of topBlocks) {
        if (matchBlock.includes(checkblock.type)) {
// console.log('change:'+checkblock.type)
          var menuid = quando_editor.getMenu(checkblock, LABEL_TO_MENU)
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

    Blockly.mainWorkspace.addChangeListener(function (ev) {
      var workspace = Blockly.Workspace.getById(ev.workspaceId)
      var block = workspace.getBlockById(ev.blockId)
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
    var _label_menu = function () {
      var topBlocks = Blockly.mainWorkspace.getAllBlocks()
      var choices = [['-----', 0]]
      for (var block of topBlocks) {
        if (block.type == PREFIX + WHEN_VITRINE_BLOCK) {
          var text = quando_editor.getText(block, 'title')
          choices.push([text, block.id])
        }
      }
      return choices
    }
    var LABEL_TO_MENU = 'to'
    var _label_javascript = function (block) {
      var menuid = quando_editor.getMenu(block, LABEL_TO_MENU)
            // find when block on id, then get it's title
      var whenblock = Blockly.mainWorkspace.getBlockById(menuid)
      var title = quando_editor.getText(whenblock, WHEN_VITRINE_TEXT)
      var result = `quando.addLabel("${menuid}", "${title}");\n`
      return result
    }
    var LABEL_TO_BLOCK = 'Label to'
    var LABEL_TEXT = 'text'
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

    var SHOW_DISPLAY = 'Show Display'
    var SHOW_DISPLAY_MENU = 'show display menu'
    quando_editor.defineDisplay({
      name: SHOW_DISPLAY,
      interface: [{
        name: LABEL_TO_MENU,
        title: '',
        menu: _label_menu
      }],
      javascript: function (block) {
        var menuid = quando_editor.getMenu(block, LABEL_TO_MENU)
                // find when block on id, then get it's title
        var whenblock = Blockly.mainWorkspace.getBlockById(menuid)
        var result = `quando.showVitrine("${menuid}");\n`
        return result
      }
    })

    var WHEN_LABEL_BLOCK = 'When Label'
    var WHEN_LABEL_TEXT = 'When label text'
    quando_editor.defineDisplay({
      name: WHEN_LABEL_BLOCK,
      interface: [
                { name: WHEN_LABEL_TEXT, title: '', text: '**Put label text here**' },
                { statement: STATEMENT }
      ],
      javascript: function (block) {
        var text = quando_editor.getText(block, WHEN_LABEL_TEXT)
        var statement = quando_editor.getStatement(block, STATEMENT)
        var result = `quando.addLabelStatement("${text}", function() {\n${statement}});\n`
        return result
      }
    })

    var STYLE_BLOCK = 'Style'
    var STYLE_MENU = 'style'
    var DIV_MENU = 'div'
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
      javascript: function (block) {
        var result = ''
        var method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        var div = quando_editor.getMenu(block, DIV_MENU)
        switch (div) {
          case 'Title': div = '#quando_title'
            break
          case 'Text': div = '#quando_text'
            break
          case 'Labels': div = '.quando_label'
            break
        }
        var style = quando_editor.getMenu(block, STYLE_MENU)
        var value = quando_editor.getColour(block, COLOUR)
        if (style == 'Font Colour') {
          style = 'color'
        } else {
          style = 'background-color ' // not actually javascript?!
                    // so backgroundColor won't work - has to be CSS interpreted...'
          var bigint = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value)
          var r = parseInt(bigint[1], 16)
          var g = parseInt(bigint[2], 16)
          var b = parseInt(bigint[3], 16)
          value = `rgba(${r}, ${g}, ${b}, 0.6)`
          if (div == '.quando_label') { // Need to put in the transition opacity - I think this is working now
            result += `quando.${method}('${div}.focus', '${style}', 'rgba(${r}, ${g}, ${b}, 1)');\n`
          }
        }
        result += `quando.${method}('${div}', '${style}', '${value}');\n`
        return result
      }
    })

    var FONT_SIZE_BLOCK = 'Font Size'
    var FONT_SIZE = 'font size'
    quando_editor.defineStyle({
      name: FONT_SIZE_BLOCK,
      interface: [
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
                { name: FONT_SIZE, title: '', number: 100 }, {title: '+ characters across screen'}
      ],
      javascript: function (block) {
        var method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        var div = quando_editor.getMenu(block, DIV_MENU)
        switch (div) {
          case 'Title': div = '#quando_title'
            break
          case 'Text': div = '#quando_text'
            break
          case 'Labels': div = '.quando_label'
            break
        }
        var value = 100 / quando_editor.getNumber(block, FONT_SIZE)
        result = `quando.${method}('${div}', 'font-size', '${value}vw');\n`
        return result
      }
    })

    var FONT_TYPE_BLOCK = 'Font'
    var FONT_NAME_MENU = 'font name'
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
      javascript: function (block) {
        var result = ''
        var method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        var div = quando_editor.getMenu(block, DIV_MENU)
        switch (div) {
          case 'Title': div = '#quando_title'
            break
          case 'Text': div = '#quando_text'
            break
          case 'Labels': div = '.quando_label'
            break
        }
        var font_name = quando_editor.getMenu(block, FONT_NAME_MENU)
        result += `quando.${method}('${div}', 'font-family', '${font_name}', ',');\n`
        return result
      }
    })

        // var EXPLORATION_RULE = 'Exploration Rule';
        // quando_editor.defineBlock({
        //     name: EXPLORATION_RULE, title:'When', category: 'extras', colour: '#55bb55',
        //     interface: [
        //         { name: 'title', title:'', text: ''},
        //         { name: 'text', title: '', text: ''}
        //     ],
        //     extras: [
        //         { name: 'extra'},
        //         { name: 'text3', title: '', text: 'default'},
        //         { statement: STATEMENT }
        //     ]
        // });

        // var EXPLORATION_ACTION = 'Exploration Action';
        // quando_editor.defineBlock({
        //     name: EXPLORATION_ACTION, title:'Do', category: 'extras', colour: '#5555bb',
        //     interface: [
        //         { name: 'title', title:'', text: ''},
        //         { name: 'text', title: '', text: ''}
        //     ],
        //     extras:[
        //         {name: 'test'}
        //         ],
        // });

        // quando_editor.defineDevice({
        //     name: 'When Device',
        //     interface: [
        //         { name: 'name', title: '', text: 'Box' },
        //         { statement: STATEMENT }
        //     ],
        //     javascript: function (block) {
        //         var statement = quando_editor.getStatement(block, STATEMENT);
        //         var result = "quando." + fn + "("
        //             + "function() {\n"
        //             + statement
        //             + "}"
        //             + _getOnContained(block, [WHEN_VITRINE_BLOCK], "", ", false")
        //             + ");\n";
        //         return result;
        //     }
        // });

    var MICROBIT_GESTURE_MENU = 'MicroBit Gesture'
    quando_editor.defineDevice({
      name: 'When micro:bit',
      interface: [
                { menu: ['Up', 'Down', 'Forward', 'Backward', 'Left', 'Right', 'A Button', 'B Button'], name: MICROBIT_GESTURE_MENU, title: '' },
                { statement: STATEMENT }
      ],
      javascript: function (block) {
        var fn = ''
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
        var statement = quando_editor.getStatement(block, STATEMENT)
        var result = 'quando.' + fn + '(' +
                    'function() {\n' +
                    statement +
                    '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    var WHEN_ROLL_MIN = 'Min'
    var WHEN_ROLL_MAX = 'Max'
    quando_editor.defineDevice({
      name: 'When Roll between ',
      interface: [
                { name: WHEN_ROLL_MIN, title: '', number: '-90' },
                { name: WHEN_ROLL_MAX, title: ' and ', number: '90' },
                {title: ' degrees'},
                { statement: STATEMENT }
      ],
      javascript: function (block) {
        var min = quando_editor.getNumber(block, WHEN_ROLL_MIN)
        var max = quando_editor.getNumber(block, WHEN_ROLL_MAX)
        var statement = quando_editor.getStatement(block, STATEMENT)
        var result = 'quando.ubitRoll(' + min + ',' + max + ',' +
                    'function() {\n' +
                    statement +
                    '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    var WHEN_HEADING_MIN = 'Min'
    var WHEN_HEADING_MAX = 'Max'
    quando_editor.defineDevice({
      name: 'When heading between ',
      interface: [
                { name: WHEN_HEADING_MIN, title: '', number: '0' },
                { name: WHEN_HEADING_MAX, title: ' and ', number: '359' },
                {title: ' degrees'},
                { statement: STATEMENT }
      ],
      javascript: function (block) {
        var min = quando_editor.getNumber(block, WHEN_HEADING_MIN)
        var max = quando_editor.getNumber(block, WHEN_HEADING_MAX)
        var statement = quando_editor.getStatement(block, STATEMENT)
        var result = 'quando.ubitHeading(' + min + ',' + max + ',' +
                    'function() {\n' +
                    statement +
                    '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    var WHEN_IDLE = 'When Idle for'
    var ACTIVE_STATEMENT = 'ACTIVE_STATEMENT'
    quando_editor.defineTime({
      name: WHEN_IDLE,
      next: false,
      previous: false,
      interface: [
                { name: DURATION, title: '', number: '1' }, MENU_UNITS_MINS,
                { statement: STATEMENT },
                { row: 'Then When Active', statement: ACTIVE_STATEMENT }
      ],
      javascript: function (block) {
        var seconds = quando_editor.getNumber(block, DURATION) * 1
        if (quando_editor.getMenu(block, MENU_UNITS_MINS.name) === 'Minutes') {
          seconds *= 60
        }
        var statement = quando_editor.getStatement(block, STATEMENT)
        var active_statement = quando_editor.getStatement(block, ACTIVE_STATEMENT)
        var result = 'quando.idle(' +
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
      javascript: function (block) {
        var frequency = quando_editor.getNumber(block, FREQUENCY)
        var seconds = 1
        switch (quando_editor.getMenu(block, UNITS_MENU)) {
          case 'Minute': seconds = 60
            break
          case 'Hour': seconds = 60 * 60
            break
          case 'Day': seconds = 60 * 60 * 24
            break
        };
        var time = seconds / frequency
        var statement = quando_editor.getStatement(block, STATEMENT)
        var result = 'quando.every(' +
                    time +
                    ', function() {\n' +
                    statement +
                    '}' +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })

    var CONTENT_POSITION = 'Position'
    var DIRECTION_MENU = 'Direction'
    var POSITION_SIZE = 'Position Size'
    quando_editor.defineClient({
      name: CONTENT_POSITION,
      interface: [
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
                { name: POSITION_SIZE, title: '', number: 0 }, {title: '%'},
                { menu: ['top', 'bottom', 'left', 'right'], name: DIRECTION_MENU, title: 'from' }
      ],
      javascript: function (block) {
        var method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        var div = quando_editor.getMenu(block, DIV_MENU)
        switch (div) {
          case 'Title': div = '#quando_title'
            break
          case 'Text': div = '#quando_text'
            break
          case 'Labels': div = '#quando_labels'
            break
        }
        var direction = quando_editor.getMenu(block, DIRECTION_MENU)
        var value = quando_editor.getNumber(block, POSITION_SIZE)
        result = `quando.${method}('${div}', '${direction}', '${value}%');\n`
        if (direction == 'bottom') {
          result += `quando.${method}('${div}', 'top', 'unset');\n` // override the set top 0px
        } else if (direction == 'right') {
          result += `quando.${method}('${div}', 'left', 'unset');\n` // override the set left
        }
        return result
      }
    })

    var CONTENT_SIZE = 'Size'
    var DIMENSION_MENU = 'Dimension'
    quando_editor.defineClient({
      name: CONTENT_SIZE,
      interface: [
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
                { name: POSITION_SIZE, title: '', number: 100 }, {title: '%'},
                { menu: ['height', 'width'], name: DIMENSION_MENU, title: 'of' }
      ],
      javascript: function (block) {
        var method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        var div = quando_editor.getMenu(block, DIV_MENU)
        switch (div) {
          case 'Title': div = '#quando_title'
            break
          case 'Text': div = '#quando_text'
            break
          case 'Labels': div = '#quando_labels'
            break
        }
        var dimension = quando_editor.getMenu(block, DIMENSION_MENU)
        var value = quando_editor.getNumber(block, POSITION_SIZE)
        result = `quando.${method}('${div}', '${dimension}', '${value}%');\n`
        return result
      }
    })

    var PROJECTION_ACTION = 'Projection Action'
    quando_editor.defineDisplay({
      name: PROJECTION_ACTION,
      title: '',
      interface: [
                { name: 'front_rear', menu: ['Normal', 'Rear'], title: '' },
                { title: 'Projection'}
      ],
      javascript: function (block) {
        var method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        var front_rear = quando_editor.getMenu(block, 'front_rear')
        var scale = '1,1'
        if (front_rear == 'Rear') {
          scale = '-1,1'
        }
        result = `quando.${method}('html', 'transform', 'scale(${scale})');\n`
        return result
      }
    })

    var CHANGE_WITH_BLOCK = 'When Change'
    var CHANGE_VALUE = 'Value'
    var CHANGE_VARIABLE = 'Variable'
    var CURSOR_LEFT_RIGHT = '\u21D4 Cursor'
    var CURSOR_UP_DOWN = '\u21D5 Cursor'
    var UBIT_ROLL = 'micro:bit Roll'
    var UBIT_PITCH = 'micro:bit Pitch'
    var CHECK_INVERTED = 'Inverted'
    var DAMP_VALUE = 'Dampen'
    quando_editor.defineDevice({
      name: CHANGE_WITH_BLOCK,
      title: '',
      interface: [
                { name: CHANGE_VALUE, menu: [CURSOR_LEFT_RIGHT, CURSOR_UP_DOWN, 'VR Zoom'], title: '' },
                { name: CHANGE_VARIABLE, title: ' changes with ', menu: [UBIT_ROLL, UBIT_PITCH, 'Leap Height']}
      ],
      extras: [
                    {name: CHECK_INVERTED, check: false},
                    {name: DAMP_VALUE, number: '0.25'}
      ],
      javascript: function (block) {
        var value = quando_editor.getMenu(block, CHANGE_VALUE)
        switch (value) {
          case CURSOR_UP_DOWN: value = 'cursor_up_down'
            break
          case CURSOR_LEFT_RIGHT: value = 'cursor_left_right'
            break
        }
        var variable = quando_editor.getMenu(block, CHANGE_VARIABLE)
        switch (variable) {
          case UBIT_ROLL: variable = 'handleUbitRoll'
            break
          case UBIT_PITCH: variable = 'handleUbitPitch'
            break
        }
        var extras = {}
        if (quando_editor.getCheck(block, CHECK_INVERTED)) {
          extras['inverted'] = true
        }
        extras.dampen = quando_editor.getNumber(block, DAMP_VALUE)
        if (!extras.dampen) {
          delete extras.dampen
        }
        extras = JSON.stringify(extras)
        var result = `quando.${variable}(quando.${value}, ${extras}` +
                    _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
                    ');\n'
        return result
      }
    })
  }
})()

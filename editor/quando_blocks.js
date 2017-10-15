(function () {
    var self = this["quando_blocks"] = {};
    var PREFIX = 'quando_'; // TODO share with quando_editor
    self.CONFIG = {
        DISPLAY_COLOUR: '#ee9955',
        MEDIA_COLOUR: '#55cc55',
        STYLE_COLOUR: '#cc99cc',
        CLIENT_COLOUR: '#559999',
        TIME_COLOUR: '#ee6666',
        LEAP_MOTION_COLOUR: '#999999',
        DEVICE_COLOUR: '#bb66aa',
        BLOCKLY_SATURATION: 0.25, // default for hue only colour - probably not used anymore - see http://colorizer.org/
        BLOCKLY_VALUE: 0.85, // ditto
    };

    var ajax_get = function (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            callback(xhr.responseText);
        };
        xhr.open("GET", url, true);
        xhr.send(null);
    };


    self.addBlocks = function (quando_editor) {

        var STATEMENT = 'STATEMENT';
        var DURATION = 'DURATION';
        var MENU_UNITS_MINS = { name: 'Units_mins', title: '', menu: ['Seconds', 'Minutes'] };
        var MENU_UNITS_HOURS = { name: 'Units_hours', title: '', menu: ['Seconds', 'Minutes', 'Hours'] };
        var FREQUENCY = 'FREQUENCY';
        var UNITS_MENU = 'UNITS_MENU';

        quando_editor.defineTime({
            name: 'Check',
            interface: [
                { name: FREQUENCY, title: '', number: 1 },
                {
                    menu: ['Second', 'Minute', 'Hour', 'Day'],
                    name: UNITS_MENU, title: 'times per'
                },
                { statement: STATEMENT }
            ],
            javascript: function (block) {
                var frequency = quando_editor.getNumber(block, FREQUENCY);
                var seconds = 1;
                switch (quando_editor.getMenu(block, UNITS_MENU)) {
                    case 'Minute': seconds = 60;
                        break;
                    case 'Hour': seconds = 60 * 60;
                        break;
                    case 'Day': seconds = 60 * 60 * 24;
                        break;
                };
                var time = seconds / frequency;
                var statement = quando_editor.getStatement(block, STATEMENT);
                var result = "quando.every("
                    + time
                    + ", function() {\n"
                    + statement
                    + "}"
                    + _getOnContained(block, [WHEN_VITRINE_BLOCK], "", ", false")
                    + ");\n";
                return result;
            }
        });

        var EVERY_BLOCK = 'Every';
        quando_editor.defineTime({
            name: EVERY_BLOCK,
            interface: [
                { name: DURATION, title: '', number: '1' }, MENU_UNITS_HOURS,
                { statement: STATEMENT }
            ],
            javascript: function (block) {
                var seconds = quando_editor.getNumber(block, DURATION) * 1;
                if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Minutes') {
                    seconds *= 60;
                }
                if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Hours') {
                    seconds *= 60*60;
                }
                var statement = quando_editor.getStatement(block, STATEMENT);
                var result = "quando.every("
                    + seconds
                    + ", function() {\n" + statement + "}"
                    + _getOnContained(block, [WHEN_VITRINE_BLOCK], "", ", false")
                    + ");\n";
                return result;
            }
        });

        quando_editor.defineTime({
            name: 'After',
            interface: [
                { name: DURATION, title: '', number: '1' }, MENU_UNITS_HOURS,
                { statement: STATEMENT }
            ],
            javascript: function (block) {
                var seconds = quando_editor.getNumber(block, DURATION) * 1;
                if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Minutes') {
                    seconds *= 60;
                }
                if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Hours') {
                    seconds *= 60*60;
                }
                var statement = quando_editor.getStatement(block, STATEMENT);
                var result = "quando.after("
                    + seconds
                    + ", function() {\n"
                    + statement
                    + "}"
                    + _getOnContained(block, [WHEN_VITRINE_BLOCK], "", ", false")
                    + ");\n";
                return result;
            }
        });

        var ID_GREETING = "Greeting";
        quando_editor.defineMedia({
            name: 'Show "', title: 'Show Text',
            interface: [{ name: ID_GREETING, title: '"', text: '.type your text here..' }, { title: '"' }],
            javascript: function (block) {
                return 'quando.text("' + quando_editor.getText(block, ID_GREETING) + '");\n';
            }
        });

        let SHOW_TITLE = "Show Title";
        quando_editor.defineMedia({
            name: 'Show Title "',
            interface: [{ name: SHOW_TITLE, title:'', text: '.type your title here..' }, { title: '"' }],
            javascript: function (block) {
                return 'quando.title("' + quando_editor.getText(block, SHOW_TITLE) + '");\n';
            }
        });

        var _getOnContained = function(block, container, contained, otherwise) {
            let result = otherwise;
            if (quando_editor.getParent(block, container)) {
                result = contained;
            }
            return result;
        }
        var _getStyleOnContained = function(block, container) {
            return 'set' + _getOnContained(block, container, "Display", "Default") + 'Style';
        }

        let COLOUR = 'colour';
        quando_editor.defineStyle({
            name: 'Background', title: 'Background Display Colour',
            interface: [
                { name: COLOUR, title: '', colour: '#ff0000' }
            ],
            javascript: function (block) {
                let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE]);
                let colour = quando_editor.getColour(block, COLOUR);
                return `quando.${method}('#quando_image', 'background-color', '${colour}');\n`;
            }
        });

        var IMAGE = 'Images';
        var FILE_IMAGE = {name: IMAGE, title:'', file:'images'};
        quando_editor.defineMedia({
            name: 'Display', title: 'Show Image',
            interface: [ FILE_IMAGE ],
            javascript: function (block) {
                let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE]);
                let image = quando_editor.getFile(block, IMAGE);
                return `quando.image_update_video("/client/media/${image}");\n`
                    + `quando.${method}('#quando_image', 'background-image', 'url("/client/media/${image}")');\n`;
            }
        });
        var VIDEO = 'Video';
        var MEDIA_LOOP_MENU= 'MEDIA_LOOP_MENU';
        var CHECK_STOP_WITH_DISPLAY = '   With display';
        var FILE_VIDEO = { name: VIDEO, title: '', file: 'video' };
        quando_editor.defineMedia({
            name: 'Show Video', title: 'Play',
            interface: [
                { name: MEDIA_LOOP_MENU, title:'', menu:['Forever', 'Once'] },
                { title: 'Video' },
                FILE_VIDEO],
            // extras: [
            //     {title: CHECK_STOP_WITH_DISPLAY, check:true},
            // ],
            javascript: function (block) {
                var video_url = quando_editor.getFile(block, VIDEO);
                var loop = (quando_editor.getMenu(block, MEDIA_LOOP_MENU) == 'Forever');
                var result = "quando.video('/client/media/" + video_url + "'" + ", " + loop + ");\n";
                return result;
            }
        });
        var AUDIO = 'Audio';
        var FILE_AUDIO = {name: AUDIO, title:'', file:'audio'};
        quando_editor.defineMedia({
            name: 'Play',
            interface: [
                { name: MEDIA_LOOP_MENU, title:'', menu:['Forever', 'Once'] },
                { title: 'Audio' },
                FILE_AUDIO ],
            // extras: [
            //     {title: CHECK_STOP_WITH_DISPLAY, check:true  },
            // ],
            javascript: function(block) {
                var _url = quando_editor.getFile(block, AUDIO);
                var loop = (quando_editor.getMenu(block, MEDIA_LOOP_MENU) == 'Forever');
                var result = "quando.audio('/client/media/" + _url + "'" + ", " + loop + ");\n";
                return result;
            }
        });
        var CHECK_TEXT = ' Text';
        var CHECK_TITLE = ' Title';
        var CHECK_IMAGE = ' Image';
        var CHECK_VIDEO = ' Video';
        var CHECK_AUDIO = ' Audio';
        var CLEAR = 'Clear';
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
                result = "";
                if (quando_editor.getCheck(block, CHECK_TEXT)) {
                    result += 'quando.text();\n';
                }
                if (quando_editor.getCheck(block, CHECK_TITLE)) {
                    result += 'quando.title();\n';
                }
                if (quando_editor.getCheck(block, CHECK_IMAGE)) {
                    result += `quando.setDisplayStyle('#quando_image', 'background-image', 'url("/client/transparent.png")');\n`;
                }
                if (quando_editor.getCheck(block, CHECK_VIDEO)) {
                    result += 'quando.clear_video();\n';
                }
                if (quando_editor.getCheck(block, CHECK_AUDIO)) {
                    result += 'quando.clear_audio();\n';
                }
                return result;
            }
        });

        var LEAP_BLOCK = 'When Hands';
        var HAND_COUNT = 'hand_count';
        quando_editor.defineLeapMotion({
            name: LEAP_BLOCK, next: false, previous: false,
            interface: [
                { name: HAND_COUNT, title: ' = ', number: 1 },
                { statement: STATEMENT }
            ],
            javascript: function (block) {
                var statement = quando_editor.getStatement(block, STATEMENT);
                var result = "quando.hands(" + quando_editor.getNumber(block, HAND_COUNT) + ",\n"
                    + " function() {\n"
                    + statement + "});";
                return result;
            }
        });
        var HANDED_BLOCK = 'When Hand ';
        var HAND_LEFT = 'Left';
        var HAND_RIGHT = 'Right';
        quando_editor.defineLeapMotion({
            name: HANDED_BLOCK, next: false, previous: false,
            interface: [
                { name: HAND_LEFT, check: false },
                { name: HAND_RIGHT, check: false },
                { statement: STATEMENT }
            ],
            javascript: function (block) {
                var statement = quando_editor.getStatement(block, STATEMENT);
                var result = "quando.handed("
                    + quando_editor.getCheck(block, HAND_LEFT) + ",\n"
                    + quando_editor.getCheck(block, HAND_RIGHT) + ",\n"
                    + " function() {\n"
                    + statement + "});";
                return result;
            }
        });

        let DIG_COLOUR = 0;
        let WHEN_VITRINE_BLOCK = 'When Display Case';
        let WHEN_VITRINE_TEXT = 'title';
        quando_editor.defineDisplay({
            name: WHEN_VITRINE_BLOCK, title: 'When Display', next: false, previous: false,
            interface: [{
                name: WHEN_VITRINE_TEXT, title: '', text: 'Title and label',
            },
            { statement: STATEMENT }
            ],
            javascript: (block) => {
                let title = quando_editor.getText(block, WHEN_VITRINE_TEXT);
                var statement = quando_editor.getStatement(block, STATEMENT);
                var result = `quando.vitrine("${block.id}", function() {\n`
                    + `quando.title("${title}");\n`
                    + `${statement}});\n`;
                return result;
            }
        });

        // TODO refactor
        Blockly.mainWorkspace.addChangeListener(function (ev) {
            let workspace = Blockly.Workspace.getById(ev.workspaceId);
            let block = workspace.getBlockById(ev.blockId);
            let topBlocks = Blockly.mainWorkspace.getAllBlocks();
            if (ev.type == Blockly.Events.CHANGE) {
                if (block.type == PREFIX + WHEN_VITRINE_BLOCK) {
                    for (var checkblock of topBlocks) {
                        if ((checkblock.type == PREFIX + LABEL_TO_BLOCK)
                            || (checkblock.type == PREFIX + LABEL_BLOCK)) {
                            let menuid = quando_editor.getMenu(checkblock, LABEL_TO_MENU);
                            if (menuid == block.id) {
                                    quando_editor.setMenuText(checkblock, LABEL_TO_MENU, ev.newValue);
                            }
                        }
                    }
                }
                quando_editor.updateExtras(block); // Any Extras menu will be updated
            } else if (ev.type == Blockly.Events.CREATE) {
                for (var checkblock of topBlocks) {
                    if ((checkblock.type == PREFIX + LABEL_TO_BLOCK)
                        || (checkblock.type == PREFIX + LABEL_BLOCK)) {
                        let menuid = quando_editor.getMenu(checkblock, LABEL_TO_MENU);
                        if (menuid == block.id) {
                            quando_editor.setMenuText(checkblock, LABEL_TO_MENU,
                                quando_editor.getText(block, WHEN_VITRINE_TEXT));
                        }
                    }
                }
                quando_editor.updateExtras(block); // Any Extras menu will be updated
            } else if (ev.type == Blockly.Events.DELETE) {
                for (var checkblock of topBlocks) {
                    if ((checkblock.type == PREFIX + LABEL_TO_BLOCK)
                        || (checkblock.type == PREFIX + LABEL_BLOCK)) {
                        let menuid = quando_editor.getMenu(checkblock, LABEL_TO_MENU);
                        if (menuid == ev.ids[0]) {
                            quando_editor.resetMenu(checkblock, LABEL_TO_MENU);
                        }
                    }
                }
            }
        });

        // Build the drop down list of Vitrines
        let _label_menu = function () {
            let topBlocks = Blockly.mainWorkspace.getAllBlocks();
            let choices = [['-----', 0]];
            for (var block of topBlocks) {
                if (block.type == PREFIX + WHEN_VITRINE_BLOCK) {
                    let text = quando_editor.getText(block, 'title');
                    choices.push([text, block.id]);
                }
            }
            return choices;
        }
        let LABEL_BLOCK = 'Label';
        let LABEL_TO_MENU = 'to';
        let _label_javascript = function (block) {
            let menuid = quando_editor.getMenu(block, LABEL_TO_MENU);
            // find when block on id, then get it's title
            let whenblock = Blockly.mainWorkspace.getBlockById(menuid);
            let title = quando_editor.getText(whenblock, WHEN_VITRINE_TEXT);
            var result = `quando.addLabel("${menuid}", "${title}");\n`;
            return result;
        }
        let LABEL_TEXT = 'text';
        let LABEL_TO_BLOCK = 'Label to';
        quando_editor.defineDisplay({
            // TODO must be in a vitrine...?
            name: LABEL_TO_BLOCK, title: 'Label',
            interface: [
                {
                    name: LABEL_TO_MENU,
                    menu: _label_menu
                }
            ],
            javascript: _label_javascript,
        });
        let WHEN_LABEL_BLOCK = 'When Label';
        let WHEN_LABEL_TEXT = 'When label text';
        quando_editor.defineDisplay({
            name: WHEN_LABEL_BLOCK,
            interface: [
                { name: WHEN_LABEL_TEXT, title:'', text:'**Put label text here**' },
                { statement: STATEMENT }
            ],
            javascript: (block) => {
                let text = quando_editor.getText(block, WHEN_LABEL_TEXT);
                let statement = quando_editor.getStatement(block, STATEMENT);
                let result = `quando.addLabelStatement("${text}", function() {\n${statement}});\n`;
                return result;
            }
        });

        let SHOW_DISPLAY = 'Show Display';
        let SHOW_DISPLAY_MENU = 'show display menu';
        quando_editor.defineDisplay({
            name: SHOW_DISPLAY,
            interface: [{
                    name: SHOW_DISPLAY_MENU, title:'',
                    menu: _label_menu
                }],
            javascript: (block) => {
                let menuid = quando_editor.getMenu(block, SHOW_DISPLAY_MENU);
                // find when block on id, then get it's title
                let whenblock = Blockly.mainWorkspace.getBlockById(menuid);
                var result = `quando.showVitrine("${menuid}");\n`;
                return result;                
            }
        });

        let STYLE_BLOCK = 'Style';
        let STYLE_MENU = 'style';
        let DIV_MENU = 'div';
        quando_editor.defineStyle({
            name: STYLE_BLOCK, title: '',
            interface: [
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
                {
                    menu: ['Font Colour', 'Background Colour'],
                    name: STYLE_MENU, title: ''
                },
                { name: COLOUR, title: '', colour: '#ff0000' },
            ],
            javascript: (block) => {
                let result ="";
                let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE]);
                let div = quando_editor.getMenu(block, DIV_MENU);
                switch (div) {
                    case 'Title': div = '#quando_title';
                        break;
                    case 'Text': div = '#quando_text';
                        break;
                    case 'Labels': div = '.quando_label';
                        break;
                }
                let style = quando_editor.getMenu(block, STYLE_MENU);
                let value = quando_editor.getColour(block, COLOUR);
                if (style == 'Font Colour') {
                    style = 'color';
                } else {
                    style = 'background-color '; // not actually javascript?!
                    // so backgroundColor won't work - has to be CSS interpreted...'
                    let bigint = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
                    let r = parseInt(bigint[1], 16);
                    let g = parseInt(bigint[2], 16);
                    let b = parseInt(bigint[3], 16);
                    value = `rgba(${r}, ${g}, ${b}, 0.6)`;
                    if (div == '.quando_label') { // Need to put in the transition opacity - I think this is working now
                        result += `quando.${method}('${div}.focus', '${style}', 'rgba(${r}, ${g}, ${b}, 1)');\n`;
                    }
                }
                result += `quando.${method}('${div}', '${style}', '${value}');\n`;
                return result;
            },
        });

        let FONT_SIZE_BLOCK = 'Font Size';
        let FONT_SIZE = 'font size';
        quando_editor.defineStyle({
            name: FONT_SIZE_BLOCK,
            interface: [
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
                { name: FONT_SIZE, title: '', number: 100 }, {title: '+ characters across screen'}
            ],
            javascript: (block) => {
                let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE]);
                let div = quando_editor.getMenu(block, DIV_MENU);
                switch (div) {
                    case 'Title': div = '#quando_title';
                        break;
                    case 'Text': div = '#quando_text';
                        break;
                    case 'Labels': div = '.quando_label';
                        break;
                }
                let value = 100/quando_editor.getNumber(block, FONT_SIZE);
                result = `quando.${method}('${div}', 'font-size', '${value}vw');\n`;
                return result;
            },
        });

        let FONT_TYPE_BLOCK = 'Font';
        let FONT_NAME_MENU = 'font name';
        quando_editor.defineStyle({
            name: FONT_TYPE_BLOCK,
            interface: [
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
                {
                    menu: ['sans-serif', 'Arial', 'Helvetica', 'Arial Black', 'Gadget', 'Comic Sans MS', 'cursive',
                        'Impact', 'Charcoal', "Lucida Sans Unicode", "Lucida Grande", 'Tahoma', 'Geneva',
                        "Trebuchet MS", 'Verdana',
                        'serif', 'Georgia',"Palatino Linotype", "Book Antiqua", 'Palatino',
                        "Times New Roman", 'Times', 
                        'monospace', "Courier New", 'Courier',
                        "Lucida Console", 'Monaco', ['duMMy', 'XXX']],
                    name: FONT_NAME_MENU, title: ''
                }
            ],
            javascript: (block) => {
                let result ="";
                let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE]);
                let div = quando_editor.getMenu(block, DIV_MENU);
                switch (div) {
                    case 'Title': div = '#quando_title';
                        break;
                    case 'Text': div = '#quando_text';
                        break;
                    case 'Labels': div = '.quando_label';
                        break;
                }
                let font_name = quando_editor.getMenu(block, FONT_NAME_MENU);
                result += `quando.${method}('${div}', 'font-family', '${font_name}', ',');\n`;
                return result;
            },
        });

        let EXPLORATION_RULE = 'Exploration Rule';
        quando_editor.defineBlock({
            name: EXPLORATION_RULE, title:'When', category: 'extras', colour: '#55bb55',
            interface: [
                { name: 'title', title:'', text: ''},
                { name: 'text', title: '', text: ''}
            ],
            extras: [
                { name: 'extra'},
                { name: 'text3', title: '', text: 'default'},
                { statement: STATEMENT }
            ]
        });

        let EXPLORATION_ACTION = 'Exploration Action';
        quando_editor.defineBlock({
            name: EXPLORATION_ACTION, title:'Do', category: 'extras', colour: '#5555bb',
            interface: [
                { name: 'title', title:'', text: ''},
                { name: 'text', title: '', text: ''}
            ],
            extras:[
                {name: 'test'}
                ],
        });
        
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
        
        let MICROBIT_GESTURE_MENU = "MicroBit Gesture";
        quando_editor.defineDevice({
            name: 'When micro:bit',
            interface: [
                { menu: ['Up', 'Down', 'Forward', 'Backward', 'Left', 'Right', 'A Button', 'B Button'], name: MICROBIT_GESTURE_MENU, title: '' },
                { statement: STATEMENT }
            ],
            javascript: function (block) {
                let fn = '';
                switch (quando_editor.getMenu(block, MICROBIT_GESTURE_MENU)) {
                    case 'Up':
                        fn = "ubitUp";
                        break;
                    case 'Down':
                        fn = "ubitDown";
                        break;
                    case 'Forward':
                        fn = "ubitForward";
                        break;
                    case 'Backward':
                        fn = "ubitBackward";
                        break;
                    case 'Left':
                        fn = "ubitLeft";
                        break;
                    case 'Right':
                        fn = "ubitRight";
                        break;
                    case 'A Button':
                        fn = "ubitA";
                        break;
                    case 'B Button':
                        fn = "ubitB";
                        break;
                };
                var statement = quando_editor.getStatement(block, STATEMENT);
                var result = "quando." + fn + "("
                    + "function() {\n"
                    + statement
                    + "}"
                    + _getOnContained(block, [WHEN_VITRINE_BLOCK], "", ", false")
                    + ");\n";
                return result;
            }
        });

        let WHEN_HEADING_MIN = "Min";
        let WHEN_HEADING_MAX = "Max";
        quando_editor.defineDevice({
            name: 'When heading between ',
            interface: [
                { name: WHEN_HEADING_MIN, title: '', number: '0' },
                { name: WHEN_HEADING_MAX, title: ' and ', number: '359' },
                {title: ' degrees'},
                { statement: STATEMENT }
            ],
            javascript: function (block) {
                let min = quando_editor.getNumber(block, WHEN_HEADING_MIN);
                let max = quando_editor.getNumber(block, WHEN_HEADING_MAX);
                var statement = quando_editor.getStatement(block, STATEMENT);
                var result = "quando.ubitHeading(" + min + "," + max + ","
                    + "function() {\n"
                    + statement
                    + "}"
                    + _getOnContained(block, [WHEN_VITRINE_BLOCK], "", ", false")
                    + ");\n";
                return result;
            }
        });
        
        let WHEN_IDLE = 'When Idle for';
        let ACTIVE_STATEMENT = 'ACTIVE_STATEMENT'
        quando_editor.defineTime({
            name: WHEN_IDLE, next: false, previous: false,
            interface: [
                { name: DURATION, title: '', number: '1' }, MENU_UNITS_MINS,
                { statement: STATEMENT },
                { row: 'Then When Active', statement: ACTIVE_STATEMENT }
            ],
            javascript: (block) => {
                var seconds = quando_editor.getNumber(block, DURATION) * 1;
                if (quando_editor.getMenu(block, MENU_UNITS_MINS.name) === 'Minutes') {
                    seconds *= 60;
                }
                var statement = quando_editor.getStatement(block, STATEMENT);
                var active_statement = quando_editor.getStatement(block, ACTIVE_STATEMENT);
                var result = "quando.idle("
                    + seconds
                    + ", function() {\n" + statement + "}, function() {\n"
                    + active_statement + "});\n";
                return result;
            },
        });

        let CONTENT_POSITION = 'Position';
        let DIRECTION_MENU = 'Direction';
        let POSITION_SIZE = 'Position Size';
        quando_editor.defineClient({
            name: CONTENT_POSITION,
            interface: [
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
                { name: POSITION_SIZE, title: '', number: 0 }, {title: '%'},
                { menu: ['top', 'bottom', 'left', 'right'], name: DIRECTION_MENU, title: 'from' }
            ],
            javascript: (block) => {
                let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE]);
                let div = quando_editor.getMenu(block, DIV_MENU);
                switch (div) {
                    case 'Title': div = '#quando_title';
                        break;
                    case 'Text': div = '#quando_text';
                        break;
                    case 'Labels': div = '#quando_labels';
                        break;
                }
                let direction = quando_editor.getMenu(block, DIRECTION_MENU);
                let value = quando_editor.getNumber(block, POSITION_SIZE);
                result = `quando.${method}('${div}', '${direction}', '${value}%');\n`;
                if (direction == 'bottom') {
                   result += `quando.${method}('${div}', 'top', 'unset');\n`; // override the set top 0px
                } else if (direction == 'right') {
                   result += `quando.${method}('${div}', 'left', 'unset');\n`; // override the set left
                }
                return result;
            },
        });

        let CONTENT_SIZE = 'Size';
        let DIMENSION_MENU = 'Dimension';
        quando_editor.defineClient({
            name: CONTENT_SIZE,
            interface: [
                { menu: ['Title', 'Text', 'Labels'], name: DIV_MENU, title: '' },
                { name: POSITION_SIZE, title: '', number: 100 }, {title: '%'},
                { menu: ['height', 'width'], name: DIMENSION_MENU, title: 'of' },
            ],
            javascript: (block) => {
                let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE]);
                let div = quando_editor.getMenu(block, DIV_MENU);
                switch (div) {
                    case 'Title': div = '#quando_title';
                        break;
                    case 'Text': div = '#quando_text';
                        break;
                    case 'Labels': div = '#quando_labels';
                        break;
                }
                let dimension = quando_editor.getMenu(block, DIMENSION_MENU);
                let value = quando_editor.getNumber(block, POSITION_SIZE);
                result = `quando.${method}('${div}', '${dimension}', '${value}%');\n`;
                return result;
            },
        });
    };
})();

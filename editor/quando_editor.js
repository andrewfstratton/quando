(function () {
    var self = this["quando_editor"] = {};
    var quando_blocks = this["quando_blocks"];
    var TEXT_INPUT_PREFIX = 'TEXT_INPUT_';
    var NUMBER_INPUT_PREFIX = 'NUMBER_INPUT_';
    var CHECK_INPUT_PREFIX = 'CHECK_INPUT_';
    var COLOUR_INPUT_PREFIX = 'COLOUR_INPUT_';
    var MENU_INPUT_PREFIX = 'MENU_INPUT_';
    var FILE_INPUT_PREFIX = 'FILE_INPUT_';
    var EXTRAS_ID = "_EXTRAS";
    var EXTRAS_UP = "\u25b2";
    var EXTRAS_DOWN = "...";

    var encodeXml = function (str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };

    var dom_select = function (dom_id) {
        window.getSelection().removeAllRanges();
        var select = document.createRange();
        select.selectNode(dom_id);
        window.getSelection().addRange(select);
    };

    self.PREFIX = 'quando_';
    self.showCode = function () {
        var code = self.getCode();
        var dom_code = document.getElementById("code_content");
        dom_code.innerHTML = "<code><pre>" + code + "</pre></code>";
        //        dom_select(dom_code);
    };

    self.showXml = function () {
        var xml = encodeXml(self.getXml());
        var dom_xml = document.getElementById("xml_content");
        dom_xml.innerHTML = "<code><pre>" + xml + "</pre></code>";
        //        dom_select(dom_xml);
    };

    self.importXml = function () {
        var import_xml = document.getElementById("import_xml").value;
        Blockly.mainWorkspace.clear();
        xmlDom = Blockly.Xml.textToDom(import_xml);
        setTimeout( function() { // this may stop the reload problem - not proven...
            Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace);
        }, 0);
    };

    self.getCode = function () {
        var result = "Unknown failure to generate Code";
        try {
            //            result = 'quando = require("./quando_runtime.js");\n\n';
            result = Blockly.JavaScript.workspaceToCode(Blockly.mainWorkspace);
        } catch (e) {
            result += "\n" + e;
        }
        return result;
    };

    self.getXml = function () {
        var xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
        return xmlText;
    };

    var _undefinedDefault = function (val, alt) {
        if (!_exists(val)) {
            val = alt;
        }
        return val;
    };

    var _fromDom = function (val, alt) {
        return document.getElementById(_undefinedDefault(val, alt));
    };

    var _exists = function (val) {
        return !(typeof val === 'undefined');
    };

    var _isEqual = function (constant, val) {
        var result = false;
        if (_exists(val)) {
            result = (val === constant);
        }
        return result;
    };

    var _isTrue = function (val) {
        return _isEqual(true, val);
    };

    var _isFalse = function (val) {
        return _isEqual(false, val);
    };

    var _startsWith = function (string, substring) {
        return string.indexOf(substring) === 0;
    };

    self.getText = function (block, name) {
        // get the text input value using the block and the name of the input
        // field - also prefix double qoutes within the string...
        return block.getFieldValue(TEXT_INPUT_PREFIX + name).replace(/"/g, '\\"');
    };

    self.getNumber = function (block, name) {
        return block.getFieldValue(NUMBER_INPUT_PREFIX + name);
    };

    self.getColour = function (block, name) {
        return block.getFieldValue(COLOUR_INPUT_PREFIX + name);
    };

    self.getStatement = function (block, name) {
        return Blockly.JavaScript.statementToCode(block, name);
    };

    self.getCheck = function (block, name) {
        var result = false;
        if (block.getFieldValue(CHECK_INPUT_PREFIX + name) === 'TRUE') {
            result = true;
        }
        return result;
    };

    self.getMenu = function (block, name) {
        return block.getFieldValue(MENU_INPUT_PREFIX + name);
    };

    self.getFile = function (block, name) {
        return block.getFieldValue(FILE_INPUT_PREFIX + name);
    };

    self.setMenuText = function (block, name, text) {
        let menudrop = block.getField(MENU_INPUT_PREFIX + name);
        menudrop.setText(text);
    };

    self.resetMenu = function (block, name) {
        let menudrop = block.getField(MENU_INPUT_PREFIX + name);
        menudrop.setValue(0);
    };

    var _handleInterface = function (interface, name, _this, sofar, visible=true) {
        // Should handle if not an array (object)
        if (typeof interface !== 'object') {
            _ERROR("Failed to add interface widgets - json " + name + " is of type '"
                + typeof interface + "'");
            return;
        } // Else ok so far...
        // Check if an Array?!
        if (Object.prototype.toString.call(interface) !== '[object Array]') {
            _ERROR("Failed to add interface widgets - json " + name + " is not an Array");
            return;
        } // Else ok so far...
        interface.forEach(function (widget) {
            if (typeof widget !== 'object') {
                _WARNING("Ignoring element in interface Block '" + name + "' - not an object");
            } else {
                // TODO handle title and name out of order?!
                var fields = [];
                var title = widget.name; // by default
                if (_exists(widget.title)) { // replace default
                    if (typeof widget.title == 'function') {

                    } else {
                        title = widget.title;
                    }
                }
                if (_exists(title)) { // assuming it exists
                    if (title !== '') { // and it's not empty
                        var field = new Blockly.FieldLabel(title);
                        sofar.appendField(field); // then show the title
                        fields.push(field);
                    }
                }
                for (var key in widget) {
                    switch (key) {
                        case 'row':
                            var title = widget[key];
                            sofar = _this.appendDummyInput();
                            var field = new Blockly.FieldLabel(title);
                            sofar.appendField(field);
                            fields.push(field);
                            break;
                        case 'image':
                            var url = widget[key];
                            if (!_startsWith(url, 'http://')) {
                                if (!_startsWith(url, '/')) {
                                    if (!_startsWith(url, '.')) {
                                        url = 'resources/' + url;
                                    }
                                }
                            }
                            var width = 32;
                            // TODO set width and height from source file...
                            // This isn't simple - and relies on dom loading
                            // of image with callback.
                            if (_exists(widget.width)) {
                                width = widget.width;
                            } else {
                                _WARNING("Image widget width missing...assuming " +
                                    width + " pixels wide...");
                            }
                            var height = 32;
                            if (_exists(widget.height)) {
                                height = widget.height;
                            } else {
                                _WARNING("Image widget height missing...assuming " +
                                    height + " pixels wide...");
                            }
                            // TODO FIX alt text doesn't work - neither does the title?...
                            var alt = '*';
                            if (_exists(widget.alt)) {
                                alt = widget.alt;
                            } else {
                                _WARNING("Image widget missing alternate text...setting to '*'");
                            }
                            var field = new Blockly.FieldImage(url, width, height, alt);
                            sofar.appendField(field);
                            fields.push(field);
                            break;
                        case 'text':
                            var widget_id = TEXT_INPUT_PREFIX + widget.name;
                            if (typeof widget['change'] == 'function') {
                                var field = new Blockly.FieldTextInput(widget[key], widget['change']);
                                sofar.appendField(field, widget_id);
                                fields.push(field);
                                //TODO add this for all changeable inputs
                            } else {
                                var field = new Blockly.FieldTextInput(widget[key]);
                                sofar.appendField(field, widget_id);
                                fields.push(field);
                            }
                            break;
                        case 'number':
                            var widget_id = NUMBER_INPUT_PREFIX + widget.name;
                            var field = new Blockly.FieldNumber('' + widget[key]);
                            sofar.appendField(field, widget_id);
                            fields.push(field);
                            break;
                        case 'check':
                            var widget_id = CHECK_INPUT_PREFIX + widget.name;
                            var blockly_boolean = 'FALSE';
                            if (widget[key] === true) {
                                blockly_boolean = 'TRUE';
                            }
                            var field = new Blockly.FieldCheckbox(blockly_boolean);
                            sofar.appendField(field, widget_id);
                            fields.push(field);
                            break;
                        case 'colour':
                            var widget_id = COLOUR_INPUT_PREFIX + widget.name;
                            var field = new Blockly.FieldColour('' + widget[key]);
                            sofar.appendField(field, widget_id);
                            fields.push(field);
                            break;
                        case 'menu':
                            var widget_id = MENU_INPUT_PREFIX + widget.name;
                            var list = widget[key];
                            if (typeof list != 'undefined') {
                                if (typeof widget[key] != 'function') {
                                    // TODO should check that this is an array
                                    var menu_list = [];
                                    list.forEach(function (item) {
                                        if (Array.isArray(item)) {
                                            // should be a two tuple
                                            var name = item[0]; // may be false/null to indicate unselectable
                                            var title = item[1];
                                            menu_list.push([name, title]);
                                        } else if (typeof item === 'string' || item instanceof String) {
                                            menu_list.push([item, item]);
                                        } else {
                                            console.log("Error parsing Menu item: '" + item + "'");
                                        }
                                    });
                                    list = menu_list;
                                }
                                var field = new Blockly.FieldDropdown(list);
                                sofar.appendField(field, widget_id);
                                fields.push(field);
                            } else {
                                console.log("No Menu List " + widget_id);
                            }
                            break;
                        case 'file':
                            var widget_id = FILE_INPUT_PREFIX + widget.name;
                            var field = new Blockly.FieldLabel(String.fromCharCode(0x2023));
                            sofar.appendField(field);
                            fields.push(field);
                            var fileInput = new Blockly.FieldTextInput("** CHOOSE A FILE **");
                            var val = widget[key]; // val is the ?base? folder
                            var handle_file = this["index"].handle_file;
                            fileInput.showEditor_ = (function() {
                                let block_id = this.sourceBlock_.id
                                handle_file(val, block_id, widget_id) 
                            });
                            sofar.appendField(fileInput, widget_id);
                            fields.push(fileInput);
                            break;
                        case 'statement':
                            sofar = _this.appendStatementInput(widget[key]);
                            break;
                        //                            case 'title': break; // Yes, this is correct
                        //                            case 'name': break; // Yes, this is correct
                        //                            case 'width': break; // Yes, this is correct
                        //                            case 'height': break; // Yes, this is correct
                    } // switch key
                    if (visible == false) {
                        fields.forEach(function(field) {
                            field.setVisible(false);
                        })
                    }
                } // for
            } // else
        }); // foreach
        return sofar;
    };

    var _ERROR = function (msg) {
        console.log("**ERROR: " + msg);
    };

    var _WARNING = function (msg) {
        console.log("  warning: " + msg);
    };

    var _addToBlockly = function (blockly, json) {
        if (!_exists(json.name)) {
            _ERROR("Failed to create Block - missing name property");
            return;
        } // Else ok so far...
        var block = document.createElement('block');
        var id = self.PREFIX + json.name;
        if (_exists(blockly.Blocks[id])) {
            _ERROR("Failed to add block with id '" + id + "', already exists...");
            return;
        } // Else ok so far...
        block.setAttribute('type', id);
        var category_list = document.getElementById(json.category);
        if (!_exists(json.category)) {
            _ERROR("Failed to create Block - missing category property");
            return;
        } // Else ok so far...
        if (!_exists(category_list)) {
            _ERROR("Failed to find category list '" + json.category + "' in html document");
            return;
        } // Else ok so far...
        category_list.appendChild(block);
        if (!_exists(json.block_init)) {
            blockly.Blocks[id] = {
                init: function () {
                    var sofar = this.appendDummyInput();
                    if (_exists(json.title)) {
                        if (!_isFalse(json.title)) {
                            sofar = sofar.appendField(json.title);
                        }
                    } else {
                        sofar = sofar.appendField(json.name);
                    }
                    if (_exists(json.tooltip)) {
                        this.setTooltip(json.tooltip);
                    }
                    if (_exists(json.help)) {
                        this.setHelpUrl(json.help);
                    }
                    if (!_isFalse(json.next)) {
                        this.setNextStatement(true);
                    }
                    if (!_isFalse(json.previous)) {
                        this.setPreviousStatement(true);
                    }
                    if (_exists(json.colour)) {
                        // Note: otherwise black...which will be the same colour as overriden text
                        // N.B. Can use rgb format, i.e. '#bbbbbb' is grey
                        this.setColour(json.colour);
                    }
                    if (_exists(json.interface)) {
                        sofar = _handleInterface(json.interface, json.interface.name, this, sofar);
                    }
                    if (_exists(json.extras)) {
                        var extras_selector = new Blockly.FieldTextInput(EXTRAS_DOWN);
                        sofar.appendField(extras_selector, 'EXTRAS_OPEN'); // need id for persistence and loading render
                        var extras_dummy = this.appendDummyInput(EXTRAS_ID);
                        sofar = extras_dummy;
                        extras_dummy.setVisible(false);
                        extras_selector.showEditor_ = (function() { // toggle the dropdown
                            var extras_visible = false;
                            if (extras_selector.getValue() == EXTRAS_DOWN) {
                                // i.e. now show everything...
                                extras_selector.setValue(EXTRAS_UP);
                                extras_visible = true;
                            } else {
                                extras_selector.setValue(EXTRAS_DOWN);
                            } // Note - the CHANGE event will trigger updateExtras()
                        });
                        sofar = _handleInterface(json.extras, json.extras.name, this, sofar, false);
                        // i.e hides all the children
                    }
                    if (_exists(json.javascript)) {
                        blockly.JavaScript[id] = json.javascript;
                    }
                }
            };
            if (_exists(json.valid_in)) {
                blockly.Blocks[id].onchange = function () {
                    var valid_ids = [];
                    json.valid_in.forEach(function (iter) {
                        valid_ids.push('quando_' + iter);
                    });
                    var legal = false;
                    var check_block = this;
                    do {
                        if (valid_ids.indexOf(check_block.type) !== -1) {
                            legal = true;
                        }
                        check_block = check_block.getSurroundParent();
                    } while (!legal && check_block);
                    if (legal) {
                        this.setWarningText(null);
                    } else {
                        this.setWarningText(
                            "Block must exist within one of\n" + json.valid_in.join("\n"));
                    }
                };
            }
        } else {
            blockly.Blocks[id] = { init: json.block_init };
        }
    };

    self.inject = function (blockly, editor, toolbox) {
        var blockly = _undefinedDefault(blockly, this["Blockly"]);
        var blockly_editor_div = _fromDom(editor, 'blockly_editor');
        self.CONFIG = quando_blocks.CONFIG;
        var CONFIG = quando_blocks.CONFIG;
        blockly.HSV_SATURATION = CONFIG.BLOCKLY_SATURATION;
        blockly.HSV_VALUE = CONFIG.BLOCKLY_VALUE;
        blockly.BlockSvg.START_HAT = true; // Set the Vitrine to have a 'starting' hat

        var toolbox_elem = document.getElementById('toolbox');
        var workspace = blockly.inject(blockly_editor_div, {
            'toolbox': toolbox_elem,
            'zoom':
            {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            'media': './media/'  // TODO make across homepages as well
        });

        //        workspace.updateToolbox(toolbox_elem);

        // Change the menu colour
        var map = {
            'quando_display': CONFIG.DISPLAY_COLOUR,
            'quando_media': CONFIG.MEDIA_COLOUR,
            'quando_style': CONFIG.STYLE_COLOUR,
            'quando_client': CONFIG.CLIENT_COLOUR,
            'quando_time': CONFIG.TIME_COLOUR,
            'quando_leap_motion': CONFIG.LEAP_MOTION_COLOUR,
            'quando_device': CONFIG.DEVICE_COLOUR
        };
        for (var key in map) {
            var elem = _fromDom(key, null);
            if (elem !== null) {
                elem.setAttribute('colour', map[key]);
            } else {
                console.log("Failed to find: " + key);
            }
        }
        self.category = [];
        quando_blocks.addBlocks(self);
        self.category.forEach(function (json) {
            console.log('Adding ' + json.name);
            _addToBlockly(blockly, json);
        });
        workspace.updateToolbox(toolbox_elem);
    };

    self.defineBlock = function (json) {
        self.category.push(json);
        var id = self.PREFIX + json.name;
        return id;
    };

    function _defineBlock(json, category, colour) {
        json.category = category;
        if (!_exists(json.colour)) {
            json.colour = colour;
        }
        return self.defineBlock(json);
    };

    self.defineDisplay = function (json) {
        return _defineBlock(json, 'quando_display', self.CONFIG.DISPLAY_COLOUR);
    };
    self.defineMedia = function (json) {
        return _defineBlock(json, 'quando_media', self.CONFIG.MEDIA_COLOUR);
    };
    self.defineStyle = function (json) {
        return _defineBlock(json, 'quando_style', self.CONFIG.STYLE_COLOUR);
    };
    self.defineClient = function (json) {
        return _defineBlock(json, 'quando_client', self.CONFIG.CLIENT_COLOUR);
    };
    self.defineTime = function (json) {
        return _defineBlock(json, 'quando_time', self.CONFIG.TIME_COLOUR);
    };
    self.defineDevice = function (json) {
        return _defineBlock(json, 'quando_device', self.CONFIG.DEVICE_COLOUR);
    };
    self.defineLeapMotion = function (json) {
        return _defineBlock(json, 'quando_leap_motion', self.CONFIG.LEAP_MOTION_COLOUR);
    };

    self.getParent = function (block, ids) {
        var valid_ids = [];
        ids.forEach(function (iter) {
            valid_ids.push('quando_' + iter);
        });
        var found = false;
        var check_block = block.getSurroundParent();
        if (check_block != null) {
            do {
                if (valid_ids.indexOf(check_block.type) !== -1) {
                    found = check_block;
                } else {
                    check_block = check_block.getSurroundParent();
                }
            } while ((found === false) && check_block);
        }
        return found;
    };

    self.updateExtras = function(block) {
        var field = block.getField('EXTRAS_OPEN');
        if (field) {
            var visible = (field.getValue() == EXTRAS_UP);
            block.inputList.forEach(function(blockly_input) {
                if (blockly_input.name == EXTRAS_ID) {
                    blockly_input.setVisible(visible);
                    blockly_input.fieldRow.forEach(function(field) {
                        field.setVisible(visible);
                    });
                }
            });
            block.render();
        }
    }
})();
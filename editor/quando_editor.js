(function () {
    let self = this['quando_editor'] = {}
    let quando_blocks = this['quando_blocks']
    let TEXT_INPUT_PREFIX = 'TEXT_INPUT_'
    let NUMBER_INPUT_PREFIX = 'NUMBER_INPUT_'
    let CHECK_INPUT_PREFIX = 'CHECK_INPUT_'
    let COLOUR_INPUT_PREFIX = 'COLOUR_INPUT_'
    let MENU_INPUT_PREFIX = 'MENU_INPUT_'
    let FILE_INPUT_PREFIX = 'FILE_INPUT_'
    let EXTRAS_ID = '_EXTRAS'
    let EXTRAS_UP = '\u25b2'
    let EXTRAS_DOWN = '...'
    let _setup_code = []

    let encodeXml = (str) => {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
    }

    let dom_select = (dom_id) => {
        window.getSelection().removeAllRanges()
        let select = document.createRange()
        select.selectNode(dom_id)
        window.getSelection().addRange(select)
    }

    self.PREFIX = 'quando_'
    self.showCode = () => {
        let code = self.getCode()
        let dom_code = document.getElementById('code_content')
        dom_code.innerHTML = `<code><pre>${code}</pre></code>`
        //        dom_select(dom_code)
    }

    self.showXml = () => {
        let xml = encodeXml(self.getXml())
        let dom_xml = document.getElementById('xml_content')
        dom_xml.innerHTML = `<code><pre>${xml}</pre></code>`
        //        dom_select(dom_xml)
    }

    self.importXml = () => {
        let import_xml = document.getElementById('import_xml').value
        Blockly.mainWorkspace.clear()
        xmlDom = Blockly.Xml.textToDom(import_xml)
        setTimeout( function() { // this may stop the reload problem - not proven...
            Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace)
        }, 0)
    }

    self.getCode = () => {
        let result = 'Unknown failure to generate Code'
        try {
            _setup_code = []
            let main = Blockly.JavaScript.workspaceToCode(Blockly.mainWorkspace)
            result = ''
            for (let i=0; i<_setup_code.length; i++) {
                result += _setup_code[i]
            }
            result += main
        } catch (e) {
            result += '\n' + e
        }
        return result
    }

    self.pushToSetup = (code) => {
        _setup_code.push(code)
    }

    self.getXml = () => {
        let xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)
        let xmlText = Blockly.Xml.domToPrettyText(xmlDom)
        return xmlText
    }

    let _undefinedDefault = (val, alt) => {
        if (!self.exists(val)) {
            val = alt
        }
        return val
    }

    let _fromDom = (val, alt) => {
        return document.getElementById(_undefinedDefault(val, alt))
    }

    let _isEqual = (constant, val) => {
        let result = false
        if (self.exists(val)) {
            result = (val === constant)
        }
        return result
    }

    let _isTrue = (val) => {
        return _isEqual(true, val)
    }

    let _isFalse = (val) => {
        return _isEqual(false, val)
    }

    let _startsWith = (string, substring) => {
        return string.indexOf(substring) === 0
    }

    self.exists = (val) => {
        return !(typeof val === 'undefined')
    }

    self.getRawText = (block, name) => {
        return block.getFieldValue(TEXT_INPUT_PREFIX + name)
    }

    self.getText = (block, name) => {
        // get the text input value using the block and the name of the input
        // field - also prefix double qoutes within the string...
        return self.getRawText(block, name).replace(/"/g, '\\"')
    }

    self.getNumber = (block, name) => {
        return parseFloat(block.getFieldValue(NUMBER_INPUT_PREFIX + name))
    }

    self.getColour = (block, name) => {
        return block.getFieldValue(COLOUR_INPUT_PREFIX + name)
    }

    self.getStatement = (block, name) => {
        return Blockly.JavaScript.statementToCode(block, name)
    }

    self.getIndividualBlockCode = (block) => {
        let result = ''
        if (block && !block.disabled) {
            let javascript = Blockly.JavaScript[block.type]
            if (javascript) {
                result = javascript.call(block, block)
            } else {
                result = `Javascript missing for ${block.type}`
            }
        }
        return result
    }

    self.getCheck = (block, name) => {
        let result = false
        if (block.getFieldValue(CHECK_INPUT_PREFIX + name) === 'TRUE') {
            result = true
        }
        return result
    }

    self.getMenu = (block, name) => {
        return block.getFieldValue(MENU_INPUT_PREFIX + name)
    }

    self.getFile = (block, name) => {
        return block.getFieldValue(FILE_INPUT_PREFIX + name)
    }

    self.setMenuText = (block, name, text) => {
        let menudrop = block.getField(MENU_INPUT_PREFIX + name)
        menudrop.setText(text)
    }

    self.resetMenu = (block, name) => {
        let menudrop = block.getField(MENU_INPUT_PREFIX + name)
        menudrop.setValue(0)
    }

    let _handleInterface = function (interface, name, _this, sofar, visible=true) {
        // Should handle if not an array (object)
        if (typeof interface !== 'object') {
            _ERROR(`Failed to add interface widgets - json ${name} is of type '${typeof interface}'`)
            return
        } // Else ok so far...
        // Check if an Array?!
        if (Object.prototype.toString.call(interface) !== '[object Array]') {
            _ERROR(`Failed to add interface widgets - json ${name} is not an Array`)
            return
        } // Else ok so far...
        interface.forEach(function (widget) {
            if (typeof widget !== 'object') {
                _WARNING(`Ignoring element in interface Block '${name}' - not an object`)
            } else {
                // TODO handle title and name out of order?!
                let fields = []
                let title = widget.name // by default
                if (self.exists(widget.title)) { // replace default
                    if (typeof widget.title == 'function') {

                    } else {
                        title = widget.title
                    }
                }
                if (self.exists(title)) { // assuming it exists
                    if (title !== '') { // and it's not empty
                        let field = new Blockly.FieldLabel(title)
                        sofar.appendField(field) // then show the title
                        fields.push(field)
                    }
                }
                for (let key in widget) {
                    switch (key) {
                        case 'row':
                            let title = widget[key]
                            sofar = _this.appendDummyInput()
                            let field = new Blockly.FieldLabel(title)
                            sofar.appendField(field)
                            fields.push(field)
                            break
                        case 'image':
                            let url = widget[key]
                            if (!_startsWith(url, 'http://')) {
                                if (!_startsWith(url, '/')) {
                                    if (!_startsWith(url, '.')) {
                                        url = 'resources/' + url
                                    }
                                }
                            }
                            let width = 32
                            // TODO set width and height from source file...
                            // This isn't simple - and relies on dom loading
                            // of image with callback.
                            if (self.exists(widget.width)) {
                                width = widget.width
                            } else {
                                _WARNING(`Image widget width missing...assuming ${width} pixels wide...`)
                            }
                            let height = 32
                            if (self.exists(widget.height)) {
                                height = widget.height
                            } else {
                                _WARNING(`Image widget height missing...assuming ${height} pixels wide...`)
                            }
                            // TODO FIX alt text doesn't work - neither does the title?...
                            let alt = '*'
                            if (self.exists(widget.alt)) {
                                alt = widget.alt
                            } else {
                                _WARNING("Image widget missing alternate text...setting to '*'")
                            }
                            let fieldImage = new Blockly.FieldImage(url, width, height, alt)
                            sofar.appendField(fieldImage)
                            fields.push(fieldImage)
                            break
                        case 'text':
                            let widget_id_text = TEXT_INPUT_PREFIX + widget.name
                            if (typeof widget['change'] == 'function') {
                                let field = new Blockly.FieldTextInput(widget[key], widget['change'])
                                sofar.appendField(field, widget_id_text)
                                fields.push(field)
                                //TODO add this for all changeable inputs
                            } else {
                                let field = new Blockly.FieldTextInput(widget[key])
                                sofar.appendField(field, widget_id_text)
                                fields.push(field)
                            }
                            break
                        case 'number':
                            let fieldNumber = new Blockly.FieldNumber('' + widget[key])
                            sofar.appendField(fieldNumber, NUMBER_INPUT_PREFIX + widget.name)
                            fields.push(fieldNumber)
                            break
                        case 'check':
                            let blockly_boolean = 'FALSE'
                            if (widget[key] === true) {
                                blockly_boolean = 'TRUE'
                            }
                            let fieldCheck = new Blockly.FieldCheckbox(blockly_boolean)
                            sofar.appendField(fieldCheck, CHECK_INPUT_PREFIX + widget.name)
                            fields.push(fieldCheck)
                            break
                        case 'colour':
                            let fieldColour = new Blockly.FieldColour('' + widget[key])
                            sofar.appendField(fieldColour, COLOUR_INPUT_PREFIX + widget.name)
                            fields.push(fieldColour)
                            break
                        case 'menu':
                            let list = widget[key]
                            if (typeof list != 'undefined') {
                                if (typeof widget[key] != 'function') {
                                    // TODO should check that this is an array
                                    let menu_list = []
                                    list.forEach((item) => {
                                        if (Array.isArray(item)) {
                                            // should be a two tuple
                                            let name = item[0] // may be false/null to indicate unselectable
                                            let title = item[1]
                                            menu_list.push([name, title])
                                        } else if (typeof item === 'string' || item instanceof String) {
                                            menu_list.push([item, item])
                                        } else {
                                            console.log(`Error parsing Menu item: '${item}'`)
                                        }
                                    })
                                    list = menu_list
                                }
                                let field = new Blockly.FieldDropdown(list)
                                sofar.appendField(field, MENU_INPUT_PREFIX + widget.name)
                                fields.push(field)
                            } else {
                                console.log('No Menu List ' + MENU_INPUT_PREFIX + widget.name)
                            }
                            break
                        case 'file':
                            let widget_id_file = FILE_INPUT_PREFIX + widget.name
                            let fieldLabel = new Blockly.FieldLabel(String.fromCharCode(0x2023))
                            sofar.appendField(fieldLabel)
                            fields.push(fieldLabel)
                            let fileInput = new Blockly.FieldTextInput('** CHOOSE A FILE **')
                            let val = widget[key] // val is the ?base? folder
                            let handle_file = this['index'].handle_file
                            fileInput.showEditor_ = (function() {
                                let block_id = this.sourceBlock_.id
                                handle_file(val, block_id, widget_id_file) 
                            })
                            sofar.appendField(fileInput, widget_id_file)
                            fields.push(fileInput)
                            break
                        case 'statement':
                            sofar = _this.appendStatementInput(widget[key])
                            break
                        //                            case 'title': break // Yes, this is correct
                        //                            case 'name': break // Yes, this is correct
                        //                            case 'width': break // Yes, this is correct
                        //                            case 'height': break // Yes, this is correct
                    } // switch key
                    if (visible == false) {
                        fields.forEach(function(field) {
                            field.setVisible(false)
                        })
                    }
                } // for
            } // else
        }) // foreach
        return sofar
    }

    let _ERROR = (msg) => {
        console.log('**ERROR: ' + msg)
    }

    let _WARNING = (msg) => {
        console.log('  warning: ' + msg)
    }

    let _addToBlockly = function (blockly, json) {
        if (!self.exists(json.name)) {
            _ERROR('Failed to create Block - missing name property')
            return
        } // Else ok so far...
        let block = document.createElement('block')
        let id = self.PREFIX + json.name
        if (self.exists(blockly.Blocks[id])) {
            _ERROR(`Failed to add block with id '${id}', already exists...`)
            return
        } // Else ok so far...
        block.setAttribute('type', id)
        let category_list = document.getElementById(json.category)
        if (!self.exists(json.category)) {
            _ERROR('Failed to create Block - category property missing')
            return
        } // Else ok so far...
        if (!self.exists(category_list)) {
            _ERROR(`Failed to find category list '${json.category}' in html document`)
            return
        } // Else ok so far...
        category_list.appendChild(block)
        if (!self.exists(json.block_init)) {
            blockly.Blocks[id] = {
                init: function () {
                    let sofar = this.appendDummyInput()
                    if (self.exists(json.title)) {
                        if (!_isFalse(json.title)) {
                            sofar = sofar.appendField(json.title)
                        }
                    } else {
                        sofar = sofar.appendField(json.name)
                    }
                    if (self.exists(json.tooltip)) {
                        this.setTooltip(json.tooltip)
                    }
                    if (self.exists(json.help)) {
                        this.setHelpUrl(json.help)
                    }
                    if (!_isFalse(json.next)) {
                        this.setNextStatement(true)
                    }
                    if (!_isFalse(json.previous)) {
                        this.setPreviousStatement(true)
                    }
                    if (self.exists(json.colour)) {
                        // Note: otherwise black...which will be the same colour as overriden text
                        // N.B. Can use rgb format, i.e. '#bbbbbb' is grey
                        this.setColour(json.colour)
                    }
                    if (self.exists(json.interface)) {
                        sofar = _handleInterface(json.interface, json.interface.name, this, sofar)
                    }
                    if (self.exists(json.extras)) {
                        let extras_selector = new Blockly.FieldTextInput(EXTRAS_DOWN)
                        sofar.appendField(extras_selector, 'EXTRAS_OPEN') // need id for persistence and loading render
                        let extras_dummy = this.appendDummyInput(EXTRAS_ID)
                        sofar = extras_dummy
                        extras_dummy.setVisible(false)
                        extras_selector.showEditor_ = (function() { // toggle the dropdown
                            let extras_visible = false
                            if (extras_selector.getValue() == EXTRAS_DOWN) {
                                // i.e. now show everything...
                                extras_selector.setValue(EXTRAS_UP)
                                extras_visible = true
                            } else {
                                extras_selector.setValue(EXTRAS_DOWN)
                            } // Note - the CHANGE event will trigger updateExtras()
                        })
                        sofar = _handleInterface(json.extras, json.extras.name, this, sofar, false)
                        // i.e hides all the children
                    }
                    if (self.exists(json.javascript)) {
                        blockly.JavaScript[id] = json.javascript
                    }
                }
            }
            if (self.exists(json.valid_in)) {
                blockly.Blocks[id].onchange = function () {
                    let valid_ids = []
                    json.valid_in.forEach((iter) => {
                        valid_ids.push('quando_' + iter)
                    })
                    let legal = false
                    let check_block = this
                    do {
                        if (valid_ids.indexOf(check_block.type) !== -1) {
                            legal = true
                        }
                        check_block = check_block.getSurroundParent()
                    } while (!legal && check_block)
                    if (legal) {
                        this.setWarningText(null)
                    } else {
                        this.setWarningText(
                            'Block must exist within one of\n' + json.valid_in.join('\n'))
                    }
                }
            }
        } else {
            blockly.Blocks[id] = { init: json.block_init }
        }
    }

    self.inject = function (iblockly, editor, toolbox) {
        let blockly = _undefinedDefault(iblockly, this['Blockly'])
        let blockly_editor_div = _fromDom(editor, 'blockly_editor')
        let CONFIG = quando_blocks.CONFIG
        blockly.HSV_SATURATION = CONFIG.BLOCKLY_SATURATION
        blockly.HSV_VALUE = CONFIG.BLOCKLY_VALUE
        blockly.BlockSvg.START_HAT = true // Set the Vitrine to have a 'starting' hat

        let toolbox_elem = document.getElementById('toolbox')
        let workspace = blockly.inject(blockly_editor_div, {
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
        })

        //        workspace.updateToolbox(toolbox_elem)

        // Change the menu colour
        let map = {
            'quando_display': CONFIG.DISPLAY_COLOUR,
            'quando_media': CONFIG.MEDIA_COLOUR,
            'quando_style': CONFIG.STYLE_COLOUR,
            'quando_client': CONFIG.CLIENT_COLOUR,
            'quando_time': CONFIG.TIME_COLOUR,
            'quando_device': CONFIG.DEVICE_COLOUR,
                'quando_leap': CONFIG.DEVICE_COLOUR,
                'quando_microbit': CONFIG.DEVICE_COLOUR,
                'quando_robot': CONFIG.ROBOT_COLOUR,
                'quando_cursor': CONFIG.DEVICE_COLOUR,
            'quando_experiment': CONFIG.EXPERIMENT_COLOUR,
            'quando_advanced': CONFIG.ADVANCED_COLOUR
        }
        for (let key in map) {
            let elem = _fromDom(key, null)
            if (elem !== null) {
                elem.setAttribute('colour', map[key])
            } else {
                console.log('Failed to find: ' + key)
            }
        }
        self.category = []
        quando_blocks.addBlocks(self)
        self.category.forEach(function (json) {
            console.log('Adding ' + json.name)
            _addToBlockly(blockly, json)
        })
        workspace.updateToolbox(toolbox_elem)
    }

    self.defineBlock = (json) => {
        self.category.push(json)
        let id = self.PREFIX + json.name
        return id
    }

    function _defineBlock(json, category, colour) {
        json.category = category
        if (!_exists(json.colour)) {
            json.colour = colour
        }
        return self.defineBlock(json)
    }

    self.getGetParent = (block) => {
        return block.getSurroundParent()
    }

    self.getParent = (block, ids) => {
        let valid_ids = []
        ids.forEach((iter) => {
            valid_ids.push('quando_' + iter)
        })
        let found = false
        let check_block = block.getSurroundParent()
        if (check_block != null) {
            do {
                if (valid_ids.indexOf(check_block.type) !== -1) {
                    found = check_block
                } else {
                    check_block = check_block.getSurroundParent()
                }
            } while ((found === false) && check_block)
        }
        return found
    }

    self.updateExtras = function(block) {
        let field = block.getField('EXTRAS_OPEN')
        if (field) {
            let visible = (field.getValue() == EXTRAS_UP)
            block.inputList.forEach(function(blockly_input) {
                if (blockly_input.name == EXTRAS_ID) {
                    blockly_input.setVisible(visible)
                    blockly_input.fieldRow.forEach(function(field) {
                        field.setVisible(visible)
                    })
                }
            })
            block.render()
        }
    }
})()

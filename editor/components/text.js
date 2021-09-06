import InventorComponent from "/editor/inventor_component.js"
import * as common_text from "/common/text.js"

export default class InventorText extends InventorComponent {
    constructor() {
        super()
    }

    set text(txt) {
        this.txt = txt
    }

    get text() {
        return this.txt
    }

    set encoded(encoded) {
        if (encoded) {
            this._encoded = true
        } else {
            // to avoid persisting
            delete this._encoded
        }
    }

    getGUI() {
        let result = this.txt || ""
        if (this._encoded)  {
            result = common_text.decode(result)
        }
        return result
    }
}
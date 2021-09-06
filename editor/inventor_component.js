// contains common Inventor Component methods
import Component from "/editor/component.js"

export default class InventorComponent extends Component {
    static inventor_lookup = {} // use instead of block lookup

    constructor() {
        super()
    }

    add_to_lookup() {
        console.log('.. '+this.constructor.name)
        InventorComponent.inventor_lookup[this.constructor.name] = this.constructor
    }

    static fromJSON(str) {
        console.log(Object.keys(InventorComponent.inventor_lookup))
    }
}
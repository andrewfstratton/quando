// contains common component methods

export default class Component {
    static lookup = {}

    constructor() {
        this.properties = new Map()
        this.add_to_lookup()
    }

    add_to_lookup() { // N.B. Must not be static?! To allow override for Inventor blocks lookup
        console.log('+'+this.constructor.name)
        Component.lookup[this.constructor.name] = this.constructor
    }

    getProperty(prop) {
        let result = this.properties.get(prop)
        if (result === undefined) {
            result = false
        }
        return result
    }

    setProperty(prop, val) {
        if (val) {
            this.properties.set(prop, val)
        } else {
            // remove to avoid persistence when falsey
            this.properties.delete(prop)
        }
    }

    toJSON() {
        if (this.properties.size === 0) {
            return "" }
        let result = "["
        this.properties.forEach((val, key)=>{
            if (result !== "[") {
                result += ", "
            }
            if (typeof(val) === 'string') {
                val = `"${val}"`
            }
            result += `${key}:${val}`
        })
        result += ']'
        return result
    }

    static fromJSON(str) {
        console.log(Object.keys(Component.lookup))
    }
}
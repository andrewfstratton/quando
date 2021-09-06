import Component from '/editor/component.js'
import test from '/editor/test/test.js'

let component = new Component()

test.suite("Properties - for persistence", () => {
    test.falsey("New component properties set to false", component.getProperty("test"))
    component.setProperty("test", "TEST")
    test.equal("Property set should be returned", component.getProperty("test"), "TEST")
    test.notEqual("Property unset should not be returned", component.getProperty("TEST"), "TEST")
    component.setProperty("test", false)
    test.falsey("Property set to (false) should be falsey", component.getProperty("test"))
    component.setProperty("test", 0)
    test.falsey("Property set to 0 should be falsey", component.getProperty("test"))
    component.setProperty("test", '')
    test.falsey("Property set to '' should be falsey", component.getProperty("test"))
})

test.suite("toJSON", () => {
    test.equal("Empty component should be returned as ''", component.toJSON(), '')
    component.setProperty('text', 'hello')
    test.equal("Property text='hello' property should return as \"hello\"'",
        component.getProperty('text'), 'hello')
    test.equal("Property text='hello' property should be returned as '[text:\"hello\"]'",
        component.toJSON(), '[text:"hello"]')
})
import Text from '/editor/components/text.js'
import test from '/editor/test/test.js'

test.suite("Object properties", () => {
    let text = new Text()
    test.equal("New Text value is undefined", text.text, undefined)
    text.text = "Hi"
    test.equal("Text value holds string", text.text, "Hi")
})

test.suite("getGUI", () => {
    let text = new Text()
    test.falsey("New text getGUI should be empty string", text.getGUI())
    text.text = "When"
    test.equal("Text getGUI should hold simple string", text.getGUI(), "When")
    text.text = "⚡"
    test.equal("Text getGUI should hold unicode", text.getGUI(), "⚡")
    text.text = "&lt;b&gt;Hi&apos;&quot;&amp;&lt;/b&gt;"
    test.equal("Text getGUI html should return actual string", text.getGUI(), text.text)
    text.encoded = true
    test.equal("Text getGUI html should decode string", text.getGUI(), `<b>Hi'"&</b>`)
    Text.fromJSON()
})

test.suite("toJSON", () => {
    let text = new Text()
    test.equal("Empty component should be returned as ''", component.toJSON(), '')
    text.setProperty('text', 'hello')
    test.equal("Property text='hello' property should return as \"hello\"'",
        component.getProperty('text'), 'hello')
    test.equal("Property text='hello' property should be returned as '[text:\"hello\"]'",
        component.toJSON(), '[text:"hello"]')
})

test.suite("fromJSON", () => {
    let text = Component.fromJSON('')
    test.equal("Empty component should be returned as ''", Component.fromJSON(), '')
    component.setProperty('text', 'hello')
    test.equal("Empty component should be returned as ''", Component.toJSON(), '')
})
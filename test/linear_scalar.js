const assert = require('chai').assert

// let linear_scaler = quando.linear_scaler(mid, plus_minus, inverted = false)

var new_scaler = function (min, max, inverted = false) {
    return function (value) {
      // convert to range 0 to 1 for min to max
      var result = (value - min) / (max - min)
      result = Math.min(1, result)
      result = Math.max(0, result)
      if (inverted) {
        result = 1 - result
      }
      return result
    }
  }

suite("Linear Tests - Around Zero scaler", () => {
    let scaler = new_scaler(-10, 10)
    test("normal", () => {
        assert.equal(scaler(-10), 0, "-Range")
        assert.equal(scaler(10), 1, "+Range")
    }),
    test("inverted", () => {
        let scaler = new_scaler(-10, 10, true)
        assert.equal(scaler(-10), 1, "-Range")
        assert.equal(scaler(10), 0, "+Range")
    }),
    test("non negative", () => {
        let scaler = new_scaler(10, 30)
        assert.equal(scaler(10), 0, "-Range")
        assert.equal(scaler(30), 1, "+Range")
    }),
    test("in the middle", () => {
        assert.equal(scaler(0), 0.5, "Zero")
    }),
    test("in-between", () => {
        assert.equal(scaler(-5), 0.25, "-5")
        assert.equal(scaler(5), 0.75, "+5")
    }),
    test("outside range", () => {
        assert.equal(scaler(-20), 0, "Below Range")
        assert.equal(scaler(20), 1, "Above Range")
    })
})

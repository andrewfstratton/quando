const assert = require('chai').assert

// let angle_scaler = quando.new_angle_scaler(mid, plus_minus, inverted = false)
console.log('hello')


var new_scaler = function (min, max, inverted = false) {
    return function (value) {
      var result = null
      // convert to range 0 to 1 for min to max
      result = (value - min) / (max - min)
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

/*
suite("Angle Tests - Above Zero Scalar", () => {
    let angle_scaler = new_angle_scaler(90, 30)
    test("normal", () => {
        assert.equal(angle_scaler(60), 0, "-Range")
        assert.equal(angle_scaler(120), 1, "+Range")
    }),
    test("inverted", () => {
        let angle_scaler = new_angle_scaler(90, 30, true)
        assert.equal(angle_scaler(60), 1, "-Range")
        assert.equal(angle_scaler(120), 0, "+Range")
    }),
    test("in the middle", () => {
        assert.equal(angle_scaler(90), 0.5, "90")
    }),
    test("Around zero - in-between", () => {
        assert.equal(angle_scaler(75), 0.25, "-5")
        assert.equal(angle_scaler(105), 0.75, "+5")
    })
})


suite("Angle Tests - Zero middle - Outside range flip", () => {
    let angle_scaler = new_angle_scaler(0, 90)
    test("Outside range", () => {
        assert.equal(angle_scaler(-100), 0, "--Range")
        assert.equal(angle_scaler(100), 1, "++Range")
    }),
    test("Crossover", () => {
        assert.equal(angle_scaler(179), 1, "++Range")
        assert.equal(angle_scaler(170), 1, "+Range")
        assert.equal(angle_scaler(-100), 0, "-Range")
        assert.equal(angle_scaler(181), 0, "--Range")
    })
})

suite("Angle tests - Outside range - Checking buffer", () => {
    let angle_scaler = new_angle_scaler(0, 45)
    test("Inside buffer", () => {
        angle_scaler(100)
        assert.equal(angle_scaler(170), 1, "+Range")
        assert.equal(angle_scaler(-170), 1, "-Range")
    }),
    test("Cross Buffer then inside", () => {
        angle_scaler(-100)
        assert.equal(angle_scaler(170), 0, "+Range")
        assert.equal(angle_scaler(-170), 0, "-Range")
    })
})
*/
// suite - outside range positive/negative middle
// crossback not triggering
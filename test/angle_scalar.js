const assert = require('chai').assert

// let angle_scalar = quando.new_angle_scaler(mid, plus_minus, inverted = false)
console.log('hello')

var new_angle_scaler = function (mid, plus_minus, inverted = false) {
    var mod = function(x, n) {
        return ((x%n)+n)%n
    }
    var last_result = 0
    var crossover = mod(mid+180, 360)
    // i.e. 25% of the non used range
    var crossover_range = (180 - Math.abs(plus_minus)) / 4
    return function (value) {
      var x = mod(value - mid, 360)
      if (x > 180) { x -= 360}
      var result = (x + plus_minus) / (2 * plus_minus)
      if (inverted) {
        result = 1 - result
      }
      if ((result < 0) || (result > 1)) { // i.e. result is out of range
            // identify if result should be used
            var diff = Math.abs(crossover - mod(value, 360))
            if (diff <= crossover_range) { // inside crossover range, so use the last result 
                result = last_result
            }
      }
      result = Math.min(1, result)
      result = Math.max(0, result)
      last_result = result
      return result
    }
  }

suite("Angle Tests - Around Zero scalar", () => {
    let angle_scalar = new_angle_scaler(0, 10)
    test("normal", () => {
        assert.equal(angle_scalar(-10), 0, "-Range")
        assert.equal(angle_scalar(10), 1, "+Range")
    }),
    test("inverted", () => {
        let angle_scalar = new_angle_scaler(0, 10, true)
        assert.equal(angle_scalar(-10), 1, "-Range")
        assert.equal(angle_scalar(10), 0, "+Range")
    }),
    test("non negative", () => {
        assert.equal(angle_scalar(350), 0, "-Range")
        assert.equal(angle_scalar(350), 0, "-Range")
    }),
    test("in the middle", () => {
        assert.equal(angle_scalar(0), 0.5, "Zero")
        assert.equal(angle_scalar(360), 0.5, "360")
    }),
    test("in-between", () => {
        assert.equal(angle_scalar(355), 0.25, "-5")
        assert.equal(angle_scalar(5), 0.75, "+5")
    }),
    test("outside range", () => {
        assert.equal(angle_scalar(-20), 0, "Below Range")
        assert.equal(angle_scalar(20), 1, "Above Range")
    })
})

suite("Angle Tests - Above Zero Scalar", () => {
    let angle_scalar = new_angle_scaler(90, 30)
    test("normal", () => {
        assert.equal(angle_scalar(60), 0, "-Range")
        assert.equal(angle_scalar(120), 1, "+Range")
    }),
    test("inverted", () => {
        let angle_scalar = new_angle_scaler(90, 30, true)
        assert.equal(angle_scalar(60), 1, "-Range")
        assert.equal(angle_scalar(120), 0, "+Range")
    }),
    test("in the middle", () => {
        assert.equal(angle_scalar(90), 0.5, "90")
    }),
    test("Around zero - in-between", () => {
        assert.equal(angle_scalar(75), 0.25, "-5")
        assert.equal(angle_scalar(105), 0.75, "+5")
    })
})


suite("Angle Tests - Zero middle - Outside range flip", () => {
    let angle_scalar = new_angle_scaler(0, 90)
    test("Outside range", () => {
        assert.equal(angle_scalar(-100), 0, "--Range")
        assert.equal(angle_scalar(100), 1, "++Range")
    }),
    test("Crossover", () => {
        assert.equal(angle_scalar(179), 1, "++Range")
        assert.equal(angle_scalar(170), 1, "+Range")
        assert.equal(angle_scalar(-100), 0, "-Range")
        assert.equal(angle_scalar(181), 0, "--Range")
    })
})

suite("Angle tests - Outside range - Checking buffer", () => {
    let angle_scalar = new_angle_scaler(0, 45)
    test("Inside buffer", () => {
        angle_scalar(100)
        assert.equal(angle_scalar(170), 1, "+Range")
        assert.equal(angle_scalar(-170), 1, "-Range")
    }),
    test("Cross Buffer then inside", () => {
        angle_scalar(-100)
        assert.equal(angle_scalar(170), 0, "+Range")
        assert.equal(angle_scalar(-170), 0, "-Range")
    })

})
// suite - outside range positive/negative middle
// crossback not triggering
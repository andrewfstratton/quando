"use strict"

const dice = sides => () => Math.ceil(Math.random() * sides)

var d6 = dice(6)
console.log(d6(), d6(), d6())

return
let x = 2
+ 3
console.log(x)
let y = 3 +
2
console.log(y)
return

function for_reverse(src) {
    let result = ""
    for (let i=src.length-1; i>=0; i--) {
        result += src[i]
    }
    return result
}
console.log(for_reverse("pals live"))

function while_reverse(src) {
    let i = src.length-1, result = ""
    while (i >= 0) {
        result += src[i]
        i--
    }
    return result
}
console.log(while_reverse("time knits"))

function reverse(src) {
    if (src.length <= 1) {
        return src
    }
    // else recurse
    let new_len = src.length-1
    return src[new_len] + reverse(src.slice(0,new_len))
}
console.log(reverse("tin mined"))

function loop_fac(x) {
    let result = 1
    for(let i=1; i<=x; i++) {
        result *= i
    }
    return result
}
console.log(loop_fac(1))
console.log(loop_fac(5))
console.log(loop_fac(19))

function fac(x) {
  if (x == 0) {
      return 1
  } else {
      return x*fac(x-1)
  }
}

console.log(fac(1))
console.log(fac(5))
console.log(fac(19))
// console.log(fac(-1))

let languages = {
    'ECMAScript': ['JavaScript'],
    'JavaScript': ['LiveScript'],
    'LiveScript': ['Java', 'Self', 'Scheme'],
    'Java': ['C++'],
    'C#': ['Java', 'C++'],
    'Scheme': ['LISP'],
    'PostScript': ['Forth'],
    'Joy': ['Forth', 'FP'],
    'Factor': ['Joy', 'LISP'],
    'C++': ['C', 'SIMULA'],
    'C': ['PL/1', 'B BPL']
}

function ancestor(candidate, child) {
    if (child in languages) {
        // i.e. there are parent languages
        let parents = languages[child]
        if (parents.indexOf(candidate) > -1) {
            // found the candidate as a direct parent
            return true
        }
        // else check each of the parents
        for (let i in parents) {
            if (ancestor(candidate, parents[i])) {
                return true
            }
        }
    }
    return false
}
console.log(ancestor('C++', 'Java'))
console.log(ancestor('C', 'Java'))
console.log(ancestor('PL/1', 'JavaScript'))
console.log(ancestor('Factor', 'JavaScript'))

function hanoi(disks, from, to, spare) {
    if (disks == 1) {
        console.log(from + " >> " + to)
    } 
    else {
        hanoi(disks-1, from, spare, to)
        hanoi(1, from, to, spare)
        hanoi(disks-1, spare, to, from)
    }
}


hanoi(5, "Left  ", " Right", "Middle")

function pallindrome(candidate) {
console.log("Checking: " + candidate)
  if (candidate.length <= 1) {
      return true
  }
  let last = candidate.length-1
console.log("Comparing: " + candidate[0] + " " + candidate[last])
  if (candidate[0] == candidate[last]) {
    return pallindrome(candidate.slice(1,last))
  }
  return false
}

console.log(pallindrome(""))
console.log(pallindrome("A"))
console.log(pallindrome("AA"))
console.log(pallindrome("ABA"))
console.log(pallindrome("ABC"))
console.log(pallindrome("ABLE WAS I ERE I SAW ELBA"))

function sfac(x) {
  let f = (x) => {
    return x == 0?1:x*f(x-1)
  }
  return x<0?undefined:f(x)
}
console.log(sfac(11))
console.log(sfac(-11))

// playing with tail recursive with multiply (!)

function pow(base, exponent) { // note - only works for positive integers...
    if (exponent <= 1) {
        return base
    } else {
        return base * pow(base, exponent-1)
    }
}
//console.log(pow(2,20010))

function tpow(base, exponent, total=1) { // note - only works for positive integers...
    if (exponent <= 1) {
        return total
    } // else below
    return tpow(base, exponent-1, total*base)
}
console.log(tpow(1.000000001,50000000))


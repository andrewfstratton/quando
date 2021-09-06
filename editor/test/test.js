let suite_name = ''
let passed = 0
let failed = 0
let skipped = 0

function _test(name, ass, actual) {
    if (ass) {
        passed++
    } else {
        failed++
        report_fail(name, actual)
        test = ignore
    }
}
let test = _test
function ignore() {
    skipped++
}

function report(message) {
    let new_div = document.createElement("div")
    new_div.innerHTML = message
    new_div.style.backgroundColor = "#ffdddd"
    document.body.appendChild(new_div)
}
function report_fail(name, actual) {
    report(`${suite_name} Suite failure after ${passed} passes<br/>
    &nbsp; &nbsp; ${name}, actual: ${actual}<br>... skipping rest of suite`)
}

function report_error(err) {
    report(` ** Error in Suite code '${suite_name}' :: ${err.stack}`)
}

let module = {}
module.suite = (name, exec) => {
    suite_name = name
    passed = 0
    failed = 0
    skipped = 0
    try {
        exec()
    } catch (err) {
        report_error(err)
        failed++
    }
    if (failed === 0) {
        let new_div = document.createElement("div")
        new_div.innerHTML = `${suite_name} all passed`
        document.body.appendChild(new_div)
    }
    test = _test
}
module.true = (name, ass) => {
    test(name, ass, ass)
}
module.falsey = (name, ass) => {
    test(name, ass == false, ass)
}
module.equal = (name, ass, eq) => {
    test(name, ass == eq, ass)
}
module.notEqual = (name, ass, eq) => {
    test(name, ass != eq, ass)
}
export default module
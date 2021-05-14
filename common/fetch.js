function _fetch(method, url, success, fail = false, send_data = false) {
    let params = { method: method, 
        mode: "no-cors",
        headers: ({"Content-Type": "text/plain"})
    }
    if (send_data) {
        params['body'] = JSON.stringify(send_data)
    }
    fetch(url, params).then((response) => response.json()
    ).then((res) => {
        if (res.success) {
        success(res)
        } else {
        if (fail) { fail(res) }
        }
    }).catch((err) => {
        alert('Failed to find Quando:Local ')
        console.log(err)
    })
}

export function get(url, success, fail, send_data = false) {
    _fetch("GET", url, success, fail, send_data)
}

export function post(url, success, fail, send_data = false) {
    _fetch("POST", url, success, fail, send_data)
}
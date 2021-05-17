function _fetch(method, url, success, fail = false, send_data = false) {
    let params = { method: method, 
        headers: ({"Content-Type": "text/plain"})
    }
    if (!['DELETE', 'PUT'].includes(method)) {
        // Can't DELETE/PUT in no-cors mode
        params['mode'] = "no-cors"
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

export function Get(url, success, fail, send_data = false) {
    _fetch("GET", url, success, fail, send_data)
}

export function Post(url, success, fail, send_data = false) {
    _fetch("POST", url, success, fail, send_data)
}

export function Delete(url, success, fail, send_data = false) {
    _fetch("DELETE", url, success, fail, send_data)
}

export function Put(url, success, fail, send_data = false) {
    _fetch("PUT", url, success, fail, send_data)
}
import originJsonp from 'jsonp'

// 因为下载的jsonp不支持data，data是拼到url上的，所以自己封装一下
export default function jsonp(url, data, option) {
    // 如果url没有?则加上?，如果有则后面补&再连接
    url += (url.indexOf('?') < 0 ? '?':'&') + param(data)

    return new Promise((resolve, reject) => {
        originJsonp(url, option, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
}

//
export function param(data) {
    let url = ''
    for(var k in data) {
        let value = data[k] !== undefined ? data[k] : ''
        // url += `&${k}=${encodeURIComponent(value)}`
        url += '&' + k + '=' + encodeURIComponent(value)
    }
    // 截取掉第一个&符号
    return url ? url.substring(1) : ''
}
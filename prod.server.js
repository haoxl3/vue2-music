var express = require('express')
var config = require('./config/index')
var axios = require('axios')

//小型服务，执行node prod.server.js
var app = express()
var apiRoutes = express.Router()
apiRoutes.get('/getDiscList', function(req, res) {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    // 通过它将数据传给浏览器
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})
apiRoutes.get('/lyric', function(req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    var ret = response.data
    // 因为返回的数据为jsonp，要转其转为JSON数据
    if (typeof ret === 'string') {
      var reg = /^\w+\(({[^()]+})\)$/
      var matches = ret.match(reg)
      if(matches){
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((e) => {
    console.log(e)
  })
})
app.use('/api', apiRoutes)

//路径
app.use(express.static('./dist'))

//端口
var port = process.env.PORT || config.build.port 
module.exports = app.listen(port, function(err){
    if (err) {
        console.log(err)
        return 
    }
    console.log('listening at http://localhost:'+port+'\n')
})
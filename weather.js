
"use strict"


const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const iconv = require('iconv-lite')




// 定义一个类来保存天气的信息
// 城市名，值
const Weather = function() {
    this.name = ''
    this.value = ''
}

const log = function() {
    console.log.apply(console, arguments)
}

const weatherFromDiv = function(div, value) {
    const weather = new Weather()
    const e = cheerio.load(div)
    // .text() 获取文本信息
    weather.value = value
    weather.name = e('a').text()
    return weather
}


const saveWeathers = function(weathers) {
    const fs = require('fs')
    const path = 'weather.txt'
    //存在本地需要序列化
    const s = JSON.stringify(weathers, null, 2)
    //此处方法为异步读取：通过回调函数获得结果
    //js读取path文件内容并把值传给第三个参数（函数）
    fs.writeFile(path, s, function(error) {
        if (error !== null) {
            log('写入文件错误', error)
        } else {
            log('保存成功')
        }
    })
}

const weathersFromUrl = function(url) {
    // request 从一个 url 下载数据并调用回调函数
    request(url, function(error, response, body) {
        // 检查请求是否成功, statusCode 200 是成功的代码
        if (error === null && response.statusCode == 200) {
            //待实现
            // const a = cheerio.load(body)
            // const allMeta = a('meta')
            // const firstMeta = allMeta[5]
            // const charset = a(firstMeta).html()
            //以指定编码将body内容进行转码
            body = iconv.decode(body, url.charset)
            // 重新加载body内容
            const e = cheerio.load(body)
            const weathers = []
            //获取所有的城市名.指数集合
            const cityDivs = e('.td-2nd')
            const valueDivs = e('.td-3rd')
            // log(cityDivs)

            //遍历城市名集合
            for (let i = 0; i < cityDivs.length; i++) {
                let cityDiv = cityDivs[i]
                let cityValue = valueDivs[i]
                const div = e(cityDiv).html()
                //获取原始数据
                let value = e(cityValue).text()
                const cityName = weatherFromDiv(div, value)
                weathers.push(cityName)
            }
            // log(weathers)
            // 保存 weathers 数组到文件中
            saveWeathers(weathers)
        } else {
            log('请求失败 ', error)
        }
    })
}


const ssw_main = function() {
    const url = {
        url: 'http://tianqi.2345.com/air-rank-rev.htm',
        encoding: null,
        charset: 'gbk',
    }
    //下载网页，解析网页信息，保存到文件
    weathersFromUrl(url)
}


// 程序开始主函数
ssw_main()

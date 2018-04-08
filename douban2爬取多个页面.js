/**
 * @Date:   2018-03-13T14:55:17+08:00
 * @Last modified time: 2018-03-27T14:45:02+08:00
 */



 "use strict"

//引用字符串空格处理函数
var strip_right = function(s) {
    var num = 0
    var len = s.length
    for (var i = len - 1; i > -1; i--) {
        if (s[i] != " ") {
            num = i + 1
            //log(num)
            break
        }
    }
    var str = s.slice(0, num)
    //log(str)
    return str
}
var strip_left = function(s) {
    var num = s.length
    for (var i = 0; i < s.length; i++) {
        if (s[i] != " ") {
            num = i
            //log(num)
            break
        }
    }
    var str = s.slice(num)
    //log(str)
    return str
}
var strip = function(s) {
    var str = strip_right(strip_left(s))
    log(s)
    return str
}

 const request = require('request')
 const cheerio = require('cheerio')
 const fs = require('fs')

 // - 如何爬所有的 top250 页面


 // 定义一个类来保存音乐的信息
 // 这里只定义了 3 个要保存的数据
 // 分别是  音乐名 作者 封面图片地址
 const Music = function() {
     this.name = ''
     this.author = ''
     this.imgUrl = ''
 }


 const log = function() {
     console.log.apply(console, arguments)
 }

/*
<tr class="item">
    <td width="100" valign="top">
        <a class="nbg" href="https://music.douban.com/subject/2995812/" onclick="moreurl(this,{i:'0',query:'',subject_id:'2995812',from:'music_subject_search'})" title="Jason Mraz - We Sing. We Dance. We Steal Things.">
            <img src="https://img3.doubanio.com/view/subject/s/public/s2967252.jpg" alt="Jason Mraz - We Sing. We Dance. We Steal Things." style="width: 80px; max-height: 120px;">
        </a>
    </td>
    <td valign="top">
        <div class="pl2">
            <a href="https://music.douban.com/subject/2995812/" onclick="moreurl(this,{i:'0',query:'',subject_id:'2995812',from:'music_subject_search'})">
            We Sing. We Dance. We Steal Things.
       </a>
            <p class="pl">Jason Mraz / 2008-05-13 / Import / Audio CD / 民谣</p>
            <div class="star clearfix"><span class="allstar45"></span><span class="rating_nums">9.1</span>
                <span class="pl">
                    (
                            100663人评价
                    )
                </span>
            </div>
        </div>
    </td>
</tr>
*/
 const musicFromDiv = function(div) {
     // 这个函数来从一个音乐 div 里面读取音乐信息
     const music = new Music()
     // 使用 cheerio.load 函数来返回一个可以查询的特殊对象
     const e = cheerio.load(div)
     // log('e', e)
     // 然后就可以使用 querySelector 语法来获取信息了
     // .text() 获取文本信息
     var content = e('.pl2').find('a').text().split('\n')[1]
     music.name = strip(content)
     music.author = e('.pl').text().split('/')[0]
     const nbg = e('.nbg')
     // 元素的属性用 .attr('属性名') 确定
     //查找指定的单个元素用find（'元素名'）
     music.imgUrl = nbg.find('img').attr('src')
     return music
 }


 const saveMusics = function(musics) {
     // 这个函数用来把一个保存了所有音乐对象的数组保存到文件中
     const fs = require('fs')
     const path = 'douban2.txt'
     // 第三个参数是 缩进层次
     const s = JSON.stringify(musics, null, 2)
     fs.writeFile(path, s, function(error) {
         if (error !== null) {
             log('写入文件错误', error)
         } else {
             log('保存成功')
         }
     })
 }


 const downloadCovers = function(musics) {
     for (let i = 0; i < musics.length; i++) {
         const m = musics[i]
         const url = m.imgUrl
         // request('http://abc.com/abc.png').pipe(fs.createWriteStream('abc.png'));
         const path = m.name + '.jpg'
         //（ssw）
         request(url).pipe(fs.createWriteStream(path)
                .on('error', function(err){
                })
            )
     }
  }

 const MusicsFromUrl = function(url) {
     // request 从一个 url 下载数据并调用回调函数
     request(url, function(error, response, body) {
         // 回调函数的三个参数分别是  错误, 响应, 响应数据
         // 检查请求是否成功, statusCode 200 是成功的代码
         if (error === null && response.statusCode == 200) {
             // cheerio.load 用字符串作为参数返回一个可以查询的特殊对象（ssw）
             // body 就是 html 内容
             const e = cheerio.load(body)
             const musics = []
             // 查询对象的查询语法和 DOM API 中的 querySelector 一样（ssw）
             const musicDivs = e('.item')
             // log('musicDivs', musicDivs)
             //（对象能像数组一样遍历且有length）
             for(let i = 0; i < musicDivs.length; i++) {
                 let element = musicDivs[i]
                 // log('element的内容是', element)
                 // 获取 div 的元素并且用 musicFromDiv 解析
                 // 然后加入 musics 数组中
                 const div = e(element).html()
                 const m = musicFromDiv(div)
                 musics.push(m)
             }
             // 保存 musics 数组到文件中
             saveMusics(musics)
             downloadCovers(musics)
         } else {
             log('请求失败 ', error)
         }
     })
 }


 const ssw_main = function() {
     // 这是主函数
     // 下载网页, 解析出音乐信息, 保存到文件
     //0,25,50,75,100
     var i = 0
     while (i < 150) {
         log(i)
         var url = 'https://music.douban.com/top250?start=' + i
         log(url)
         MusicsFromUrl(url)
         i += 25
         log(i)
     }
 }


 // 程序开始
 ssw_main()

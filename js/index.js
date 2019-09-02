var EventCenter = {
    on: function(type, handler){
        $(document).on(type, handler)
    },
    fire: function(type, data){
        $(document).trigger(type, data)
    }
}

var Fm = {
    init: function(){
        this.albumData
        this.$cover = $('.page-music .aside>figure')
        this.$playBtn = $('.page-music .aside .play-btn')
        this.$next = $('.page-music .aside .next-btn')
        this.$albumName = $('.page-music .detail>.album')
        this.$songName = $('.page-music .detail>.songname')
        this.$author = $('.page-music .detail>.author')
        this.$currentTime = $('.page-music .detail .current-time')
        this.$lyric = $('.page-music .detail .lyric p')
        this.$progress = $('.page-music .bar-progress')
        this.$bg = $('.bg')
        this.audio = new Audio()
        this.audio.autoplay = true
        this.clear
        this.lyricObj = []

        this.bind()
    },
    bind: function(){
        var _this = this
        EventCenter.on('albumSelected', function(e, data){
            _this.albumData = data
            _this.loadMusic()
        })
        

        _this.$playBtn.on('click', function(){
            if($(this).hasClass('icon-play')){
                $(this).removeClass('icon-play').addClass('icon-pause')
                _this.audio.pause()
                clearInterval(_this.clear)
            }else{
                $(this).removeClass('icon-pause').addClass('icon-play')
                _this.audio.play()
            }
        })
        
        _this.$next.on('click', function(){
            _this.loadMusic()
            _this.$playBtn.removeClass('icon-pause').addClass('icon-play')
            clearInterval(_this.clear)
        })

        _this.audio.addEventListener('playing', function(){
            _this.$playBtn.removeClass('icon-pause').addClass('icon-play')
            _this.clear = setInterval(function(){ 
                _this.updateTime()
                _this.updateProgress()
            },1000)
        })

    },
    loadMusic: function(){
        var _this = this
        $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{
            channel: _this.albumData.channel_id
        }).done(function(ret){
            _this.setMusic(ret['song'][0])
            _this.loadLyric(ret['song'][0]['sid'])
        })
    },
    setMusic: function(song){
        var _this = this
        _this.$cover.css('background-image','url('+song.picture+')')
        _this.$albumName.text(_this.albumData.channel_name)
        _this.$songName.text(song.title)
        _this.$author.text(song.artist)
        _this.$bg.css('background-image','url('+song.picture+')')
        _this.audio.src = song.url

        // if(!_this.albumData.firstLoad){
        _this.$playBtn.removeClass('icon-pause').addClass('icon-play')
        
    },

    updateTime: function(){
        var _this = this  
        var minutes = Math.floor(Math.floor(_this.audio.currentTime)/60)
        var seconds = Math.floor(_this.audio.currentTime)%60
        seconds = seconds<10? '0'+seconds : seconds
        _this.$currentTime.text(minutes+":"+seconds)

        // console.log(_this.lyricObj)
        var thisTime = _this.lyricObj['0'+minutes+':'+seconds]
        if(thisTime){
            _this.$lyric.text(_this.lyricObj['0'+minutes+':'+seconds])
            // _this.$lyric.text(_this.lyricObj['0'+minutes+':'+seconds]).boomText('fadeIn')
        }
    },
    updateProgress: function(){
        var _this = this  
        var percent = _this.audio.currentTime/_this.audio.duration*100+'%'
        this.$progress.css('width', percent)
    },

    loadLyric: function(sid){
        var _this = this
        $.getJSON('https://jirenguapi.applinzi.com/fm/getLyric.php', {
            sid: sid
        }).done(function(ret){
            var lyricObj = []
            var lyricArr = ret.lyric.split(/\n/g)
            lyricArr.forEach(function(line){
                var timeArr = line.match(/\d{2}:\d{2}/g)
                var lyricStr = line.replace(/\[.+?\]/g,'')
                if(Array.isArray(timeArr)){
                    timeArr.forEach(function(time){
                        _this.lyricObj[time] = lyricStr
                    })
                }
            })
        }).fail(function(ret){
            _this.$lyric.text('音乐来自百度FM')
        })
    },

    setLyric: function(){

    }

}

var Footer = {
    init: function(){
        this.albumCoverWidth = $(window).height()*22/100
        this.liMargin = $(window).height()*2/100
        this.liWidth = this.albumCoverWidth+this.liMargin*2
        this.datalength
        this.isToEnd = false
        this.isToStart = true
        this.isAnimate = false
        this.$box = $('section>footer .box')
        this.$li = $('section>footer .box>li')
        this.$left = $('footer .icon-backward')
        this.$right = $('footer .icon-forward')
        this.$albumList = $('footer .album-list')
        this.bind()
    },
    bind: function(){
        var _this = this
        _this.getData(function(datas){
            _this.datalength = datas.length
            datas.forEach(function(item){
                _this.render(item)
            })
            _this.setStyle()
            // _this.$box.find('li').eq(2).addClass('li-hover')
            // EventCenter.fire('albumSelected', {
            //     'channel_id': datas[2].channel_id,
            //     'channel_name': datas[2].channel_name,
            //     'firstLoad': true
            // })            
        })

        _this.$right.on('click', function(){
            if(_this.isToEnd) return
            if(_this.isAnimate) return

            var rowCount = Math.floor(_this.$albumList.width()/_this.liWidth)
            _this.isAnimate = true
            _this.$box.animate({
                'left': '-='+rowCount*parseInt(_this.liWidth)
            }, 500, function(){
                if(_this.$albumList.width()-parseInt(_this.$box.css('left'))>=_this.datalength*_this.liWidth){
                    _this.isToEnd = true
                }
                _this.isToStart = false
                _this.isAnimate = false
            })
            
        })

        _this.$left.on('click', function(){
            if(_this.isToStart) return
            if(_this.isAnimate) return

            var rowCount = Math.floor(_this.$albumList.width()/_this.liWidth)  
            _this.isAnimate = true
            _this.$box.animate({
                'left': '+='+rowCount*parseInt(_this.liWidth)
            }, 500, function(){
                _this.isToEnd = false
                if(parseInt(_this.$box.css('left'))===0){
                    _this.isToStart = true
                }
                _this.isAnimate = false
            })
        })

        _this.$box.on('click', 'li', function(){

            _this.$box.find('.li-hover').removeClass('li-hover')
            $(this).addClass('li-hover')

            EventCenter.fire('albumSelected', {
                'channel_id': $(this).find('.album-cover').attr('channel_id'),
                'channel_name': $(this).find('.album-cover').attr('channel_name'),
                // 'firstLoad': false
            })
        })
    },

    getData: function(callback){
        $.getJSON('//jirenguapi.applinzi.com/fm/getChannels.php')
        .done(function(ret){
            callback(ret.channels)
        }).fail(function(){
            console.log('failed..')
        })
        
    },
    render: function(data){
        var _this = this
        var text = `<li>
                        <figure channel_id="" class="album-cover"></figure>
                        <h3 class="album-name"></h3>
                    </li>`
        var $node = $(text)
        
        $node.css({
            'margin': _this.liMargin
        })

        $node.find('.album-cover').css({
            'background-image': 'url('+data.cover_small+')',
            'width': _this.albumCoverWidth
        })
        $node.find('.album-cover').attr('channel_id', data.channel_id)
        $node.find('.album-cover').attr('channel_name', data.name)
        $node.find('.album-name').text(data.name)
        _this.$box.append($node)
    },
    setStyle: function(){
        var _this = this
        _this.$box.width(_this.datalength*_this.liWidth)
    }

}

var App = {
    init: function(){
        Footer.init()
        Fm.init()
    },
    bind: function(){

    }
}

App.init()

// $(window).on('resize',function(){
//     window.location.reload()
// })



// 插件 
// 使用 $('p').boomText('fadeIn')
$.fn.boomText = function(type){
    type = type||'rollIn'
    this.html(function(){
        var arr = $(this).
        text()
        .split('')
        .map(function(word){
            '<span style="display:inline-block">'+word+'</span>'
        })
        
        return arr.join('')
    })

    var $boomTexts = $(this).find('span')
    var index = 0
    var clock = setInterval(function(){
        $boomTexts.eq(index).addClass('animate'+type)
        index++
        if(index >= $boomTexts.length){
            clearInterval(clock)
        }
    }, 300)
}

var EventCenter = {
    on: function(type, handler){
        $(document).on(type, handler)
    },
    fire: function(type, data){
        $(document).trigger(type, data)
        console.log(data)
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
        })

        _this.$right.on('click', function(){
            if(_this.isToEnd) return
            if(_this.isAnimate) return

            var rowCount = Math.floor(_this.$albumList.width()/_this.liWidth)
            _this.isAnimate = true
            console.log(_this.liWidth)
            console.log(rowCount)
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
            console.log(_this.liWidth)
            console.log(rowCount)
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
            console.log(this)
            EventCenter.fire('albumSelected', {
                'channel_id': $(this).find('.album-cover').attr('channel_id')
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

    },
    bind: function(){

    }
}

Footer.init()

$(window).on('resize',function(){
    window.location.reload()
})

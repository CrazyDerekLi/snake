/**
 * Created by Derek on 2014/4/24.
 */
(function($){
    $.SNAKE_DIR = {
        left:[-1,0],
        right:[1,0],
        up:[0,-1],
        down:[0,1]
    };

    $.Snake = function(option){

        var tools = {
            //复制属性
            copy:function(original,clone){
                if(typeof(original) != "object")
                    return;
                for(var key in original){
                    clone[key] = original[key];
                }
            },
            //计算随机位置
            computeRandomPosition:function(x,y,length){
                var newX = Math.floor(Math.random()*(x-length*2));
                var newY = Math.floor(Math.random()*(y-length*2));
                return  {
                    x:newX+length,
                    y:newY+length
                };
            },
            //数组是否包含元素
            containsElement:function(array,element,keys){
                var flag = false;
                for(var i = 0;i<array.length;i++){
                    var cFlag = true;
                    var ele = array[i];
                    for(var j= 0;j<keys.length;j++){
                        var key = keys[j];
                        if(element[key]!=ele[key]){
                            cFlag = false;
                            break;
                        }
                    }
                    if(cFlag){
                        flag = true;
                        break;
                    }
                }
                return flag;
            },
            //是否为PC浏览
            is_pc:function(){
                var os = ["Android","iPhone","Windows Phone","iPod","BlackBerry","MeeGo","SymbianOS"];
                // 其他类型的移动操作系统类型，自行添加
                var info = navigator.userAgent;
                var len = os.length;
                for (var i = 0; i < len; i++) {
                    if (info.indexOf(os[i]) > 0){
                        return false;
                    }
                }
                return true;
            }
        };

        var box = {
            foodColorStatus:0,
            //初始化box----------------------------------1
            _initBox:function(setting){
                var initLength = this.setting.initLength;
                tools.copy(setting,this.setting);
                this.setting.initLength = this.setting.initLength<initLength?initLength:this.setting.initLength;
                var selector = "#"+this.setting.id;
                var box = $(selector);
                if(box.length<1)    return false;
                this.canvasDOM = document.getElementById(this.setting.id);
                this.context2D = this.canvasDOM.getContext("2d");
                this.xMax = box.width()/this.setting.size;
                this.yMax = box.height()/this.setting.size;
                return true;
            },
            //画box
            drawBox:function(setting){
                if(!this._initBox(setting)) return false;
                var snakeList = this._initSnakeList();
                this.addFood(snakeList);
                this._drawSnake(snakeList,this.setting.dir);
                return snakeList;
            },
            //初始化snakeList
            _initSnakeList:function(){
                var p = tools.computeRandomPosition(this.xMax,this.yMax,this.setting.initLength);
                var snakeList = [];
                for(var i = 0;i<this.setting.initLength;i++){
                    var body = {
                        x:-this.setting.dir[0]*i + p.x,
                        y:-this.setting.dir[1]*i + p.y
                    };
                    snakeList.push(body);
                }
                return snakeList;
            },
            canvasDOM:null,
            context2D:null,
            //添加Food
            addFood:function(snakeList){
                this.food = this._addFood(snakeList);
            },
            //画Food
            _drawFood:function(){
                var step = this.setting.size;

                this.context2D.beginPath();
                console.log(this.foodColorStatus);
                switch (this.foodColorStatus){
                    case 0:
                    case 1:
                    case 2: this.context2D.fillStyle="#D00";break;
                    case 3:
                    case 8:
                    case 9:
                    case 4: this.context2D.fillStyle="#D22";break;
                    case 5:
                    case 7: this.context2D.fillStyle="#D44";break;
                    case 6: this.context2D.fillStyle="#D88";break;

                }
                this.context2D.fillRect(this.food.x*step, this.food.y*step, step, step);

                this.context2D.stroke();
                this.foodColorStatus = (this.foodColorStatus+1)%10;
            },
            food:null,
            //内部添加food方法
            _addFood:function(snakeList){
                var p = tools.computeRandomPosition(this.xMax,this.yMax,0);
                if(tools.containsElement(snakeList,p,["x","y"])){
                    p = this._addFood(snakeList);
                }
                return p;
            },
            //内部方法画背景
            _drawBg:function(x,y){
                var _2D = this.context2D,
                    _canvasDOM = this.canvasDOM;
                _2D.clearRect(0,0,_canvasDOM.width,_canvasDOM.height);
                var step = this.setting.size;
                for(var i = 0; i < x;i++){
                    _2D.beginPath();
                    _2D.strokeStyle = "#e7e7e7";
                    _2D.moveTo(i*step,0);
                    _2D.lineTo(i*step,_canvasDOM.height);
                    _2D.stroke();
                }
                for(var j = 0; j < y;j++){
                    _2D.beginPath();
                    _2D.strokeStyle = "#e7e7e7";
                    _2D.moveTo(0,j*step);
                    _2D.lineTo(_canvasDOM.width,j*step);
                    _2D.stroke();
                }
            },
            //内部方法画蛇身
            _drawSnake:function(snakeList,dir){
                var headStr = dir[0]==1?"right":dir[0]==-1?"left":dir[1]==1?"down":dir[1]==-1?"up":"down";
                this._drawBg(this.xMax,this.yMax);
                this._drawFood();
                for(var i=snakeList.length-1;i>=0;i--){
                    var body = snakeList[i];
                    var step = this.setting.size;
                    var _2d = this.context2D;


                    if(i==0){
                        var img = new Image();
                        var size = step*1.2;
                        var x = body.x*step - (size-step)/2;
                        var y = body.y*step - (size-step)/2;
                        img.onload = function(){
                            _2d.drawImage(img,x, y, size, size);
                        };
                        img.src = "images/head_"+headStr+".png";
                    }else if(i==snakeList.length-1){
                        _2d.beginPath();
                        _2d.fillStyle = '#044403';
                        _2d.arc(body.x*step+step/2,body.y*step+step/2,step/2,0,Math.PI*2,true);
                        _2d.fill();
                        _2d.stroke();
                    }else{
                        _2d.beginPath();
                        _2d.fillStyle = '#044403';
                        var r = step*3/5-i*0.05;
                        r = r<(step/2+1)?step/2+1:r;
                        _2d.arc(body.x*step+step/2,body.y*step+step/2,r,0,Math.PI*2,true);
                        _2d.fill();
                        _2d.stroke();
                    }

                    /*
                    this.context2D.beginPath();
                    this.context2D.fillStyle = i==0?'red':'yellow';
                    this.context2D.fillRect(body.x*step, body.y*step, step, step);
                    this.context2D.stroke();
                    */
                }
            },
            //设置
            setting:{
                size:10,
                id:null
            }
        };
        var snake = {
            //构造器
            initialize:function(config){
                tools.copy(config,this.attributes);
                if(typeof (this.attributes.dir) ==="string"){
                    this.attributes.dir = $.SNAKE_DIR[this.attributes.dir];
                }
                this.attributes.lastDir = this.attributes.dir;
                this._initBox();

            },
            //内部方法初始化Box
            _initBox:function(){
                var boxSetting = {
                    id:this.attributes.boxId,
                    initLength:this.attributes.initLength,
                    dir:this.attributes.dir
                };
                if(this.attributes.boxSize>0){
                    boxSetting.size = this.attributes.boxSize;
                }
                this.snakeList = box.drawBox(boxSetting);
            },
            //config
            attributes:{
                initLength:3//初始化蛇身长度
                ,boxId:null//box的id
                ,boxSize:0
                ,timeStamp:200
                ,dir:"left"
                ,lastDir: $.SNAKE_DIR.up
            },
            //根据key获取属性值
            get:function(key){
                return this.attributes[key];
            },
            //设置属性
            set:function(obj){
                tools.copy(obj,this.attributes);
            },
            //snake数组
            snakeList:[],
            //记录interval
            interval:null,
            //创建interval
            createInterval:function(){
                var _this = this;
                return window.setInterval(function(){
                    _this.move();
                },_this.attributes.timeStamp);
            },
            //运行
            run:function(autoRun){
                this.interval = this.createInterval();
                this.bind();
                if(!autoRun){
                    this.stop();
                    $(".snake-button-space").html("开始");
                }
            },
            //重新运行
            restart:function(){
                this.snakeList = [];
                this.stop();
                this.initialize(this.attributes);
                $(".snake-button-space").html("开始");//alert("按空格键或点击开始按钮开始游戏！");
            },
            //暂停
            stop:function(){
                clearInterval(this.interval);
                this.interval = null;
            },
            //内部方法，绑定手机滑动事件
            _bindTouch:function(){
                var startX,startY,endX,endY,isMove,
                    _this = this,
                    ele = $("#"+this.attributes.boxId).get(0);
                ele.addEventListener('touchstart', function(e){
                    var touch = e.touches[0];
                    startX = touch.pageX;
                    startY = touch.pageY;
                    isMove = false;
                }, false);
                ele.addEventListener('touchmove',function(e){isMove = true;}, false);
                ele.addEventListener('touchend', function(e){
                    var _bHasTouches = !!e.changedTouches;
                    endX = (_bHasTouches) ? e.changedTouches[0].screenX : e.screenX;
                    endY = (_bHasTouches) ? e.changedTouches[0].screenY : e.screenY;
                    if(isMove){
                        var newX = endX - startX,
                            newY = endY - startY;
                        if(newY==0 || Math.abs(newX/newY)>1){
                            newX>0?/*right*/_this.changeDir($.SNAKE_DIR.right,e):/*left*/_this.changeDir($.SNAKE_DIR.left,e);
                        }else{
                            newY>0?/*down*/_this.changeDir($.SNAKE_DIR.down,e):/*up*/_this.changeDir($.SNAKE_DIR.up,e);
                        }
                    }
                }, false);
            },
            //绑定按钮事件
            _bindBtnEvent:function(eventString){
                var _this = this;
                this._bindDirEvent("up",eventString);
                this._bindDirEvent("down",eventString);
                this._bindDirEvent("left",eventString);
                this._bindDirEvent("right",eventString);
                $(".snake-button-space").bind(eventString,function(e){
                    _this.stopAndContinue(e);
                });
                $(".snake-button-restart").bind(eventString,function(e){
                    _this.restart();
                });
            },
            //改变方向的事件
            _bindDirEvent:function(dir,event){
                var _this = this;
                $(".snake-button-"+dir).bind(event,function(e){
                    _this.changeDir($.SNAKE_DIR[dir],e);
                });
            },
            //绑定键盘事件
            _bindKeyDown:function(){
                var _this = this;
                $(document.body).on('keydown', function(e) {
                    switch (e.which) {
                        case 37://left
                        case 65:            _this.changeDir($.SNAKE_DIR.left,e);break;
                        case 38://up
                        case 87:            _this.changeDir($.SNAKE_DIR.up,e);break;
                        case 39://right
                        case 68:            _this.changeDir($.SNAKE_DIR.right,e);break;
                        case 40://down
                        case 83:            _this.changeDir($.SNAKE_DIR.down,e);break;
                        case 32:/*space*/   _this.stopAndContinue(e);break;
                    }
                });
            },
            //暂停和继续
            stopAndContinue:function(e){
                e.preventDefault();
                if(this.interval){
                    $(".snake-button-space").html("继续");
                    this.stop();
                }else{
                    $(".snake-button-space").html("暂停");
                    this.interval = this.createInterval();
                }
            },
            //绑定鼠标事件
            _bindMouseDown:function(){
                if(tools.is_pc()){
                    var body = $(document.body);
                    if(/firefox/.test(navigator.userAgent.toLowerCase())){
                        body.css("-moz-transform","scale(0.6)").css("-moz-transform-origin","top left");
                    }else{
                        body.css("zoom","0.6");
                    }
                    $(".snake-box").addClass("isPC");
                    this._bindBtnEvent("mousedown");
                }
            },
            //绑定事件
            bind:function(){
                this._bindTouch();
                this._bindBtnEvent("touchstart");
                this._bindKeyDown();
                this._bindMouseDown();
            },
            //改变方向的方法
            changeDir:function(dir,e){
                e.preventDefault();
                var newNode = this.getMoveNode(dir);
                var flag = this.snakeList[1].x==newNode.x&&this.snakeList[1].y==newNode.y;
                if(flag){
                    this.attributes.dir = this.attributes.lastDir;
                }else{
                    this.attributes.lastDir = this.attributes.dir;
                    this.attributes.dir = dir;
                }
            },
            //获取移动节点
            getMoveNode:function(dir){
                var newX = this.snakeList[0].x+dir[0];
                var newY = this.snakeList[0].y+dir[1];
                newX = newX<0 ? box.xMax-1 : newX > box.xMax-1 ? 0 : newX;
                newY = newY<0 ? box.yMax-1 : newY > box.yMax-1 ? 0 : newY;
                return {
                    x:newX,
                    y:newY
                };
            },
            //移动的方法
            move:function(){
                var newNode = this.getMoveNode(this.attributes.dir);
                var isNotEatFood = !(box.food&&box.food.x==newNode.x&&box.food.y==newNode.y);
                if(tools.containsElement(this.snakeList,newNode,["x","y"])){
                    alert("游戏结束");
                    this.restart();
                }else{
                    this.snakeList.splice(0,0,newNode);
                    if(isNotEatFood){
                        this.snakeList.splice(this.snakeList.length-1,1);
                    }else{
                        //console.log(box.food);
                        box.addFood(this.snakeList);
                    }
                    box._drawSnake(this.snakeList,this.attributes.dir);
                }
                this.attributes.lastDir = this.attributes.dir;
            }
        };
        //执行初始化方法
        snake.initialize(option);
        //执行run方法
        snake.run(false);
        //返回初始化好的snake对象
        return snake;
    }
})(jQuery);
// 面向对象
// 通过增加div使身体变长
// 深蓝色活动区域由行列（30）组成

// 初始化数据
var sw = 20, // 方块宽
    sh = 20, // 方块高
    tr = 30, // 行
    td = 30, // 列
    snake = null; // 蛇实例对象
    directionNum = { // 蛇走的方向
        left: {
            x: -1,
            y: 0,
            rotate: 180 // 蛇头旋转角度
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        top: {
            x: 0,
            y: -1,
            rotate: -90
        },
        bottom: {
            x: 0,
            y: 1,
            rotate: 90
        }
    },
    food = null, // 食物实例对象
    game = null;

// 生产方块 坐标xy 单独样式className
function Square(x,y,classname) {
    // 0，0 1，0
    // 20，0 2，0
    // 40，0 3，0
    this.x = x;
    this.y = y;
    this.class = classname;

    this.dom = document.createElement('div'); // 方块   
    this.parent = document.getElementById('snakeWrap'); // 方块父级
}

// 创建、添加具体方块(蛇头、蛇身、食物)
Square.prototype.create = function () {
    this.dom.style.position = 'absolute';
    this.dom.style.width = sw + 'px';
    this.dom.style.height = sh + 'px';
    this.dom.style.left = this.x * sw + 'px';
    this.dom.style.top = this.y * sh + 'px';
    this.dom.className = this.class;
    this.parent.appendChild(this.dom);
}

// 移除食物方块
Square.prototype.remove = function () {
    this.parent.removeChild(this.dom);
}

// 生产蛇
function Snake() {
    this.head = null; // 蛇头
    this.footer = null; // 蛇尾
    this.pos = []; // 蛇的每一个小方块位置(判断触碰食物、边界，防止随机生成食物的重叠) 二维数组
    this.direction = { // 默认方向
        x: 1,
        y: 0
    }
}

// 初始化
Snake.prototype.init = function () {
    // 创建蛇头
    var snakeHead = new Square(2,0,'snakeHead');
    snakeHead.create();
    this.head = snakeHead; // 更新蛇头
    this.pos.push([2,0]); // 更新位置
    // console.log(this.pos)

    // 创建蛇身体
    var snakeBody1 = new Square(1,0,'snakeBody');
    snakeBody1.create();
    this.pos.push([1,0]); // 更新位置
    var snakeBody2 = new Square(0,0,'snakeBody');
    snakeBody2.create();
    this.footer = snakeBody2;
    this.pos.push([0,0]); // 更新位置

    // 形成链表关系
    snakeHead.previous = null;
    snakeHead.next = snakeBody1;
    snakeBody1.previous = snakeHead;
    snakeBody1.next = snakeBody2;
    snakeBody2.previous = snakeBody1;
    snakeBody2.next = null;
    
}

// 获取蛇头的下一个位置对应的元素，根据元素做不同的事情
Snake.prototype.getNextPos = function () {
    var nextPos = [
        this.head.x + this.direction.x,
        this.head.y + this.direction.y,
    ]
    // console.log(nextPos);
    
    // 下个点出现的情况：自己 结束
    var self = false; // 默认不是自己
    // 三个参数：第一个参数是遍历的数组内容，第二个参数是对应的数组索引，第三个参数是数组本身
    this.pos.forEach(function (item) {
        // 对象比较：值和引用地址
        if (item[0] == nextPos[0] && item[1] == nextPos[1]) {
            self = true;
        }
    })
    if (self) {
        console.log('碰自己');
        this.handle.over.call(this);
        return;
    } // 默认向左改成向右，测试

    // 下个点出现的情况：边界 结束
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td -1 || nextPos[1] > tr -1) {
        console.log('碰边界');
        this.handle.over.call(this);
        return;
    }

    // 下个点出现的情况：食物 增长
    if (food && food.x == nextPos[0] && food.y == nextPos[1]) {
        console.log('碰食物');
        this.handle.eat.call(this);
        return;
    }

    // 下个点出现的情况：无 继续走
    // 注意this指向 实例蛇
    this.handle.move.call(this, false);
}

// 撞到时候执行的函数
Snake.prototype.handle = {
    move: function (remove) { // remove控制是否删除
        // console.log(this); // 需要继续指向实例
        // console.log('继续走');
        // 障眼法，掐头去尾做运动
        // 创建新的body，放在蛇头位置
        var newBody = new Square(this.head.x, this.head.y, 'snakeBody');
        this.head.remove(); // 删除旧蛇头
        newBody.create(); // 测试一下
        // 更新链表关系
        newBody.next = this.head.next;
        newBody.next.previous = newBody;
        newBody.previous = null;     
        
        // 创建新的蛇头，放在运动的下一个点
        var newHead = new Square(this.head.x + this.direction.x,this.head.y + this.direction.y,'snakeHead');
        newHead.create();
        // 更新链表关系
        newHead.next = newBody;
        newHead.previous = null;
        newBody.previous = newHead;

        // 更改蛇头样式
        newHead.dom.style.transform = 'rotate(' + this.direction.rotate + 'deg)';

        // 蛇头更新
        this.head = newHead;
        // 坐标更新
        this.pos.unshift([this.head.x, this.head.y]);
        

        if (!remove) { // remove为true需要删除
            this.footer.remove();
            this.footer = this.footer.previous;
            this.pos.pop();
        }
    },
    eat: function () {
        this.handle.move.call(this, true);
        // 随机再生成一个食物
        food.square.remove();
        food.init();
        game.score ++;
    },
    over: function () {
        // console.log('游戏结束')
        game.over();
    }
}
snake = new Snake();
// snake.init();
// snake.getNextPos();

// 创建食物
function Food() {
    // 食物方块的随机坐标
    this.x = null;
    this.y = null;
    this.square = null;
}
// createFood();

// 食物初始化
Food.prototype.init = function () {
    var key = true; // 循环跳出的条件，true表示食物和蛇重叠，则继续循环随机产生，false就不循环了
    while(key) {
        this.x = Math.round(Math.random()*(td - 1)); // 四舍五入后的随机数
        this.y = Math.round(Math.random()*(tr - 1));
        snake.pos.forEach(function (item) {
            // 判断是否能在蛇身上找到
            if (this.x != item[0] && this.y != item[1]) {
                key = false;
            }
        })   
    }
    var snakeFood = new Square(this.x, this.y, 'snakeFood');
    this.square = snakeFood
    snakeFood.create();
}
food = new Food();

// 创建游戏逻辑
function Game() { 
    this.timer = null;
    this.score = null;
}

// 初始化
Game.prototype.init = function () {
    snake.init();
    // snake.getNextPos();
    food.init();
    document.onkeydown = function (e) {
        // 向左走，注意不能正在往右走
        if (e.keyCode == 37 && snake.direction != directionNum.right) {
            snake.direction = directionNum.left;
        } else if (e.keyCode == 38 && snake.direction != directionNum.bottom) { // 向上走
            snake.direction = directionNum.top;
        } else if (e.keyCode == 39 && snake.direction != directionNum.left) { // 向右走
            snake.direction = directionNum.right;
        } else if (e.keyCode == 40 && snake.direction != directionNum.top) { // 向上走
            snake.direction = directionNum.bottom;
        }
    }

    this.start();
}

// 开始游戏
Game.prototype.start = function () {
    this.timer = setInterval(function() {
        snake.getNextPos();
    }, 200);
}

// 结束游戏
Game.prototype.over = function () {
    clearInterval(this.timer);
    alert('游戏结束，你的得分为' + this.score);
    // 游戏回到初始状态
    var snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';
    snake = new Snake();
    game = new Game();
    var startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';
}

// 暂停游戏
// 结束游戏
Game.prototype.pause = function () {
    clearInterval(this.timer);
}

// 启动整个程序
game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function () {
    startBtn.parentNode.style.display = 'none';
    game.init();
}

// 暂停整个程序
var pauseBtn = document.querySelector('.pauseBtn button');
var snakeWrap = document.getElementById('snakeWrap');
snakeWrap.onclick = function () {
    game.pause();
    pauseBtn.parentNode.style.display = 'block';
}

// 继续整个程序
pauseBtn.onclick = function () {
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}
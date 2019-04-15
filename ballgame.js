// var maxScore = "";
// if ( sessionStorage.getItem('high') != null ) {
//     maxScore = "" + sessionStorage.getItem('high');
//     alert(maxScore);
//     document.getElementById('high-value').innerText = "" + sessionStorage.getItem('high');
// };

var score = 0;
var playerLives = 5;
var wrongClickNumber = 0;

// timer
var startnum = 120;
var time = startnum; // TODO
function changeTime() {
    time--;
    var min = Math.floor(time / 60);
    var sec = time - min * 60;
    if (sec < 10) {
        var newText = min + ":0" + sec;
    } else {
        var newText = min + ":" + sec;
    }
    document.getElementById('timer').innerText = newText;
    let actTimerColor = 0; // TODO
    // timer color
    if (time < 21 && actTimerColor == 0) {
        actTimerColor++;
        document.getElementById('timer').classList.remove("greentime");
        document.getElementById('timer').classList.add("redtime");
    }
    if (time < 0) {
        alert("VÉGE A JÁTÉKNAK !  ");
        location.reload();
        // Store
        // sessionStorage.setItem("lastname", 12);
        // Retrieve
        // document.getElementById("result").innerHTML = sessionStorage.getItem("lastname");
        // if ( sessionStorage.getItem('high') == null || score > sessionStorage.getItem("high") ) {
        //     sessionStorage.setItem('high', score);
        //     document.getElementById('high-score').innerText = sessionStorage.getItem('high');
        // }

        // TODO culture club solution

    }
}
setInterval(changeTime, 1000);

class Ball {
    constructor(field, radius, speed, x, y) {
        this.field = field;
        this.r = radius;
        if (x === undefined) {
            this.posx = Math.random() * (field.width - this.r * 2) + this.r;
        } else {
            this.posx = x;
        }
        if (y === undefined) {
            this.posy = Math.random() * (field.height - this.r * 2) + this.r;
        } else {
            this.posy = y;
        }
        this.vx = Math.random() * speed * 2 - speed;
        this.vy = Math.random() * speed * 2 - speed;
        this.element = document.createElement('div');
        this.element.style.width = this.element.style.height = this.r * 2 + 'px';
        let r = Math.floor(Math.random() * 256),
            g = Math.floor(Math.random() * 256),
            b = Math.floor(Math.random() * 256);
        this.element.style.backgroundColor = `rgb(${r},${g},${b})`;
        this.updateElementPosition();
        // this.field.element.appendChild(this.element);
    }

    updateElementPosition() {
        this.element.style.top = this.posy - this.r + 'px';
        this.element.style.left = this.posx - this.r + 'px';
    }

    move() {
        this.posx += this.vx;
        this.posy += this.vy;
        this.updateElementPosition();
    }
}

class Field {
    constructor(element, w, h) {
        this.element = element;
        this.width = w;
        this.height = h;
        this.element.style.width = w + 'px';
        this.element.style.height = h + 'px';
        this.balls = [];
        this.currentLevel = 0;

        this.element.addEventListener('click', e => {
            if (e.target == this.element) {
                playerLives--;
                // alert(playerLives + livesHearts[playerLives]);
                // change hearts
                document.getElementsByClassName("hearts")[0].innerText = livesHearts[playerLives];

                //pointsDown
                score = score + levels[this.currentLevel].pointsDown;
                document.getElementById('actScore').innerText = score;
                // sound
                document.getElementById("wrongClick").play();
                // wrong click >>> adding new ball
                let b = new Ball(this, levels[this.currentLevel].ballRadius, levels[this.currentLevel].ballSpeed, e.offsetX, e.offsetY);
                this.balls.push(b);
                this.element.appendChild(b.element);
                // TODO playerLives check if == 0 ??? >>> end game !!!
                if (playerLives == 0) {
                    //   // TODO culture club solution
                    alert("NINCS TÖBB ÉLETED !!!");
                    location.reload();
                }

            } else {
                //pointsUp
                score = score + levels[this.currentLevel].pointsUp;
                document.getElementById('actScore').innerText = score;
                // sound
                document.getElementById("goodClick").play();
                // if good click >>> the ball disappear
                let b = this.balls.filter(b => b.element == e.target)[0];
                b.element.remove();
                this.balls.splice(this.balls.indexOf(b), 1);
                if (this.balls.length == 0) {
                    if (levels.length - 1 > this.currentLevel) {
                        this.currentLevel++;
                        // change on display current level number
                        document.getElementById('setlevel').innerText = this.currentLevel + 1;
                        this.populateLevel();
                    } else {
                        console.log('Gratulálunk!');
                    }
                }
            }
        });

        this.populateLevel();
    }

    populateLevel() {
        let level = levels[this.currentLevel];
        this.addBall(level.ballRadius, level.ballSpeed, level.ballCount);
    }

    addBall(radius, speed, n = 1) {
        for (var i = 0; i < n; i++) {
            let b = new Ball(this, radius, speed);
            this.balls.push(b);
            this.element.appendChild(b.element);
        }
    }

    simulateStep() {
        this.checkCollisions();
        this.balls.forEach(b => {
            b.move();
        });
    }

    checkCollisions() {
        // labdák a fallal
        this.balls.forEach(b => {
            // felső || alsó fal
            if (b.posy - b.r < 0 || b.posy + b.r > this.height) {
                b.vy *= -1;
            }
            // bal || jobb fal
            if (b.posx - b.r < 0 || b.posx + b.r > this.width) {
                b.vx *= -1;
            }
        });
        // labdák a labdákkal
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                let b1 = this.balls[i],
                    b2 = this.balls[j];
                let d = Math.sqrt(Math.pow(b1.posx - b2.posx, 2) + Math.pow(b1.posy - b2.posy, 2));
                if (d < b1.r + b2.r) {
                    [b1.vx, b2.vx, b1.vy, b2.vy] = [b2.vx, b1.vx, b2.vy, b1.vy];
                }
            }
        }
    }

    animationFrame() {
        this.simulateStep();
        requestAnimationFrame(() => {
            this.animationFrame();
        });
    }

    startSimulation() {
        requestAnimationFrame(() => {
            this.animationFrame();
        });
    }
}



document.addEventListener('DOMContentLoaded', () => {
    let field = new Field(document.getElementById('field'), 960, 600);
    field.startSimulation();
}, false);

const livesHearts = ["☠️", "♥", "♥ ♥", "♥ ♥ ♥", "♥ ♥ ♥ ♥"];

const levels = [{
        ballSpeed: 4,
        ballRadius: 45,
        ballCount: 10,
        pointsUp: 1,
        pointsDown: -2,
    },
    {
        ballSpeed: 4,
        ballRadius: 40,
        ballCount: 10,
        pointsUp: 2,
        pointsDown: -3,
    },
    {
        ballSpeed: 5,
        ballRadius: 35,
        ballCount: 10,
        pointsUp: 3,
        pointsDown: -4,
    },
    {
        ballSpeed: 6,
        ballRadius: 30,
        ballCount: 8,
        pointsUp: 4,
        pointsDown: -5,
    },
    {
        ballSpeed: 7,
        ballRadius: 25,
        ballCount: 8,
        pointsUp: 5,
        pointsDown: -6,
    },
    {
        ballSpeed: 8,
        ballRadius: 20,
        ballCount: 10,
        pointsUp: 6,
        pointsDown: -7,
    },
    {
        ballSpeed: 10,
        ballRadius: 20,
        ballCount: 10,
        pointsUp: 7,
        pointsDown: -8,
    },

];

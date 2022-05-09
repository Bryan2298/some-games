"use strict";
function asteroids() {
    const svg = document.getElementById("canvas"), canvas = svg.getBoundingClientRect();
    let rad = 0;
    let g = new Elem(svg, 'g')
        .attr("transform", "translate(300 300)");
    let ship = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:gold;stroke:#D3D3D3;stroke-width:3");
    const radToDeg = (rad) => rad * 180 / Math.PI + 90;
    let currentRotation = 0;
    const transformMatrix = (e) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);
    function rotateShip() {
        Observable.fromEvent(svg, "mousemove")
            .map(({ clientX, clientY }) => ({
            lookx: clientX - canvas.left + 1,
            looky: clientY - canvas.top + 1,
            x: transformMatrix(g).m41,
            y: transformMatrix(g).m42
        }))
            .map(({ lookx, looky, x, y }) => {
            currentRotation = radToDeg(Math.atan2(looky - y, lookx - x));
            g.attr("transform", "translate(" + x + " " + y + ")" +
                "rotate(" + currentRotation + ")");
            rad = Math.atan2(looky - y, lookx - x);
        })
            .subscribe(() => { });
    }
    function moveShip() {
        const shipObservable = Observable.interval(1), mousedown = Observable.fromEvent(svg, "mousedown"), mouseup = Observable.fromEvent(svg, "mouseup");
        mousedown
            .flatMap(() => shipObservable.takeUntil(mouseup)
            .map(() => {
            g.attr("transform", "translate(" + (transformMatrix(g).m41 + Math.cos(rad) * 2) + " " + (transformMatrix(g).m42 + Math.sin(rad) * 2) + ")" +
                "rotate(" + currentRotation + ")");
        }))
            .subscribe(() => { });
        shipObservable.filter(() => transformMatrix(g).m41 > canvas.width)
            .subscribe(() => g.attr("transform", "translate(0 " + transformMatrix(g).m42 + ")"));
        shipObservable.filter(() => transformMatrix(g).m41 < 0)
            .subscribe(() => g.attr("transform", "translate(600 " + transformMatrix(g).m42 + ")"));
        shipObservable.filter(() => transformMatrix(g).m42 > canvas.height)
            .subscribe(() => g.attr("transform", "translate(" + transformMatrix(g).m41 + " 0)"));
        shipObservable.filter(() => transformMatrix(g).m42 < 0)
            .subscribe(() => g.attr("transform", "translate(" + transformMatrix(g).m41 + " 600)"));
    }
    let spawnAsteroids = [];
    const smallAsteroid1 = new Elem(svg, 'circle')
        .attr("cx", 10).attr("cy", 10).attr("r", 20)
        .attr("style", "fill:grey;stroke:white;stroke-width:3");
    const smallAsteroid2 = new Elem(svg, 'circle')
        .attr("cx", 300).attr("cy", 0).attr("r", 20)
        .attr("style", "fill:grey;stroke:white;stroke-width:3")
        .attr("class", "asteroid");
    const smallAsteroid3 = new Elem(svg, 'circle')
        .attr("cx", 600).attr("cy", 0).attr("r", 20)
        .attr("style", "fill:grey;stroke:white;stroke-width:3");
    const smallAsteroid4 = new Elem(svg, 'circle')
        .attr("cx", 0).attr("cy", 300).attr("r", 20)
        .attr("style", "fill:grey;stroke:white;stroke-width:3");
    const smallAsteroid5 = new Elem(svg, 'circle')
        .attr("cx", 600).attr("cy", 300).attr("r", 20)
        .attr("style", "fill:grey;stroke:white;stroke-width:3");
    const damnBigAsteroid1 = new Elem(svg, 'circle')
        .attr("cx", 0).attr("cy", 600).attr("r", 60)
        .attr("style", "fill:black;stroke:red;stroke-width:3");
    const smallAsteroid6 = new Elem(svg, 'circle')
        .attr("cx", 0).attr("cy", 600).attr("r", 0)
        .attr("style", "fill:grey;stroke:white;stroke-width:3");
    const smallAsteroid7 = new Elem(svg, 'circle')
        .attr("cx", 0).attr("cy", 600).attr("r", 0)
        .attr("style", "fill:grey;stroke:white;stroke-width:3")
        .attr("class", "asteroid");
    const smallAsteroid8 = new Elem(svg, 'circle')
        .attr("cx", 0).attr("cy", 600).attr("r", 0)
        .attr("style", "fill:grey;stroke:white;stroke-width:3");
    spawnAsteroids.push(smallAsteroid1);
    spawnAsteroids.push(smallAsteroid2);
    spawnAsteroids.push(smallAsteroid3);
    spawnAsteroids.push(smallAsteroid4);
    spawnAsteroids.push(smallAsteroid5);
    spawnAsteroids.push(smallAsteroid6);
    spawnAsteroids.push(smallAsteroid7);
    spawnAsteroids.push(smallAsteroid8);
    spawnAsteroids.push(damnBigAsteroid1);
    spawnAsteroids.forEach(movingAsteroids);
    let status = "alive";
    let health = 3, acceleration = 1;
    function movingAsteroids(asteroid) {
        let xDirection = Math.floor(Math.random() * 2) == 1 ? 1 : -1, yDirection = Math.floor(Math.random() * 2) == 1 ? 1 : -1;
        const asteroidObservable = Observable.interval(10), gameover = document.getElementById("lose"), livesLeft = document.getElementById("healthLeft");
        asteroidObservable.subscribe(() => asteroid.attr('cx', Number(asteroid.attr('cx')) + xDirection * acceleration).attr('cy', Number(asteroid.attr('cy')) + yDirection * acceleration));
        asteroidObservable.filter(() => Number(asteroid.attr('cy')) > canvas.width)
            .subscribe(() => asteroid.attr('cy', 0));
        asteroidObservable.filter(() => Number(asteroid.attr('cx')) > canvas.width)
            .subscribe(() => asteroid.attr('cx', 0));
        asteroidObservable.filter(() => Number(asteroid.attr('cy')) < 0)
            .subscribe(() => asteroid.attr('cy', 600));
        asteroidObservable.filter(() => Number(asteroid.attr('cx')) < 0)
            .subscribe(() => asteroid.attr('cx', 600));
        spawnAsteroids.forEach(roid => {
            asteroidObservable.filter(() => ((distanceBetweenPoints(transformMatrix(g).m41, transformMatrix(g).m42, Number(roid.attr("cx")), Number(roid.attr("cy"))) < Number(roid.attr("r"))) && health > 0))
                .subscribe(() => {
                g.attr("transform", "translate( 300 300)");
                acceleration += 0.5;
                livesLeft.innerHTML = `Lives Left: ${--health}`;
            });
            asteroidObservable.filter(() => ((distanceBetweenPoints(transformMatrix(g).m41, transformMatrix(g).m42, Number(roid.attr("cx")), Number(roid.attr("cy"))) < Number(roid.attr("r"))) && health == 0))
                .subscribe(() => {
                explodeShip();
                status = "dead";
            });
        });
        asteroidObservable.filter(() => status == "dead")
            .subscribe(() => gameover.innerHTML = "DEFEAT!");
    }
    function shootBullet() {
        const keyup = Observable.fromEvent(document, "keyup");
        keyup
            .filter(keyup => keyup.keyCode == 32).map(() => {
            let bullet = new Elem(svg, 'circle')
                .attr('cx', transformMatrix(g).m41)
                .attr('cy', transformMatrix(g).m42)
                .attr('r', 3)
                .attr('fill', 'pink');
            moveBullet(bullet);
        })
            .subscribe(() => { });
    }
    function distanceBetweenPoints(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    let playerscore = 0, roidsLeft = spawnAsteroids.length;
    function moveBullet(bullet) {
        let xDirection = Math.cos(rad), yDirection = Math.sin(rad);
        const bulletObservable = Observable.interval(1), score = document.getElementById("destroyed"), roidsDestroyed = document.getElementById("roidLeft"), gamewon = document.getElementById("win");
        bulletObservable.subscribe(() => bullet.attr('cx', Number(bullet.attr('cx')) + xDirection * 4).attr('cy', Number(bullet.attr('cy')) + yDirection * 4));
        bulletObservable.filter(() => Number(bullet.attr("cx")) > canvas.width || Number(bullet.attr("cy")) > canvas.height
            || Number(bullet.attr("cx")) < 0 || Number(bullet.attr("cy")) < 0)
            .subscribe(() => bullet.elem.remove());
        spawnAsteroids.forEach(roid => {
            bulletObservable.filter(() => distanceBetweenPoints(Number(bullet.attr("cx")), Number(bullet.attr("cy")), Number(roid.attr("cx")), Number(roid.attr("cy")))
                < Number(roid.attr("r")) && Number(roid.attr("r")) == 20)
                .subscribe(() => {
                roid.attr("r", 0).attr("cx", 0).attr("cy", 0);
                bullet.elem.remove();
                score.innerHTML = `Destroyed: ${++playerscore}`;
                roidsDestroyed.innerHTML = `Asteroids Left: ${--roidsLeft}`;
            });
            bulletObservable.filter(() => distanceBetweenPoints(Number(bullet.attr("cx")), Number(bullet.attr("cy")), Number(roid.attr("cx")), Number(roid.attr("cy")))
                < Number(roid.attr("r")) && Number(roid.attr("r")) == 60)
                .subscribe(() => {
                roid.attr("r", 0).attr("cx", 0).attr("cy", 0);
                bullet.elem.remove();
                smallAsteroid6.attr("r", 20);
                smallAsteroid7.attr("r", 20);
                smallAsteroid8.attr("r", 20);
                score.innerHTML = `Destroyed: ${++playerscore}`;
                roidsDestroyed.innerHTML = `Asteroids Left: ${--roidsLeft}`;
            });
        });
        bulletObservable.filter(() => status == "dead")
            .subscribe(() => bullet.elem.remove());
        bulletObservable.filter(() => roidsLeft == 0)
            .subscribe(() => {
            gamewon.innerHTML = "VICTORY!";
            bullet.elem.remove();
            explodeShip();
        });
    }
    function explodeShip() {
        return g.elem.remove();
    }
    rotateShip();
    moveShip();
    shootBullet();
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map
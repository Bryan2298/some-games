"use strict";
function pong() {
    function playerPaddle() {
        const svg = document.getElementById("canvas");
        let player = new Elem(svg, 'rect')
            .attr('x', 50).attr('y', 300)
            .attr('width', 10).attr('height', 80)
            .attr('fill', 'blue');
        return player;
    }
    function aiPaddle() {
        const svg = document.getElementById("canvas");
        let ai = new Elem(svg, 'rect')
            .attr('x', 530).attr('y', 200)
            .attr('width', 10).attr('height', 80)
            .attr('fill', 'red');
        return ai;
    }
    function createBall() {
        const svg = document.getElementById("canvas");
        let ball = new Elem(svg, 'circle')
            .attr('cx', 200).attr('cy', 300).attr('r', 7)
            .attr('width', 10).attr('height', 10)
            .attr('fill', 'yellow');
        return ball;
    }
    function setAI(aipaddle) {
        Observable.interval(10)
            .map(() => Number(ball.attr('cy')))
            .subscribe(cy => aipaddle.attr('y', cy));
    }
    function setPlayerPaddle(svg, playerpaddle) {
        const mousemove = Observable.fromEvent(svg, 'mousemove');
        playerpaddle.observe('mousemove')
            .map(({ clientY }) => ({ yOffset: Number(playerpaddle.attr('y')) - clientY }))
            .flatMap(({ yOffset }) => mousemove
            .map(({ clientY }) => ({ y: clientY + yOffset })))
            .subscribe(({ y }) => playerpaddle.attr('y', y));
    }
    const player = playerPaddle();
    const ball = createBall();
    const ai = aiPaddle();
    const svg = document.getElementById("canvas");
    setAI(ai);
    setPlayerPaddle(svg, player);
    function ballEvent() {
        let horizontal = -1, vertical = -1;
        let playerscore = 0, aiscore = 0;
        const svg = document.getElementById("canvas"), canvas = svg.getBoundingClientRect(), player1 = document.getElementById("playerpoint"), player2 = document.getElementById("aipoint"), winner1 = document.getElementById("win1"), winner2 = document.getElementById("win2");
        const o = Observable.interval(1);
        o.filter(() => playerscore == 11)
            .subscribe(() => {
            winner1.innerHTML = "Player 1 Wins!";
            horizontal = 0;
            vertical = 0;
        });
        o.filter(() => aiscore == 11)
            .subscribe(() => {
            winner2.innerHTML = "Player 2 Wins!";
            horizontal = 0;
            vertical = 0;
        });
        o.subscribe(() => ball.attr('cx', Number(ball.attr('cx')) + horizontal).attr('cy', Number(ball.attr('cy')) + vertical));
        o.filter(() => Number(ball.attr('cy')) > canvas.width || Number(ball.attr('cy')) < 0)
            .subscribe(() => vertical = vertical * -1);
        o.filter(() => Number(ball.attr('cx')) > canvas.width || Number(ball.attr('cx')) < 0)
            .subscribe(() => horizontal = horizontal * -1);
        o.filter(() => Number(ball.attr('cx')) > canvas.width)
            .subscribe(() => {
            ball.attr("cx", 300);
            ball.attr("cy", 300);
            player1.innerHTML = `${++playerscore}`;
            horizontal = 1;
        });
        o.filter(() => Number(ball.attr('cx')) < 0)
            .subscribe(() => {
            ball.attr("cx", 300);
            ball.attr("cy", 300);
            horizontal = horizontal * -1;
            player2.innerHTML = `${++aiscore}`;
            horizontal = 1;
        });
        o.filter(() => Number(ai.attr('x')) < Number(ball.attr('cx'))
            && Number(ball.attr('cx')) < (Number(ai.attr('x')) + Number(ai.attr('width')))
            && Number(ai.attr('y')) < Number(ball.attr('cy'))
            && (Number(ai.attr('y')) + Number(ai.attr('height'))) > Number(ball.attr('cy')))
            .subscribe(() => horizontal = horizontal * -1);
        o.filter(() => Number(ball.attr('cx')) < (Number(player.attr('x')) + Number(player.attr('width')))
            && Number(player.attr('x')) < Number(ball.attr('cx'))
            && Number(ball.attr('cy')) > Number(player.attr('y'))
            && (Number(player.attr('y')) + Number(player.attr('height'))) > Number(ball.attr('cy')))
            .subscribe(() => horizontal = horizontal * -1.2);
    }
    ballEvent();
}
if (typeof window != 'undefined')
    window.onload = () => {
        pong();
    };
//# sourceMappingURL=pong.js.map
function pong() {
  // Inside this function you will use the classes and functions 
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in pong.html, animate them, and make them interactive.
  // Study and complete the tasks in basicexamples.ts first to get ideas.

  // You will be marked on your functional programming style
  // as well as the functionality that you implement.
  // Document your code!  
  // Explain which ideas you have used ideas from the lectures to 
  // create reusable, generic functions.

  // This function creates a player paddle of a rectangle element and
  // is assigned to be at the left side of the canvas and returns the paddle player element.
  function playerPaddle(){
    const 
      svg = document.getElementById("canvas")!;
      // Creates a new Element rect in the canvas with the following attributes and assign it to player variable.
      let player = new Elem(svg, 'rect')
        .attr('x', 50).attr('y', 300)
        .attr('width', 10).attr('height', 80)
        .attr('fill', 'blue');
    return player;
  }

  // This function creates an AI paddle of a rectangle element and
  // is assigned to be at the right side of the canvas and returns the paddle AI element.
  function aiPaddle(){
    const 
      svg = document.getElementById("canvas")!;
      // Creates a new Element rect in the canvas with the following attributes and assign it to ai variable.
      let ai = new Elem(svg, 'rect')
        .attr('x', 530).attr('y', 200)
        .attr('width', 10).attr('height', 80)
        .attr('fill', 'red');  
    return ai;
  }

  // This function creates a ball in the middle of the canvas and returns the ball element.
  function createBall(){
    const 
      svg = document.getElementById("canvas")!;
      // Creates a new Element circle in the canvas with the following attributes and assign it to ball variable.
      let ball = new Elem(svg, 'circle')
        .attr('cx', 200).attr('cy', 300).attr('r',7)
        .attr('width', 10).attr('height', 10)
        .attr('fill', 'yellow');
    return ball;
  }
  

  // This function sets the AI paddle to follow the ball's position.
  function setAI(aipaddle:Elem){
    Observable.interval(10)
      // Map to get the current y position of the ball
      .map(()=> Number(ball.attr('cy')))
      // Subscribe to set the AI's paddle y to become the ball's y. 
      // This will allow the AI's paddle to follow the ball's y position everytime it changes.
      .subscribe(cy=> aipaddle.attr('y',cy));
      
  }

  // This function sets the player paddle to be a movable following the mouse cursor's y position.
  function setPlayerPaddle(svg:HTMLElement, playerpaddle:Elem){
    // Create a mousemove event using an Observable and assign it to a mousemove variable.
    const mousemove = Observable.fromEvent<MouseEvent>(svg, 'mousemove'); 
    playerpaddle.observe<MouseEvent>('mousemove')
      // maps the Y position of the mouse cursor to the y position of the player paddle element.
      .map(({clientY}) => ({yOffset: Number(playerpaddle.attr('y')) - clientY }))
      .flatMap(({yOffset}) =>
      mousemove // Takes the Y offset to respond to the mousemove event from the Observale
        .map(({clientY}) => ({y: clientY + yOffset }))) // Maps the old clientY position and set y to become the new y position
      .subscribe(({y}) => playerpaddle.attr('y', y)); // Update the player paddle's to the new y position
  }

  const player = playerPaddle(); // Assigns the playerPaddle function into player variable.
  const ball = createBall(); // Assigns the createBall function to ball variable.
  const ai = aiPaddle(); // Assigns the aiPaddle function into ai variable.
  const svg = document.getElementById("canvas")!; // Get the canvas and assign it to svg variable.
  setAI(ai); // Calls the setAI function and implements the ai paddle to become a moving paddle by the computer.
  setPlayerPaddle(svg, player); // Calls the setPlayerPaddle function and implements the player paddle to become a movable paddle.

  function ballEvent(){
    let horizontal = -1, vertical = -1 // Assign the increment speed of the ball to horizontal speed to vertical;
    let playerscore = 0, aiscore = 0; // player scores
    const svg = document.getElementById("canvas")!, // Get the canvas and assign it to svg variable. 
          canvas = svg.getBoundingClientRect(), // To get the properties of the canvas (eg: to get canvas height: canvas.height) and assign it to canvas variable.
          player1 = document.getElementById("playerpoint")!, // A player score (set to 0) HTML Element is assigned to player1 variable.
          player2 = document.getElementById("aipoint")!, // An AI score (set to 0) HTML Element is assigned to player1 variable.
          winner1 = document.getElementById("win1")!, // A win1 HTML element is assigned to winner1 variable
          winner2 = document.getElementById("win2")!; // A win2 HTML element is assigned to winner2 variable

    const o = Observable.interval(1) // Sets the observable interval to 1ms, and is assigned to o variable

      // This observable event filters the score when it reaches 11, the game stops
      o.filter(() => playerscore == 11) // Checks if the player score is 11, then it sets the winner1 variable to print out "Player 1 Wins!" in the canvas
        .subscribe(() => {winner1.innerHTML = "Player 1 Wins!"
                          horizontal = 0  // Sets the ball speed on both horizontal and vertical to 0. There are no more increments to the speed.
                          vertical = 0})

      // This observable event filters the score when it reaches 11, the game stops
      o.filter(() => aiscore == 11) // Filters to check if the AI score is 11, then it sets the winner2 variable to print out "Player 2 Wins!" in the canvas
        .subscribe(() => {winner2.innerHTML = "Player 2 Wins!"
                          horizontal = 0 // Sets the ball speed on both horizontal and vertical to 0. There are no more increments to the speed.
                          vertical = 0})

      // This observable event enables the ball to move diagonally across the canvas by incrementing the ball's x and y position   
      // by 1 in 1ms. So for each 1ms, the ball moves.               
      o.subscribe(()=>ball.attr('cx', Number(ball.attr('cx')) + horizontal).attr('cy', Number(ball.attr('cy')) + vertical));
                      
      // This observable event enables the ball to bounce off the canvas walls on the y position by negating the vertical value, so
      // the ball's y position will now decrease.  
      // The observable is filtered to meet the following condition and will then subscribe to change the vertical value.
      o.filter(() => Number(ball.attr('cy')) > canvas.width || Number(ball.attr('cy')) < 0)
        .subscribe(()=> vertical = vertical * -1);

      // This observable event enables the ball to bounce off the canvas walls on the x position by negating the horizontal value, so
      // the ball's x position will now decrease.  
      // The observable is filtered to meet the following condition and will then subscribe to change the vertical value.
      o.filter(() => Number(ball.attr('cx')) > canvas.width || Number(ball.attr('cx')) < 0)
        .subscribe(()=> horizontal = horizontal * -1);

      // This observable event checks if the ball's x goes out off the AI's side, the player1's score is incremented by 1.
      // It filters if the ball exceeds the canvas width and subscribes to update the horizontal value, score and resets the ball's position to the middle of the canvas.
      o.filter(() => Number(ball.attr('cx')) > canvas.width)
        .subscribe(() => {ball.attr("cx",300)
                          ball.attr("cy",300)
                          player1.innerHTML = `${++playerscore}` 
                          horizontal = 1});

      // This observable event checks if the ball's x goes out off the player's side, the player2's/AI's score is incremented by 1.
      // It filters if the ball exceeds 0 and subscribes to update the horizontal value, score and resets the ball's position to the middle of the canvas.
      o.filter(() => Number(ball.attr('cx')) < 0)
        .subscribe(() => {ball.attr("cx",300)
                          ball.attr("cy",300)
                          horizontal = horizontal * -1
                          player2.innerHTML =  `${++aiscore}` 
                          horizontal = 1});

      // This obervable event checks for the collision of the ball when it touches the AI's paddle.
      // It filters and subscribes to update the horizontal value if the following conditions are met.
      // If the ball's x position is more than the AI's right part of the paddle
      // and the ball's x position is less than the AI's left part of the paddle
      // and the balls' y position is more than the AI's top part of the paddle
      // and the ball's y position is less than the AI's bottom part of the paddle
      // we collide by reflecting the ball's horizontal position.
      o.filter(() => Number(ai.attr('x')) < Number(ball.attr('cx')) 
                     && Number(ball.attr('cx')) < (Number(ai.attr('x')) + Number(ai.attr('width')))
                     && Number(ai.attr('y')) < Number(ball.attr('cy')) 
                     && (Number(ai.attr('y')) + Number(ai.attr('height'))) > Number(ball.attr('cy')))
        .subscribe(()=> horizontal = horizontal * -1) // Negates the horizontal value to -1.

      // This obervable event checks for the collision of the ball when it touches the player's paddle. The speed of the ball
      // will always increase each time the ball touches the player's paddle.
      // It filters and subscribes to update the horizontal value if the following conditions are met.
      // If the ball's x position is less than the player's right part of the paddle
      // and the ball's x position is more than the player's left part of the paddle
      // and the balls' y position is more than the player's top part of the paddle
      // and the ball's y position is less than the player's bottom part of the paddle
      // we collide by reflecting the ball's horizontal position.
      o.filter(() => Number(ball.attr('cx')) < (Number(player.attr('x')) + Number(player.attr('width')))
                      && Number(player.attr('x')) < Number(ball.attr('cx'))
                      && Number(ball.attr('cy')) > Number(player.attr('y'))
                      && (Number(player.attr('y')) + Number(player.attr('height'))) > Number(ball.attr('cy')))
        .subscribe(()=> horizontal = horizontal * -1.2) // Negates the horizontal value to -1.2.

  }

  ballEvent(); // The ballEvent function is called.
}


// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    pong();
  }

 

 
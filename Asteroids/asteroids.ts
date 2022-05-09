// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

// Name: Bryan Wong Ee Ern
// Student ID: 28099419
// Assignment 1

/************************************************************************************************ */
// The asteroid game enables the player to move the ship and destroy asteroids. To play this game,
// the user would have to hold down the mouse button to thrust the ship to the direction the mouse
// is currently at. To shoot, the user will be using the spacebar key on the keyboard and to rotate
// the ship,the user will be moving the mouse around the canvas. The player can only destroy small
// asteroids whereas when the big asteroid is hit, it will split into smaller asteroids. 
// Throughout this code, many functional
// programming concepts were used such as map, flatMap, filter, forEach and subscribe. However, some
// global variables were created to keep track of certain values which will be used later on in some 
// function.
/************************************************************************************************ */

function asteroids() {
  // Inside this function you will use the classes and functions 
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in asteroids.html, animate them, and make them interactive.
  // Study and complete the Observable tasks in the week 4 tutorial worksheet first to get ideas.

  // You will be marked on your functional programming style
  // as well as the functionality that you implement.
  // Document your code!  
  // Explain which ideas you have used ideas from the lectures to 
  // create reusable, generic functions.
  const svg = document.getElementById("canvas")!,
        canvas = svg.getBoundingClientRect();  

  // A variable to store the radian
  let rad = 0

  // make a group for the spaceship and a transform to move it and rotate it
  // to animate the spaceship you will update the transform property
  let g = new Elem(svg,'g')
    .attr("transform","translate(300 300)")  

  // create a polygon shape for the space ship as a child of the transform group
  let ship = new Elem(svg, 'polygon', g.elem) 
    .attr("points","-15,20 15,20 0,-20")
    .attr("style","fill:gold;stroke:#D3D3D3;stroke-width:3")


  // Change radians to degree
  const radToDeg = (rad:number) => rad * 180 / Math.PI + 90;

  // A variable to keep track of the current ship's rotation angle
  let currentRotation = 0;

  // Function that gets the current transform property of the given Elem
  // I did not use g.elem.getboundingClientRect() because that changes the x,y after rotation
  const transformMatrix = 
    (e:Elem) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform)



  /************************************************************************************************ */
  // ROTATING AND MOVNG THE SHIP BY USING MOUSEMOVE AND MOUSEDOWN EVENTS
  /************************************************************************************************ */

  // This function enables the ship to rotate by following the mouse's cursor position
  function rotateShip(){
    // Subscribe mousemove event on the svg canvas
    Observable.fromEvent<MouseEvent>(svg, "mousemove")
      // Calculate current pointer position relative to the canvas
      .map(({clientX, clientY}) => ({
        lookx: clientX - canvas.left + 1,
        looky: clientY - canvas.top + 1,
        x: transformMatrix(g).m41, // m41 is transformX in the Webkit CSS Matrix
        y: transformMatrix(g).m42  // m42 is transformY in the Webkit CSS Matrix
      }))
      .map(({lookx, looky, x, y}) => {
        // Used alot in games to get rotation in radians: Math.atan2(looky - y, lookx - x)
        currentRotation = radToDeg(Math.atan2(looky - y, lookx - x))
        g.attr("transform",
          "translate(" + x  + " " + y + ")" +
          "rotate(" + currentRotation + ")")
          rad = Math.atan2(looky - y, lookx - x)
        }) 
      .subscribe(() => {});
  }

  // This function enables the ship to thrust by holding the right click on the mouse
  function moveShip() {
    const 
      shipObservable = Observable.interval(1),
      mousedown = Observable.fromEvent<MouseEvent>(svg, "mousedown"),
      mouseup = Observable.fromEvent<MouseEvent>(svg, "mouseup");

      // On a mousedown event, we enable the ship to move at the direction the ship is pointing at
      mousedown
        .flatMap(() =>
        shipObservable.takeUntil(mouseup)
      .map(() => {
        // Here we translate based on the ship's current rotation and moving it to that direction when the mouse is clicked
        g.attr("transform",
          "translate(" + (transformMatrix(g).m41 + Math.cos(rad) * 2)  + " " + (transformMatrix(g).m42 + Math.sin(rad) * 2)  + ")" +
          "rotate(" + currentRotation + ")")
        }))
      .subscribe(() => {});

    // This section is wrapping the ship's position around the canvas. So whenever the ship goes out of the canvas, it reappears the other side.
    shipObservable.filter(() => transformMatrix(g).m41 > canvas.width)
      .subscribe(() => g.attr("transform", "translate(0 " + transformMatrix(g).m42 + ")"))
    shipObservable.filter(() => transformMatrix(g).m41 < 0)
      .subscribe(() => g.attr("transform", "translate(600 " + transformMatrix(g).m42 + ")"))
    shipObservable.filter(() => transformMatrix(g).m42 > canvas.height)
      .subscribe(() => g.attr("transform", "translate(" + transformMatrix(g).m41 + " 0)"))
    shipObservable.filter(() => transformMatrix(g).m42 < 0)
      .subscribe(() => g.attr("transform", "translate(" + transformMatrix(g).m41 + " 600)"))
  }



  /************************************************************************************************ */
  // CREATING THE ASTEROIDS AND PUTTING THEM INTO A LIST
  /************************************************************************************************ */

  let spawnAsteroids: Elem[] = []; // Create a list containing asteroid elements

  // Here, I am creating different asteroid elements and randomizing the spawn position of each asteroid using min = 0 and max is the width of the canvas
  const smallAsteroid1 = new Elem(svg, 'circle')
  .attr("cx", 10).attr("cy", 10).attr("r",20)
  .attr("style","fill:grey;stroke:white;stroke-width:3")

  const smallAsteroid2 = new Elem(svg, 'circle')
  .attr("cx", 300).attr("cy", 0).attr("r",20)
  .attr("style","fill:grey;stroke:white;stroke-width:3")
  .attr("class","asteroid")

  const smallAsteroid3 = new Elem(svg, 'circle')
  .attr("cx", 600).attr("cy", 0).attr("r",20)
  .attr("style","fill:grey;stroke:white;stroke-width:3")

  const smallAsteroid4 = new Elem(svg, 'circle')
  .attr("cx", 0).attr("cy", 300).attr("r",20)
  .attr("style","fill:grey;stroke:white;stroke-width:3")

  const smallAsteroid5 = new Elem(svg, 'circle')
  .attr("cx", 600).attr("cy", 300).attr("r",20)
  .attr("style","fill:grey;stroke:white;stroke-width:3")

  const damnBigAsteroid1 = new Elem(svg, 'circle')
  .attr("cx", 0).attr("cy", 600).attr("r",60)
  .attr("style","fill:black;stroke:red;stroke-width:3")

  const smallAsteroid6 = new Elem(svg, 'circle')
  .attr("cx", 0).attr("cy", 600).attr("r",0)
  .attr("style","fill:grey;stroke:white;stroke-width:3")

  const smallAsteroid7 = new Elem(svg, 'circle')
  .attr("cx", 0).attr("cy", 600).attr("r",0)
  .attr("style","fill:grey;stroke:white;stroke-width:3")
  .attr("class","asteroid")

  const smallAsteroid8 = new Elem(svg, 'circle')
  .attr("cx", 0).attr("cy", 600).attr("r",0)
  .attr("style","fill:grey;stroke:white;stroke-width:3")


  // Store the asteroids into a list 
  spawnAsteroids.push(smallAsteroid1)
  spawnAsteroids.push(smallAsteroid2)
  spawnAsteroids.push(smallAsteroid3)
  spawnAsteroids.push(smallAsteroid4)
  spawnAsteroids.push(smallAsteroid5)
  spawnAsteroids.push(smallAsteroid6)
  spawnAsteroids.push(smallAsteroid7)
  spawnAsteroids.push(smallAsteroid8)
  spawnAsteroids.push(damnBigAsteroid1)

  // Make each asteroid move
  spawnAsteroids.forEach(movingAsteroids)


  /************************************************************************************************ */
  // MAKING THE ASTEROIDS MOVE ON THE CANVAS
  /************************************************************************************************ */

  // Make a variable to keep track of the current status of the player and the health
  // Also add a new variable called acceleration for the speed of the asteroids.
  let status = "alive";
  let health = 3, acceleration = 1;

  // This function enables each asteroid to move randomly
  function movingAsteroids(asteroid:Elem) {

    // xDirection and yDirection randomizes the asteroid's movement/direction by setting the horizontal
    // or vertical to 1 or -1
    let 
      xDirection = Math.floor(Math.random()*2) == 1 ? 1 : -1,
      yDirection = Math.floor(Math.random()*2) == 1 ? 1 : -1;

    const asteroidObservable = Observable.interval(10),
          gameover = document.getElementById("lose")!,
          livesLeft = document.getElementById("healthLeft")!;

    // Let the asteroid move in random directions depending on the values given by xDirection and yDirection and it will multiply by the current acceleration value
    asteroidObservable.subscribe(() => asteroid.attr('cx', Number(asteroid.attr('cx'))  + xDirection * acceleration).attr('cy', Number(asteroid.attr('cy')) + yDirection * acceleration))

    // This part wraps the asteroids around the canvas so that it reappears the other side if it goes out of the canvas
    asteroidObservable.filter(() => Number(asteroid.attr('cy')) > canvas.width)
      .subscribe(() => asteroid.attr('cy',0))
    asteroidObservable.filter(() => Number(asteroid.attr('cx')) > canvas.width)
      .subscribe(() => asteroid.attr('cx',0))
    asteroidObservable.filter(() => Number(asteroid.attr('cy')) < 0)
      .subscribe(() => asteroid.attr('cy',600))
    asteroidObservable.filter(() => Number(asteroid.attr('cx')) < 0)
      .subscribe(() => asteroid.attr('cx',600))


    /************************************************************************************************ */
    // ASTEROIDS COLLISION WITH THE SHIP. WE USE "forEach" TO ITERATE THROUGH THE LIST OF ASTEROIDS AND
    // CHECKS IF THE ASTEROID HITS THE SHIP
    /************************************************************************************************ */

    // This part checks if the ship collides with an asteroid. If lives left is more than 0, then 
    // the ship should reset to the middle and the speed of the asteroids goes faster by 1. 
    // Otherwise it removes the ship from the canvas and makes status to "dead".
    // The numbber 20 is used as the ship's radius to assume that the ship has a circle radius of 20.
    spawnAsteroids.forEach(roid => {
      asteroidObservable.filter(() => ((distanceBetweenPoints(transformMatrix(g).m41, transformMatrix(g).m42, 
                                        Number(roid.attr("cx")), Number(roid.attr("cy"))) < Number(roid.attr("r"))) && health > 0))
      .subscribe(() => {g.attr("transform", "translate( 300 300)")
                        acceleration += 0.5
                        livesLeft.innerHTML = `Lives Left: ${--health}`})

      asteroidObservable.filter(() => ((distanceBetweenPoints(transformMatrix(g).m41, transformMatrix(g).m42, 
                                      Number(roid.attr("cx")), Number(roid.attr("cy"))) < Number(roid.attr("r"))) && health == 0))
      .subscribe(() => {explodeShip() 
                        status = "dead"})
      })              


    // Filters to check if the current status is "dead", it will show You Died! on the canvas
    asteroidObservable.filter(() => status == "dead")  
      .subscribe(() => gameover.innerHTML = "DEFEAT!")
                      
  }

  
  /************************************************************************************************ */
  // SHOOTING THE BULLET FROM THE SHIP. THIS USES A KEYBOARD EVENT TO DETECT IF THE SPACEBAR KEY IS CLICKED
  // AND CREATES A NEW BULLET ELEMENT AND ASSIGN AN OBSERVABLE TO IT
  /************************************************************************************************ */

  // This function enables the ship to shoot bullets out
  function shootBullet(){

    const keyup = Observable.fromEvent<KeyboardEvent>(document, "keyup");
    // When spacebar key is pressed, create circle elements (aka our bullets) and assign the moveBullet function to the bullet to animate the bullet shooting
    keyup
      .filter(keyup => keyup.keyCode == 32).map(() => {
        let bullet = new Elem(svg, 'circle')
          .attr('cx',  transformMatrix(g).m41)
          .attr('cy', transformMatrix(g).m42)
          .attr('r',3)
          .attr('fill', 'pink')
      moveBullet(bullet);
      })
      .subscribe(() => {});
  }
  

  /************************************************************************************************ */
  // THIS SECTION IS FOR THE BULLET MOVEMENT AND COLLISION WITH THE ASTEROIDS.
  /************************************************************************************************ */

  // This function is to get the distance between points of 2 objects
  function distanceBetweenPoints(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  // Global variables to store our player score and the amount of asteroids left in the game
  let playerscore = 0, roidsLeft = spawnAsteroids.length;

  // This function enables the bullet to fire out at the direction the ship is facing at
  function moveBullet(bullet:Elem) {
    let
      xDirection = Math.cos(rad), // The x direction of the current rotation
      yDirection = Math.sin(rad); // The y direction of the current rotation

    const bulletObservable = Observable.interval(1),
          score = document.getElementById("destroyed")!,
          roidsDestroyed = document.getElementById("roidLeft")!,
          gamewon = document.getElementById("win")!;

    // This section enables the bullet to move at 4x the speed at the direction the ship is pointing to
    bulletObservable.subscribe(() => bullet.attr('cx', Number(bullet.attr('cx')) + xDirection * 4).attr('cy', Number(bullet.attr('cy')) + yDirection * 4))

    // This part makes sure that when the bullet exceeds from the canvas bounds, we remove the bullet
    bulletObservable.filter(() => Number(bullet.attr("cx")) > canvas.width || Number(bullet.attr("cy")) > canvas.height
                                  || Number(bullet.attr("cx")) < 0 || Number(bullet.attr("cy")) < 0)
                    .subscribe(() => bullet.elem.remove());
    
    // This part removes the small asteroid when the bullet hits it by setting its position and radius to 0
    // Besides that, the collision also checks if the bullet hits an asteroid with a radius of 60, then it will split it into 3 new smaller asteroids.
    // Only the small asteroids can be destroyed. So I applied 2 filters in this part, one to check for an asteroid with a radius of 20 (small asteroid)
    // and one with a radius of 60 (big asteroid)
    spawnAsteroids.forEach(roid => {
      bulletObservable.filter(() => distanceBetweenPoints(Number(bullet.attr("cx")), Number(bullet.attr("cy")), Number(roid.attr("cx")), Number(roid.attr("cy"))) 
                                    < Number(roid.attr("r")) && Number(roid.attr("r")) == 20)
          .subscribe(() => {roid.attr("r",0).attr("cx", 0).attr("cy", 0)
                            bullet.elem.remove()
                            score.innerHTML = `Destroyed: ${++playerscore}`
                            roidsDestroyed.innerHTML = `Asteroids Left: ${--roidsLeft}`
                          })
      bulletObservable.filter(() => distanceBetweenPoints(Number(bullet.attr("cx")), Number(bullet.attr("cy")), Number(roid.attr("cx")), Number(roid.attr("cy"))) 
                                    < Number(roid.attr("r")) && Number(roid.attr("r")) == 60)
          .subscribe(() => {roid.attr("r",0).attr("cx", 0).attr("cy", 0)
                            bullet.elem.remove()
                            smallAsteroid6.attr("r", 20)
                            smallAsteroid7.attr("r", 20)
                            smallAsteroid8.attr("r", 20)
                            score.innerHTML = `Destroyed: ${++playerscore}`
                            roidsDestroyed.innerHTML = `Asteroids Left: ${--roidsLeft}`
                          })
      })
    
    // Set the bullets radius to 0 when the player dies
    bulletObservable.filter(() => status == "dead")  
    .subscribe(() => bullet.elem.remove())

     // Filters to check if there are no more asteroids on the canvas, it will show You Won! on the canvas
    bulletObservable.filter(() => roidsLeft == 0)  
    .subscribe(() => {
                      gamewon.innerHTML = "VICTORY!"
                      bullet.elem.remove()
                      explodeShip()
                      })
  }

  // This function removes the ship from the canvas
  function explodeShip(){
    return g.elem.remove();
  }

  rotateShip();
  moveShip();
  shootBullet();
}


// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }


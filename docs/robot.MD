# TRY.js (Beta) Robot API description
A click on the ```Program / Edit``` menu item will open an editor. Press `Document / New` to create a new Google Drive document. After writing your code you need to click on the ```AssignCode``` menu item. This will load your current program into the robot. Example: [basic-program.js](https://github.com/s-a/examples.try.js/blob/master/first%20steps/basic-program.js).  


A ```Robot``` [programm](https://github.com/s-a/examples.try.js/blob/master/first%20steps/basic-program.js) runs allways in context of the robot himself. For this reason we allways use the keyword ```this``` to access the robots methods. Maybe the most important method of Robot is the ```.move()``` method. To move the robot forward within an program you need to call ```this.move("forward")```. Keep in mind that the robot can only execute one command at the time. For this reason you have to use the callback methods to determine if the robot has completed a running command. It is possible with the ```onComplete``` callback method. See ***[Synchronous methods](#synchronous-code)*** to read more about this topic.

## Overview
[Robot.move()](robot.MD#robotmove)  
[Robot.turn()](robot.MD#robotturn)  
[Robot.step()](robot.MD#robotstep)  
[Robot.run()](robot.MD#robotrun)  
[Robot.get()](robot.MD#robotget)  
[Robot.put()](robot.MD#robotput)  
[Robot.charge()](robot.MD#robotcharge)  
[Robot.sensor.atHome()](robot.MD#robotsensorathome)  
[Robot.sensor.canCharge()](robot.MD#robotsensorcancharge)  
[Robot.sensor.position()](robot.MD#robotsensorposition)  
[Robot.sensor.canGet()](robot.MD#robotsensorcanget)  
[Robot.sensor.canPut()](robot.MD#robotsensorcanput)  
[Robot.sensor.canMove()](robot.MD#robotsensorcanmove)  
[Robot.sensor.canTurn()](robot.MD#robotsensorcanturn)  
[Robot.do()](robot.MD#robotdo)  

## Description

---
### Robot.move()
Move the robot forward or backward.
 - ***Parameters***
   - ```Direction``` (String)
     - Possbile values:
       - ```"forward"``` Moves the robot forward.
       - ```"backward"``` Moves the robot backward.
   - ```onComplete``` (Function) Optional callback method.
  
##### Example
```javascript
this.move("forward", function(){
    alert("Move completed!");
});
```


---
### Robot.turn()
Turns the robot into the desired direction.
 - ***Parameters***
   - ```Direction``` (String)
     - Possbile values:
       - ```"left"``` Rotates the robot left. 
       - ```"right"``` Rotates the robot right. 
       - ```"around"``` Rotates the robot 2 times left . 
   - ```onComplete``` (Function) Optional callback method.
  
##### Example
```javascript
this.turn("left", function(){
    alert("Move completed!");
});
```



---
### Robot.step()
Commands the robot to make a step right or left.
 - ***Parameters***
   - ```Direction``` (String)
     - Possbile values:
       - ["left", "right"]
   - ```onComplete``` (Function) Optional callback method.
  
##### Example
```javascript
this.step("left", function(){
    alert("Move completed!");
});  
```


---
### Robot.run()
Move the robot forward ```n``` times.
 - ***Parameters***
   - ```count``` (Integer) A number of steps forward
   - ```onComplete``` (Function) Optional callback method.
  
##### Example
```javascript
this.run(10, function(){
    alert("Robot moved 10 times foward!");
});  
```
---
### Robot.get()
Pick up an object in front of the robot.
 - ***returns***
   - ```Boolean```
  
##### Example
```javascript
if (this.get()){
    alert("Robot picked up something awesome!");
}

```
---
### Robot.put()
Unload an object in front of the robot.
 - ***returns***
   - ```Boolean```
  
##### Example
```javascript
if (this.put()){
    alert("Robot unloaded it!");
}

```
---

### Robot.charge()
Charges the robot battery.
 - ***Returns*** Boolean
 - ***Parameters***
   - ```onComplete``` (Function) Optional callback method.

##### Example
```javascript
if (this.charge()){
    alert("The robot is in a energy box!");
});  
```
---


## Robot.sensor  
The robot has several sensors that allow him to perceive its environment.

---
### Robot.sensor.atHome()
Determines if the robot is within his homebox.
 - ***Returns*** Boolean

---
### Robot.sensor.canCharge()
Determines if the robot is within an energy station.
 - ***Returns*** Boolean

---
### Robot.sensor.position()
Determines if the robot is within his homebox.
 - ***Returns*** Position object which contains x, y, z coordinates.

##### Example
```javascript
if (this.sensor.atHome()){
    alert("The robot is at home!");
});  
```
---
### Robot.sensor.canGet()
Determines if the robot is able pick something up.
 - ***Returns*** Boolean

##### Example
```javascript
if (this.sensor.canGet()){
    alert("The robot can get something!");
});  
```
---
### Robot.sensor.canPut()
Determines if the robot is able to unload something.
 - ***Returns*** Boolean

##### Example
```javascript
if (this.sensor.canPut()){
    alert("The robot can put something here!");
});  
```
---
### Robot.sensor.canMove()
Determines if the robot is able to move.
 - ***Returns*** Boolean  
 - ***Parameters***
   - ```direction``` (String) ["forward"|"backward"]

##### Example
```javascript
if (this.canMove("forward")){
  this.move("forward", function(){
      alert("Move completed!");
  });
} else {
  alert("Cannot move :O(");
}
```

---

### Robot.sensor.canTurn()
Determines if the robot is able to rotate.
 - ***Returns*** Boolean
 - ***Parameters***
   - ```direction``` (String) ["left"|"right"]

##### Example
```javascript
if (this.canTurn("left")){
  this.turn("left", function(){
      alert("Turn completed!");
  });
} else {
  alert("Cannot rotate :O(");
}
```

---
## Synchronous code  
Well writing async code is cool to solve complex problems but it often results in large nested codeblocks. For that reason the Robot API supports a chainable synchronous way to execute commands from a staple. The robot can collect commands with the ```Robot.do()``` command. You need to start the chain with ```Robot.start()```.

---

### Robot.do()
 - ***Parameters***
   - ```command``` 		(String) An available robot method name.
   - ```parameter``` 	(Object) A parameter for the used command.
  
##### Example
```javascript
this
  .do("move", "forward")
  .do("move", "forward")
  .start(funtion(){
  	alert("The robot moved forward 2 times.");
  });
});  
```
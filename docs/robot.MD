# Robot API description
A ```Robot``` [programm](https://github.com/s-a/examples.try.js/blob/master/first%20steps/basic-program.js) runs allways in context of the robot himself. For this reason we allways use the keyord ```this``` to access the robots methods. Maybe the most important method of Robot is the ```.move()``` method. To move the robot forward within an programm you need to call ```this.move("forward")```. Keep in mind that the robot can only execute on command at the time. For this reason you have to use the callback methods to determine if the robot has completed a running command. See ***Synchronous methods*** to read more about this topic.

---
### Robot.move()
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
 - ***Parameters***
   - ```Direction``` (String)
     - Possbile values:
       - ```"left"``` Rotates the robot a step left.
       - ```"right"``` Rotates the robot a step right.
   - ```onComplete``` (Function) Optional callback method.
  
##### Example
```javascript
this.step("left", function(){
    alert("Move completed!");
});  
```


---
### Robot.run()
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


## Robot.sensor  
The robot has several sensors that allow him to perceive its environment.

---
### Robot.sensor.atHome()
Determines if the robot is within his homebox.
 - ***Returns*** Boolean

##### Example
```javascript
if (this.sensor.atHome()){
    alert("The robot is at home!");
});  
```
---
### Robot.sensor.canMove()
Determines if the robot is able to move.
 - ***Returns*** Boolean
 - ***Parameters***
   - ```direction``` (String) ["forward"|"backward"]
---
### Robot.sensor.canTurn()
Determines if the robot is able to rotate.
 - ***Returns*** Boolean
 - ***Parameters***
   - ```direction``` (String) ["left"|"right"]






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
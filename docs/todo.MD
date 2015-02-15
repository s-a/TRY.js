### Todo's

 - implement original wall position . this conflicts with updatePhysics. fix 
 http://localhost/robot.js/?q=%7B%22c%22%3A%22%22%2C%22t%22%3A%22%22%2C%22e%22%3A%7B%22robot%22%3A%7B%22position%22%3A%7B%22x%22%3A0%2C%22z%22%3A-92%7D%2C%22energy%22%3A%7B%22current%22%3A80%2C%22max%22%3A80%7D%2C%22fuel%22%3A%7B%22current%22%3A0%2C%22max%22%3A0%7D%2C%22capacity%22%3A%7B%22current%22%3A0%2C%22max%22%3A0%7D%7D%2C%22homeBox%22%3A%7B%22position%22%3A%7B%22x%22%3A0%2C%22y%22%3A25.1%2C%22z%22%3A0%7D%7D%2C%22walls%22%3A%5B%7B%22position%22%3A%7B%22x%22%3A0%2C%22y%22%3A50%2C%22z%22%3A-20%7D%2C%22scale%22%3A%7B%22x%22%3A100%2C%22y%22%3A100%2C%22z%22%3A100%7D%7D%5D%2C%22stations%22%3A%5B%5D%2C%22flowers%22%3A%5B%5D%7D%7D 
 before!
 - fix energy charge method !!!
 - teleport callback comes to early !!!
 - Keep current drive documents by url get parm ids! (reset them on package load!)
 - make walls movable via Robot.push() ... 
 - special stations have different effects: 
  - robot becomes smaller (for x moves)
  - robot can move through walls (x times [robot is transparent...])
  - robot load roboto waepons amo to destroy walls (x times)
 - add method to run all tests as one suite
 - add promise Robot.then and Robot.else and execute only if previous method call was Robot.sensor call!
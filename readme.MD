# TRY.js (Beta)

![Google Drive™](/drive_outline-small.png?raw=true "Google Drive™")  

[<img src="/chrome-experiment-badge.png?raw=true" />](https://www.chromeexperiments.com/experiment/tryjs "Chrome Experiments")  

Production: [<img src="https://travis-ci.org/s-a/TRY.js.svg?branch=master" />](https://travis-ci.org/s-a/try.js "master test state")  
Development: [<img src="https://travis-ci.org/s-a/TRY.js.svg?branch=development" />](https://travis-ci.org/s-a/TRY.js "development test state")  
[![Donate](http://s-a.github.io/donate/donate.svg)](http://s-a.github.io/donate/)

[TRY.js](http://s-a.github.io/TRY.js/) is supposed to programm a virtual robot which moves in a 3D environment able to pick up and unload objects. The program gives beginners a first insight into the world of computer programming.

Due to the ease of use and the limited [instruction set](https://github.com/s-a/TRY.js/blob/development/docs/robot.MD) [TRY.js](http://s-a.github.io/TRY.js/) is well suited for the introduction to programming, especially for learning the programming language JavaScript. It gives an overview about [synchronious and asynchronious codes](https://github.com/s-a/TRY.js/blob/development/docs/robot.MD) as well as [test driven development](/docs/tests.MD).  

Anyway you are welcome to send possible [bug reports](https://github.com/s-a/try.js/issues) and/or [fixes](https://github.com/s-a/try.js).  

***Share your work***  
All your work can be saved on [Google Drive™](https://drive.google.com) where you can share your work with your friends. You need a [Google™ account](https://accounts.google.com/SignUp "Create your Google Account") to use this feature. However this is optional. You can easily quick share something with a click on the ```Package / ShareViaLink``` menu item. This will load a new window where you can copy the URL to share.  

To publish your work world wide visit [channel.try.js](https://github.com/s-a/channel.try.js) and follow the instructions. The channel.json points to different codes in external repositories. There are some packages available containing an environment, a test suite and a robot program for demonstration purposes. A robot program is optional so you can create different levels for TRY.js. I would be happy to see various mutations and receive pull requests there. If you do not want create your own repo create your own folder and add your codes to [examples.try.js](https://github.com/s-a/examples.try.js).

## Learn [TRY.js](http://s-a.github.io/TRY.js/) in a few minutes

### Mouse orbit control
 - Left Click + Mouse move: Rotate view
 - Wheel up/down: Zoom in / Zoom out
 - Right Click + Mouse move: Pan view


### Load example presets
A click on the ```Package / Open``` menu item will show a list of [avilable](https://github.com/s-a/channel.try.js) [examples](https://github.com/s-a/examples.try.js).


## Developer API guidelines

### [Environment](/docs/environment.MD) - Create and edit your own environments

### [Robot API](/docs/robot.MD) - Create and edit your own robot programs

### [Test API](/docs/tests.MD) - Create and edit test suites

## Miscellaneous

### Browser Support
This web app is ***developed with Google Chrome*** and tested with the following desktop browsers.  
 - ![Chrome](/ico/chrome_32x32.png "Chrome") | Windows 7 32bit (Version 40.0.2214.111 m) ***OK***
 - ![Opera](/ico/opera_32x32.png "Opera") | Windows 7 32bit (Version 25.0) ***OK***
 - ![Firefox](/ico/firefox_32x32.png "Firefox") | Windows 7 32bit (Version 35.0.1) ***OK***
 - ![Internet Explorer](/ico/internet-explorer_32x32.png "Enternet Explorer") | Windows 7 32bit (Version 11.0.16) ***Works*** ecxept of loading packagaes.
 - ![Safari](/ico/safari_32x32.png "Safari") | Windows 7 32bit (Version 5.1.7) COMPLETE FAIL :O(

### [Share it on your social network](http://s-a.github.io/TRY.js/)
A click on the ```social share icon``` in the upper left corner item will open a share dialog.

### [Trouble shooting, bug reports, ideas or questions](https://github.com/s-a/TRY.js/issues)
Feel free to write me your thoughts.

### [Roadmap](docs/todo.MD)
Feel free to leave [feature requests](https://github.com/s-a/TRY.js/issues).

### [Donate](http://s-a.github.io/TRY.js/)
A click on the ```About / Donate``` menu item will open a donation dialog.

### Improve the code
Forks are welcome but please create a new branch first before submit pull requests. There is a client side test method available ```window.engine.test();```. The method can be invoked via console and tests all packages from [channel.try.js](https://github.com/s-a/channel.try.js) in one suite. This should help to keep the code stable.  
The website needs a webserver. You can use any webserver, but this repository contains a lightweight [Node.js®](http://nodejs.org/) webserver which will also help to run the headless tests. The headless test expects the website live at ```http://localhost:3000/```. You can change this in the ```Gruntfile.js``` settings section.  


However I suggest the following workflow:
 - install [Node.js®](http://nodejs.org/) from http://nodejs.org/ on your system.
 - ```git clone https://github.com/s-a/TRY.js.git``` to clone the repo.  
 - ```cd TRY.js```  
 - ```git branch your-feature``` or "your-bugfix" to create your own branch.  
 - ```npm install``` to install develpment dependencies.  
 - ```node server.js``` to start the webserver.  
 - open ```http://localhost:3000/``` in your browser and enjoy :).  
 - improve the code. Yeah!  
 - ```npm test``` ***to test your changes*** (change ```Gruntfile.js``` grep settings to run single tests).  
 - ```git add .```  
 - ```git commit -am "I fixed or improved something"```  
 - ```git push```  
 - create a pull request  


### Credits
 - [Random maze generator](https://github.com/felipecsl/random-maze-generator) created by [felipecsl](https://github.com/felipecsl) 
 - Flower model taken from [BLENDER Timelapse: Flower in the forest (low poly)](http://www.blendswap.com/blends/view/71968) created by [jusezz](http://www.blendswap.com/blends/view/71968)  




That's all folks! And now [TRY JavaScript online](http://s-a.github.io/TRY.js/) and create something awesome! :O)

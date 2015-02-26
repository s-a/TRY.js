# TRY.js (Beta) tests {DRAFT}

A click on the ```Tests / Edit``` menu item will open an editor. Press `Document / New` to create a new Google Drive document. After writing your code you need to click on the ```AssignCode``` menu item. This will load your current tests into the environment.  

To run your tests click ```Tests / Run```  


The test suite is based on [Mocha.js](http://mochajs.org/) and [Should.js](http://unitjs.com/guide/should-js.html). They provide a way to declare very good human readable test suites.


##### Example
```javascript
describe("Mission impossible", function() {
  describe("Robot mission solved", function() {
    it("should be in the home box", function() {
      robot.sensor.atHome().should.be.true;
    });
    it("should be charged after shutdown", function() {
      robot.sensor.energyLevel().should.be.equal(100);
    });
  });
});
```



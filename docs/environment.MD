# TRY.js (Beta) environment {DRAFT}

A click on the ```Environment``` menu item will open an editor with a property editor to change the current environment meta data. In this view ***you do not need to write code*** manually. Press `Document / New` to create a new Google Drive document.  

### A simple JSON file declares a TRY.js environment

##### Example
```javascript
{
    "robot": {
        "position": {
            "x": 65,
            "z": 56
        },
        "energy" : {
            "current" : 80,
            "max" : 80
        }
    },
    "homeBox": {
        "position": {
            "x": 692,
            "z": 742
        }
    },
    "walls": [{
        "id": 32,
        "position": {
            "x": 799,
            "y": 25,
            "z": 399
        },
        "scale": {
            "x": 5,
            "y": 50,
            "z": 800
        }
    }]
}
```


Example: [basic-environment.json](https://github.com/s-a/examples.try.js/blob/master/first%20steps/basic-environment.json).

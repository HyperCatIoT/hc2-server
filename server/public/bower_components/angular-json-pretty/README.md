angular-json-pretty
===================

A directive make json object or string printed in human readable way

[DEMO](http://leftstick.github.io/angular-json-pretty)


## Install ##

```powershell
bower install --save angular-json-pretty
```

## Import ##

```HTML
<link rel="stylesheet" href="angular-json-pretty.css"/>
<script type="text/javascript" src="angular-json-pretty.js"></script>
```

> `angular-json-pretty` also support `AMD` and `CMD`. So you may already know how to import it into your code in the way you like.


## Usage ##

### Print JSON Object ###

```HTML
<pre json-pretty data="jsonObj"></pre>
```

```JavaScript
demo.controller('DemoController', function($scope) {
    $scope.jsonObj = {
        labels: ['1', '2', '3', '4', '5', '6'],
        series: [{
            name: 'Fibonacci sequence',
            data: [1, 2, 3, 5, 8, 13]
        }, {
            name: 'Golden section',
            data: [1, 1.618, 2.618, 4.236, 6.854, 11.09]
        }]
    };
});
```

### Print JSON String ###

```HTML
<pre json-pretty data="jsonStr"></pre>
```

```JavaScript
demo.controller('DemoController', function($scope) {
    $scope.jsonStr = '{"name":"Test","series":[{"name":"Fibonacci sequence","data":[1,2,3,5,8,13]}]}';
});
```


## LICENSE ##

[MIT License](https://raw.githubusercontent.com/leftstick/angular-json-pretty/master/LICENSE)

# vbp-phantomjs-wrapper
This library is a wrapper which provides functionalities to queue different phantomjs page request, calls external scripts provided for handling test cases, screenshots of the webpage, scrap cloudflare protected pages as well.

### Requirements
PhantomJS 2.1.1

### Example
```javascript
phantom.injectJs('./vbphantom.js'); // include the vbphantom.js library
var obj = new VBPhantom(); //create the object
obj.setScreenShots(true); //set if you want screenshots of the url
obj.setDebugMode(true); //if you set it to true you will get more information on console
obj.setLoadImages(true); //If you skip loading images, it will speed the scrapping
obj.enqueueRequests('./data/input.json'); // set the file containing the input urls requests data.
obj.handleRequests(); //Execute the requests.
```

An example input.json file.
```json
[
  {
    "cfTimeout": 0, 
    "url": "http://phantomjs.org/",
    "scripts": ["https://code.jquery.com/jquery-2.2.4.min.js"],
    "settings": {}
  }
]
```

You can also pass the above json object directly to the enqueueRequests method as a parameter. It must be stringified JSON. If you want to execute only single request do not wrap it in the array notation.

####Parameters Explanation
#####cfTimeout
cfTimeout specifies number seconds to wait for process to complete. CF normally takes 5s test in CF case you should set it to 6 to carry out the CF challenge.
#####url
URL to scrap. Include the get parameters here for GET requests after ? symbol
#####scripts
List of scripts you want to include before runing tests against the page.
#####settings
Refer phantomjs page.open(url, settings,callback);

###Convenient Methods.
#####setScreenShots(boolean)
Whether to take screenshots of the web page. Default: false

#####setUserAgent(string)
Pass in the user agent string to use as a userAgent while making the web requests. Default: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36

#####setLoadImages(boolean)
Whether to load the images on the requested web page. Default: false

#####setViewportSize(width number, heigth number)
Specify the size of the web page window. Default: 1280x600

#####setImagePath(string)
Where to store the web page image

#####setJsPath(string)
Where are your main.js scripts located that vbphantom will execute after loading the web page. This would be the entry point for your further processing on the loading web page. vbphantom will call the "execute" method of your provide main.js script.

###main.js - Your custom script
vbphantom allow you to execute different javascripts on the loaded page. After loading each url specified in the input.json file, the main.js file will be loaded and the execute method of the this script will be called. This script must have the following two methods.

#####execute
method to call after loading the web page.

#####exit
A method containing window.close() function to signal the end of your custom processing. If you do not provide this function vbphantom will hang up and will not process next requests.

####main.js example

```javascript
var main = {
  execute: function () {
    if(typeof jQuery === 'function') {
      jQuery(function () {
        console.log('Page is ready for test cases.');
        main.exit();
      })
    } else {
      console.log('jQuery not found.');
      main.exit();
    }
  },
  exit: function () {
    setTimeout(function(){
      window.close();
    }, 5000);
  }
};
```

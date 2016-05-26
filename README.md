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

####Parameters Explanation
#####cfTimeout
cfTimeout specifies number seconds to wait for process to complete. CF normally takes 5s test in CF case you should set it to 6 to carry out the CF challenge.
#####url
URL to scrap. Include the get parameters here for GET requests after ? symbol
#####scripts
List of scripts you want to include before runing tests against the page.
#####settings
Refer phantomjs page.open(url, settings,callback);


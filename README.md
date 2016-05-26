# vbp-phantomjs-wrapper
This library is a wrapper which provides functionalities to queue different phantomjs page request, calls external scripts provided for handling test cases, screenshots of the webpage, scrap cloudflare protected pages as well.

### Requirements
PhantomJS 2.1.1

### Example
```
phantom.injectJs('./vbphantom.js');
var obj = new VBPhantom();
obj.setScreenShots(true);
obj.setDebugMode(true);
obj.setLoadImages(true);
obj.enqueueRequests('./data/input.json');
obj.handleRequests();

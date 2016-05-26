phantom.injectJs('./vbphantom.js');
var obj = new VBPhantom();
obj.setScreenShots(true);
obj.setDebugMode(true);
obj.setLoadImages(true);
obj.enqueueRequests('./data/input.json');
obj.handleRequests();
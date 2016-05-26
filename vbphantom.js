var
  webPage = require('webpage'),
  system = require('system'),
  fs = require('fs');
  
function VBPhantom() {
  this.requests = [];
  this.current = 0;
  this.config = {
    timeout: 2,
    debug: true,
    imagesPath: './screenshots',
    jsPath: './js',
    screenShot: false,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36',
    loadImages: false,
    viewportSize: {
      width: 1280,
      height: 600
    }
  };
  
  //enable the cookie support in phantom
  phantom.cookiesEnabled = true;
  //enable javascript support in phantom
  phantom.javascriptEnabled = true;
}

VBPhantom.prototype.init = function (request) {
  this.page = webPage.create();
  this.page.viewportSize = this.config.viewportSize;
  
  //set the user agent of the page.
  this.page.settings.userAgent = this.config.userAgent;
  //set page javascript setting enabled.
  this.page.settings.javascriptEnabled = true;
  //set loading image to false for faster processing.
  this.page.settings.loadImages = this.config.loadImages;
    
  // Page Events Start
  this.page.onClosing = function (closedPage) {
    this.config.debug && console.log('[VBP]-> Closing page with URL: '+closedPage.url);
    //Put some delay before executing the next request to escape operation cancelled.
    setTimeout(function() {
      this.handleRequests(this);
    }.bind(this), this.config.timeout * 1000);
  }.bind(this);
  
  this.page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log(msg);
  }.bind(this);
  
  this.page.onError = function (err, trace) {
    var msgStack = ['[VBP]-> ERROR: ' + msg];
    if (trace && trace.length) {
      msgStack.push('[VBP]-> TRACE:');
      trace.forEach(function(t) {
        msgStack.push(' [VBP]-> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
      });
    }
    this.config.debug && console.error(msgStack.join('\n'));
  }.bind(this);

  this.page.onResourceError = function(resourceError) {
    this.config.debug && console.log('[VBP]-> Unable to load resource ((#' + resourceError.id + ') URL:' + resourceError.url + ')');
    this.config.debug && console.log('[VBP]-> Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
  }.bind(this);
    
  this.page.onResourceReceived = function(response) {
    this.config.debug && console.log('[VBP]-> Response (#' + response.id + ', stage "' + response.stage + '")');
  }.bind(this);
  
  this.page.onLoadFinished = function(status) {
    this.config.debug && console.log('[VBP]-> Page loaded.');
    // Do other things here...
  }.bind(this);
  //Page Events End.
};

VBPhantom.prototype.addScript = function (request) {
  var cdn = /^http.?:\/\/.*/i, i=0;
  var includeJs = function () {
    if(request.scripts && request.scripts.length <= i) {
      this.evaluate();
      return;
    }
    
    var script = request.scripts[i];
    if (cdn.test(script)) {
      this.page.includeJs(script, function() {
        this.config.debug && console.log('[VBP]-> Script '+script+' included.');
        i++;
        includeJs();
      }.bind(this));
    } else {
      if (this.page.injectJs(script)) {
        this.config.debug && console.log('[VBP]-> Script '+script+' included.');
        i++;
        includeJs();
      }
    }
  }.bind(this);
  
  includeJs(request.scripts);
};

VBPhantom.prototype.evaluate = function () {
  var name;
  if (this.page.injectJs(this.config.jsPath+'/main.js')) {
    this.page.evaluate(function () {
      //console.log('[VBP]-> Executing user script...');
      main.execute();
    });
    
    if (true === this.config.screenShot) {
      name = Date.now();
      this.page.render(this.config.imagesPath+'/'+name+'.jpg');
      fs.write(this.config.imagesPath+'/'+name+'.html', this.page.content, 'w');
    }
  } else {
    this.config.debug && console.error('[VBP]-> Cannot find main.js');
    this.page.close();
  }
};

VBPhantom.prototype.makeRequest = function (request, attempt) {
  if (attempt === undefined) {
    attempt = 0;
  }
  
  if(request.settings && request.settings.data) {
    request.settings.data = JSON.stringify(request.settings.data);
  }
  
  this.page.open(request.url, request.settings, function (status) {
    if (status === 'success') {
      if(request.cfTimeout > 0) {
        setTimeout(function () {
          this.addScript(request);
        }.bind(this), request.cfTimeout * 1000);
      } else {
        this.addScript(request);
      }
    } else {
      if (attempt < 3) {
        this.config.debug && console.log('[VBP]-> Request failed for URL "'+request.url+'", Attempt: ' + attempt);
        setTimeout(this.makeRequest.bind(this, request, ++attempt), 0);
      } else {
        this.page.close();
      }
    }
  }.bind(this));
};

VBPhantom.prototype.exit = function () {
  phantom.exit();
};

VBPhantom.prototype.enqueueRequests = function (file) {
  var r,i,obj;
  
  if (file && fs.isReadable(file)) {
    r = fs.read(file);
  } else {
    r = file;
  }
  
  try {
    r = JSON.parse(r);
  } catch (e) {
    this.config.debug && console.log('[VBP]-> No requests found. ' + e);
    return;
  }
  
  if (Array.isArray(r) && r.length > 0) {
    for(i=0;i<r.length; i++) {
      obj = this.validateInput(r[i]);
      if (obj !== false) {
        this.requests[i] = obj;
      }
    }
  } else {
    obj = this.validateInput(r);
    
    if (obj !== false) {
      this.requests[0] = obj;
    }
  }
  this.config.debug && console.log('[VBP]-> Enqueue operation completed.');
};

VBPhantom.prototype.validateInput = function (data) {
  var obj = {};
  if(data.hasOwnProperty('url') && data.url.length > 1) {
    obj.url = data.url;  
  } else {
    return false;
  }
  
  if (data.hasOwnProperty('cfTimeout')) {
    obj.cfTimeout = isFinite(Number(data.cfTimeout)) ? Number(data.cfTimeout) : 0; 
  } else {
    obj.cfTimeout = 0;
  }
  
  if(data.hasOwnProperty('scripts') && Array.isArray(data.scripts)) {
    obj.scripts = data.scripts;
  } else {
    obj.scripts = [];
  }
  
  if(data.hasOwnProperty('settings') && typeof data.settings === 'object') {
    if(Object.keys(data.settings).length > 0) {
      obj.settings = data.settings;
    } else {
      obj.settings = {};
    }
  }
  
  return obj;
};

VBPhantom.prototype.handleRequests = function () {
  if (this.current >= this.requests.length) {
    this.exit();
  }
  this.config.debug && console.log('[VBP]-> Handling '+this.requests[this.current].url);
  this.init(this.requests[this.current]);
  this.makeRequest(this.requests[this.current]);
  
  this.current++;
  
};

VBPhantom.prototype.setTimeout = function (seconds) {
  if (isFinite(seconds)) {
    this.config.timeout = Number(seconds);
  }
};

VBPhantom.prototype.setScreenShots = function (b) {
  if (true === b) {
    this.config.screenShot = true;
  } else {
    this.config.screenShot = false;
  }
};

VBPhantom.prototype.setUserAgent = function (agent) {
  if (typeof agent === 'string') {
    this.config.userAgent = agent;
  }  
};

VBPhantom.prototype.setLoadImages = function (b) {
  if (true === b) {
    this.config.loadImages = true;
  } else {
    this.config.loadImages = false;
  }
};

VBPhantom.prototype.setDebugMode = function (b) {
  if (true === b) {
    this.config.debug = true;
  } else {
    this.config.debug = false;
  }
};

VBPhantom.prototype.setViewportSize = function (w, h) {
  if (isFinite(w)) {
    this.config.viewportSize.width = Number(w);
  }
  
  if (isFinite(h)) {
    this.config.viewportSize.heigth = Number(h);
  }
};

VBPhantom.prototype.setImagePath = function (p) {
  if (typeof p === 'string') {
    this.config.imagesPath = p;
  }
};

VBPhantom.prototype.setJsPath = function (p) {
  if (typeof p === 'string') {
    this.config.jsPath = p;
  }
};
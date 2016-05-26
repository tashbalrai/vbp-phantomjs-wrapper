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


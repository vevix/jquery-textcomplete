+function ($) {
  'use strict';

  // Memoize a search function.
  var memoize = function (func) {
    var memo = {};
    return function (term, callback) {
      if (memo[term]) {
        callback(memo[term]);
      } else {
        func.call(this, term, function (data) {
          memo[term] = (memo[term] || []).concat(data);
          callback.apply(null, arguments);
        });
      }
    };
  };

  var now = Date.now || function () { return new Date().getTime(); };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // `wait` msec.
  //
  // This utility function was originally implemented at Underscore.js.
  var debounce = function (func, wait) {
    var timeout, args, context, timestamp, result;
    var later = function () {
      var last = now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        result = func.apply(context, args);
        context = args = null;
      }
    };

    return function () {
      context = this;
      args = arguments;
      timestamp = now();
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      return result;
    };
  };

  function Strategy(options) {
    $.extend(this, options);
    if (this.debounce) { this.search = debounce(this.search, this.debounce); }
    if (this.cache) { this.search = memoize(this.search); }
  }

  Strategy.parse = function (strategiesArray, params) {
    return $.map(strategiesArray, function (strategy) {
      var strategyObj = new Strategy(strategy);
      strategyObj.el = params.el;
      strategyObj.$el = params.$el;
      return strategyObj;
    });
  };

  $.extend(Strategy.prototype, {
    // Public properties
    // -----------------

    // Required
    match:      null,
    replace:    null,
    search:     null,

    // Optional
    cache:      false,
    context:    function () { return true; },
    index:      2,
    template:   function (obj) { return obj; },
    idProperty: null,
    debounce:   null
  });

  $.fn.textcomplete.Strategy = Strategy;

}(jQuery);

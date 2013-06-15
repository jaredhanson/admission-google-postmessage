define(['exports'],
function(exports) {
  
  var XHTML_NS = 'http://www.w3.org/1999/xhtml';
  
  exports.create = function(tagName) {
    return (document.body && !document.body.namespaceURI) ?
        document.createElement(tagName) :
        document.createElementNS(XHTML_NS, tagName);
  };
  
  exports.openFrame = function(location, name) {
    var frame = exports.create('iframe');
    if (name) {
      try {
        var frameIE = exports.create(
            '<iframe' +
            ' name="' + escape(name) + '"' +
            ' id="' + escape(name) + '">' +
            '</iframe>');
        if (frameIE &&
            (frameIE.tagName == frame.tagName) &&
            (frameIE.namespaceURI == frame.namespaceURI) &&
            (frameIE.name == name)) {
          frame = frameIE;
        }
      } catch (_notIE) {}
      frame.name = name;
      frame.id = name;
    }
    if (location) {
      frame.src = location;
    }
    body().appendChild(frame);
    if (location) {
      window.frames[name].location = location;
    }
    return frame;
  };
  
  exports.openHiddenFrame = function(location, name) {
    var frame = exports.openFrame(location, name);
    frame.style.position = 'absolute';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.visibility = 'hidden';
    frame.style.left = '-1000px';
    frame.style.top = '-1000px';
    frame.height = '0';
    frame.width = '0';
    frame.frameborder = '0';
    frame.scrolling = 'no';
    frame.marginHeight = '0';
    frame.marginWidth = '0';
    return frame;
  };
  
  function body() {
    var body = document.body;
    if (!body) {
      try {
        var xbodies = document.getElementsByTagNameNS(XHTML_NS, 'body');
        if (xbodies && (xbodies.length > 0)) {
          body = xbodies[0];
        }
      } catch (_noXHTML) {}
    }
    return body || document.documentElement || document;
  }
  
  function escape(val) {
    return (String(val).split('&')
                       .join('&amp;')
                       .split('"')
                       .join('&quot;')
                       .split('\'')
                       .join('&#39;')
                       .split('<')
                       .join('&lt;')
                       .split('>')
                       .join('&gt;'));
  };
  
});

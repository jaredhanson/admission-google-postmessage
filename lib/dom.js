define(['exports'],
function(exports) {
  
  var XHTML_NS = 'http://www.w3.org/1999/xhtml';
  
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
  
  function createHtmlElement(tagName) {
    return (document.body && !document.body.namespaceURI) ?
        document.createElement(tagName) :
        document.createElementNS(XHTML_NS, tagName);
  };
  
  function escapeHtmlAttribute(val) {
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
  
  function openFrame(location, name) {
    var frame = createHtmlElement('iframe');
    if (name) {
      try {
        var frameIE = createHtmlElement(
            '<iframe' +
            ' name="' + escapeHtmlAttribute(name) + '"' +
            ' id="' + escapeHtmlAttribute(name) + '">' +
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
  
  function openHiddenFrame(location, name) {
    var frame = openFrame(location, name);
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
    frame.tabIndex = '-1'
    return frame;
  };
  
  exports.openFrame = openFrame;
  exports.openHiddenFrame = openHiddenFrame;
  
});

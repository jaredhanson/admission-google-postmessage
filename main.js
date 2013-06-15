define(['./lib/dom',
        'gadgets.rpc',
        'querystring',
        'class'],
function(dom, rpc, qs, clazz) {
  
  /**
   * `Provider` constructor.
   *
   * Examples:
   *
   *     admission.use(new GoogleProvider({
   *         clientID: '123456789',
   *         redirectURL: 'http://127.0.0.1:3000/auth/google/redirect',
   *         responseType: 'token'
   *       }));
   *
   * References:
   *  - [Google+ Sign-In](https://developers.google.com/+/web/signin/)
   *  - [Google+ Sign-In for server-side apps](https://developers.google.com/+/web/signin/server-side-flow)
   *  - [oauth2-postmessage-profile](https://code.google.com/p/oauth2-postmessage-profile/)
   *
   * @param {Object} opts
   * @api public
   */
  function Provider(opts) {
    opts = opts || {};
    opts.authorizationURL = opts.authorizationURL || 'https://accounts.google.com/o/oauth2/auth';
    this.name = 'google';
  }
  
  var IDP = IDP = 'https://accounts.google.com/o/oauth2/';
  var PROXY_URL = IDP + 'postmessageRelay';
  //var PROXY_ID = 'oauth2-relay-frame';
  var PROXY_ID = 'oauth2-relay-frame-2';
  var PROXY_READY_CHANNEL = 'oauth2relayReady';
  var FORCE_SECURE_PARAM_VALUE = '1';
  
  Provider.prototype.start = function() {
    var query = {
      parent: rpc.getOrigin(window.location.href)
    }
    var frag = {
      rpctoken: Math.random(),
      forcesecure: FORCE_SECURE_PARAM_VALUE
    }
    
    
    var proxyUrl = PROXY_URL + '?' + qs.stringify(query) + '#' + qs.stringify(frag);
    console.log('PROXY URL: ' + proxyUrl);
    
    var postmessageRelayFrame = dom.openHiddenFrame(
            proxyUrl,
            PROXY_ID);
    postmessageRelayFrame.tabIndex = '-1';
    
    rpc.setupReceiver(PROXY_ID);
    
    
    var rpcToken = rpc.getAuthToken(PROXY_ID);
    var channelName = PROXY_READY_CHANNEL + ':' + rpcToken;
    
    rpc.register(channelName, function() {
      
    });
    return this;
  }
  
  return Provider;
});

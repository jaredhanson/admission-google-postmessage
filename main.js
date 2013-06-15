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
    this._clientID = opts.clientID;
    this._scope = opts.scope;
    this.name = 'google';
  }
  
  var IDP = IDP = 'https://accounts.google.com/o/oauth2/';
  var PROXY_URL = IDP + 'postmessageRelay';
  var AUTH_URL = IDP + 'auth';
  
  //var PROXY_ID = 'oauth2-relay-frame';
  var PROXY_ID = 'oauth2-relay-frame-2';
  var PROXY_READY_CHANNEL = 'oauth2relayReady';
  var CALLBACK_CHANNEL = 'oauth2callback';
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
    
    var self = this;
    rpc.register(channelName, function() {
      console.log('!!! CHANNEL READY !!!');
      rpc.unregister(channelName);
      
      
      var cn = CALLBACK_CHANNEL + ':' + rpcToken;
      rpc.register(cn, function() {
        console.log('!!! OAUTH2 CALLBACK');
      });
      
      relayReady(self._getAuthUrl(true));
    });
    return this;
  }
  
  function relayReady(authUrl) {
    console.log('RELAY READY!');
    
    // TODO: Close down an open auth window.
    
    console.log(authUrl);
    dom.openHiddenFrame(authUrl, 'immediate-auth-frame').tabIndex = '-1';
  }
  
  Provider.prototype._getAuthUrl = function(immediate) {
    var query = {
      response_type: 'token',
      client_id: this._clientID,
      scope: this._scope,
      state: Math.random(),
      redirect_uri: 'postmessage',
      proxy: PROXY_ID,
      origin: rpc.getOrigin(window.location.href)
    }
    
    if (immediate) {
      query.immediate = 'true'
    }
    // TODO: Implement support for additional options.
    query.authuser = 0;
    
    var authUrl = AUTH_URL + '?' + qs.stringify(query);
    return authUrl;
  }
  
  return Provider;
});

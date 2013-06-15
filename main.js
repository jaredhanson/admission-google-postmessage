define(['./lib/dom',
        'gadgets.rpc',
        'querystring',
        'class'],
function(dom, rpc, qs, clazz) {
  
  var RELAY_READY_CHANNEL = 'oauth2relayReady';
  var CALLBACK_CHANNEL = 'oauth2callback';
  
  
  /**
   * `Provider` constructor.
   *
   * Examples:
   *
   *     admission.use(new GoogleProvider({
   *         clientID: '123456789'
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
    this.name = 'google';
    this._authorizationURL = opts.authorizationURL || 'https://accounts.google.com/o/oauth2/auth';
    this._relayURL = opts.relayURL || 'https://accounts.google.com/o/oauth2/postmessageRelay';
    this._clientID = opts.clientID;
    this._scope = opts.scope;
    this._responseType = opts.responseType || 'token';
    this._relayID = undefined;
  }
  
  /**
   * Start the identity provider.
   *
   * @return {Provider}
   * @api public
   */
  Provider.prototype.start = function() {
    // TODO: append a random string here to avoid potential conflicts.
    this._relayID = 'oauth2-relay-frame-2';
    
    var query = {
      parent: rpc.getOrigin(window.location.href)
    }
    var frag = {
      rpctoken: Math.random(),
      forcesecure: '1'
    }
    var relayUrl = this._relayURL + '?' + qs.stringify(query) + '#' + qs.stringify(frag);
    
    // Open the OAuth 2.0 postMessage relay in a hidden iframe.
    dom.openHiddenFrame(relayUrl, this._relayID);
    
    // Setup RPC to communicate with the relay iframe.
    rpc.setupReceiver(this._relayID);
    
    
    var self = this;
    var rpcToken = rpc.getAuthToken(this._relayID);
    var relayReadyServiceName = RELAY_READY_CHANNEL + ':' + rpcToken;
    
    // Register a handler for the `oauth2relayReady` service.  The relay iframe
    // will call this this service immediately after it has loaded.
    rpc.register(relayReadyServiceName, function() {
      rpc.unregister(relayReadyServiceName);
      
      // Register a handler for the `oauth2callback` service.  The relay iframe
      // will call this service when it receives OAuth 2.0 responses.
      var callbackServiceName = CALLBACK_CHANNEL + ':' + rpcToken;
      rpc.register(callbackServiceName, onCallback);
      onRelayReady();
    });
    
    
    function onRelayReady() {
      var authUrl = self._getAuthUrl(true);
      
      console.log(authUrl);
      
      // TODO: Make the initial immediate mode check optional.
      
      dom.openHiddenFrame(authUrl, 'immediate-auth-frame');
    }
    
    function onCallback(result) {
      console.log('!!! OAUTH2 CALLBACK');
      console.log(result);
    }
    
    return this;
  }
  
  Provider.prototype._getAuthUrl = function(immediate) {
    var query = {
      response_type: this._responseType,
      client_id: this._clientID,
      scope: this._scope,
      state: Math.random(),
      redirect_uri: 'postmessage',
      proxy: this._relayID,
      origin: rpc.getOrigin(window.location.href)
    }
    
    if (immediate) {
      query.immediate = 'true'
    }
    // TODO: Implement support for additional options.
    query.authuser = 0;
    
    var authUrl = this._authorizationURL + '?' + qs.stringify(query);
    return authUrl;
  }
  
  return Provider;
});

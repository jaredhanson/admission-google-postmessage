define(['admission-oauth2',
        'class'],
function(OAuth2Provider, clazz) {
  
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
    OAuth2Provider.call(this, opts);
    this.name = 'google';
  }
  
  /**
   * Inherit from `OAuth2Provider`.
   */
  clazz.inherits(Provider, OAuth2Provider);
  
  /**
   * Retrieve info for `token`.
   *
   * @param {String} token
   * @param {Function} cb
   * @api protected
   */
  Provider.prototype.tokenInfo = function(token, cb) {
    var url = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + token;
    var req = ajax.get(url, function(res) {
      res.on('end', function() {
        // TODO: Check status code.
        
        var json = JSON.parse(res.responseText)
          , info = {}
          , profile = {};
        info.audience = json.audience;
        profile.id = json.user_id;
        return cb(null, info, profile);
      });
    });

    req.on('error', function(err) {
      return cb(err);
    });
  }
  
  /**
   * Retrieve the user profile from Facebook.
   *
   * @param {String} token
   * @param {Function} cb
   * @api protected
   */
  Provider.prototype.userProfile = function(token, profile, cb) {
    // TODO: Optionally fetch from API endpoint.
    return cb(null, profile);
  }
  
  return Provider;
});

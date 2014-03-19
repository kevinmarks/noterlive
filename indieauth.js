/**
 * IndieAuth API
 * 0.1 way to auth against IndieAuth for micropub
 */

function _domainIsValid(domain) {
    aurl = require('url').parse(domain);

    if (aurl == null
      || !aurl.protocol
      || !(aurl.protocol==='http' || aurl.protocol==='https')
      || !aurl.host
      || aurl.path && aurl.path != '/')  // must be top-level domain, no paths
    ) {
      // Invalid domain
      return false;
    }

    return true;
  }


function IndieAuthClient(){
    this.deAuth();
}

IndieAuthClient.prototype.deAuth = function(){
    this.authorization_endpoint = null;
    this.token_endpoint = null;
    this.micropub_endpoint = null;
    this.access_token = null;
    this._headers =null; //cache
    this._body =null; //cache
    return this;
}

IndieAuthClient.prototype._fetchHead = function(url){
    if (this._headers) {
    	return this._headers;
    } else {
    this._headers = require('request').head(url)
 	return this._headers;
}

IndieAuthClient.prototype._fetchBody = function(url){
    if (this._headers) {
    	return this._body;
    } else {
    this._body = require('request').get(url)
 	return this._body;
}

IndieAuthClient.prototype._discoverEndpoint(domain, name) {
    if(!this._domainIsValid(domain))
      return null;

    // First check the HTTP headers for an authorization endpoint
    headers = this._fetchHead(domain);
    links= headers.response.headers.link;
    if (links) {
    	for link in links.split(',') {
    		urlrel = link.split(';');
    		if (urlrel[1].indexOf(name) !== -1) {
    			return urlrel[0].slice(1,-1);
    		}
    	}
/*    // If not found, check the body for a rel value TODO
    html = this._fetchBody(domain);

    $parser = new \mf2\Parser($html);
    $data = $parser->parse();

    if($data && array_key_exists('rels', $data)) {
      if(array_key_exists($name, $data['rels'])) {
        return $data['rels'][$name][0];
      }
    }
    
    */

    return false;
  }

IndieAuthClient.prototype.discoverAuthorizationEndpoint(domain) {
	return this._discoverEndpoint(domain, 'authorization_endpoint');
}

IndieAuthClient.prototype.discoverTokenEndpoint(domain) {
	return this._discoverEndpoint(domain, 'authorization_endpoint');
}

IndieAuthClient.prototype.discoverMicropubEndpoint(domain) {
	return this._discoverEndpoint(domain, 'authorization_endpoint');
}

// Optional helper method to generate a state parameter. You can just as easily do this yourself some other way.
IndieAuthClient.prototype.generateStateParameter() {
	return Math.floor(Math.random()*8999999+1000000);
}

  // Build the authorization URL for the given domain and endpoint
IndieAuthClient.buildAuthorizationURL(authorizationEndpoint, domain, redirectURI, clientID, state, scope='') {
    var aurl = require('url').parse(authorizationEndpoint,true);

    var params = {};
    if(aurl.query)) {
      params = aurl.query;
    }

    params['me'] = domain;
    params['redirect_uri'] = redirectURI;
    params['client_id'] = clientID;
    params['state'] = state;
    if(scope) { params['scope'] = scope; }

    aurl['query'] = params;

    return url.format(aurl);
  }
  
    // Used by clients to get an access token given an auth code
  public static function getAccessToken($tokenEndpoint, $code, $domain, $redirectURI, $clientID, $state, $debug=false) {

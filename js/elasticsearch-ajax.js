// This file is provided to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file
// except in compliance with the License.  You may obtain
// a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

ElasticSearch.Ajax = {
  ajax: function(url, settings, callback) {
    var method = settings.method || ElasticSearch.Utils.method.post;
    method = method.toUpperCase();

    var httpRequest;
    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
      httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE
      try {
        httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
      } catch(e) {
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
      } 
    }

    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'text/javascript, application/json, */*',
      'Content-Type': 'application/x-www-form-urlencoded charset=UTF-8'
    };

    if (httpRequest.overrideMimeType
        && (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
      headers['Connection'] = 'close';


    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState == 4) {
        var json;
        try {
          json = eval('('+httpRequest.responseText+')');
        } catch(e) {
          ElasticSearch.log(e);
          callback(e.toString(), httpRequest, e);
          return;
        }
        if (httpRequest.status == 200) {
          callback(json, httpRequest);
        } else {
          callback("error", httpRequest, json);

        }
      }
    };

    httpRequest.open(method, url, true);
    for (var name in headers) {
      httpRequest.setRequestHeader(name, headers[name]);
    } 
    httpRequest.send(settings.requestBody);
  }
};


ElasticSearch.prototype.getClient = function() {
    return ElasticSearch.Ajax;
}

ElasticSearch.prototype.log = function(message, error) {
    if (this.defaults.debug && typeof console === 'object') {
        console.log('[elasticsearch-js] ' + (error ? 'ERROR: ' : ''), message);
    }
}

ElasticSearch.prototype.executeInternal = function(path, options, callback) {
  var settings = {
    method: options.method.toUpperCase(),
    requestBody: options.stringifyData
  }
  this.client.ajax(path, settings, callback);
}

// TODO: support the deep arg
ElasticSearch.prototype.mixin = function() {
  var target = arguments[0];
  for (var i=1; i<arguments.length; i++) {
    for (var k in arguments[i])
      target[k] = arguments[i][k];
  }
  return target;
}

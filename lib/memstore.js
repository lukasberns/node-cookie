var tough = require('./cookie');
var permuteDomain = tough.permuteDomain;
var permutePath = tough.permutePath;

function MemoryCookieStore() {
  this.idx = {};
}
module.exports.MemoryCookieStore = MemoryCookieStore;
MemoryCookieStore.prototype.idx = null;

MemoryCookieStore.prototype.findCookie = function findCookie(domain, path, key, cb) {
  if (!this.idx[domain]) return cb(null,undefined);
  if (!this.idx[domain][path]) return cb(null,undefined);
  return cb(null,this.idx[domain][path][key]||null);
};

MemoryCookieStore.prototype.findCookies = function findCookies(domain, path, cb) {
  var results = [];
  var domains = permuteDomain(domain), dlen = domains.length;
  var paths = permutePath(path), plen = paths.length;
  var i,j;
  for (var i=0; i<dlen; i++) {
    var curDomain = domains[i];
    var domainIndex = this.idx[curDomain];
    if (!domainIndex) continue;
    for (var j=0; j<plen; j++) {
      var curPath = paths[j];
      var pathIndex = domainIndex[curPath];
      if (!pathIndex) continue;
      for (var key in pathIndex) {
        results.push(pathIndex[key]);
      }
    }
  }
  cb(null,results);
};

MemoryCookieStore.prototype.putCookie = function putCookie(cookie, cb) {
  var path = permutePath(cookie.path).shift();
  if (!this.idx[cookie.domain]) this.idx[cookie.domain] = {};
  if (!this.idx[cookie.domain][path]) this.idx[cookie.domain][path] = {};
  this.idx[cookie.domain][path][cookie.key] = cookie;
  cb(null);
};

MemoryCookieStore.prototype.removeCookie = function removeCookie(domain, path, key, cb) {
  path = permutePath(path).shift();
  if (this.idx[domain] && this.idx[domain][path] && this.idx[domain][path][key]) {
    delete this.idx[domain][path][key];
  }
  cb(null);
};

MemoryCookieStore.prototype.removeCookies = function removeCookies(domain, path, cb) {
  path = permutePath(path).shift();
  if (!this.idx[domain]) {
    if (path) {
      delete this.idx[domain][path];
    } else {
      delete this.idx[domain];
    }
  }
  return cb(null);
};

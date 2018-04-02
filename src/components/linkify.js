// Takes plain text and replaces links with HTML anchor elements.
"use strict";

// Modified from https://github.com/parshap/html-linkify

// Link regex
// See http://daringfireball.net/2010/07/improved_regex_for_matching_urls
var rLink = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;

var rHash = /\B(\#[a-zA-Z]+\b)/gi;

var rBreak = /\n/gi;

var escape = require("./htmlEscape");

export default function(text, options) {
  if ( ! options) options = {};

  var retval = "", cur = 0, match;

  var escapeFn = options.escape === false ? function(str) { return str; } : escape;

  while (match = rLink.exec(text)) {
    retval += escapeFn(text.slice(cur, match.index));
    retval += anchor(match[0], match[0], options.attributes);
    cur = rLink.lastIndex;
  }
  retval += escapeFn(text.slice(cur));

  text = retval;
  retval = "", cur = 0;

  while (match = rHash.exec(text)) {
    retval += text.slice(cur, match.index);
    retval += anchor(match[0], "/hashtag/" + match[0].slice(1), options.attributes);
    cur = rHash.lastIndex;
  }
  retval += text.slice(cur);

  text = retval;
  retval = "", cur = 0;

  while (match = rBreak.exec(text)) {
    retval += text.slice(cur, match.index);
    retval += "<br>";
    cur = rBreak.lastIndex;
  }
  retval += text.slice(cur);

  return retval;
};

// Return an anchor element for the url
function anchor(text, url, attrs) {
  var text = escape(text),
      href = escape(url);

  // Ensure protocol at beginning of url
  if (!href[0] === '/' && !/^[a-zA-Z]{1,6}:/.test(href)) {
    href = 'http://' + href;
  }

  var attrsString = combine({ href: href }, attrs);

  return "<a " + attrsString + ">" + text + "</a>";
}

// combine attrs objects into single string
function combine() {
  return Array.prototype.slice.call(arguments)
	      .map(attributes)
	      .filter(Boolean)
	      .join(" ");
}

function attributes(attrs) {
  if ( ! attrs) return "";
  return Object.keys(attrs).map(function(name) {
    var value = attrs[name];
    return escape(name) + "=\"" + escape(value) + "\"";
  }).join(" ");
}

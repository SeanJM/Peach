
/*  
    Simple as simple gets templates 
    Sean J MacIsaac (seanjmacisaac@gmail.com)
    VERSION: 0.5

    The MIT License (MIT)
    Copyright (c) 2013 Sean J MacIsaac

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
    and associated documentation files (the "Software"), to deal in the Software without restriction, 
    including without limitation the rights to use, copy, modify, merge, publish, distribute, 
    sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is 
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or 
    substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
    BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 

*/

var template = {};

/* 
USAGE: 

template.get({'name':'template','src':'./templates/template.html'},function (processed-html) {}); 
*/
template.get = function (obj,callback) {
  var tmp     = $('<div></div>');
  var address = obj.src + ' [template="' + obj.template + '"]';

  tmp.load(address,function(){
    if (typeof callback === 'function') {
      callback(tmp.children().html().trim());
    }
  });
}

/* 
USAGE: 

template.insert({template:'<div>{{template-tag}}</div>',keys:{template-tag:'This value that I want}) 

optional If statements: '{{if {{template-tag}} <div>{{template-tag}}</div> end}}'

The if statement checks if {{template-tag}} is undefined or empty
*/
template.insert = function (obj,callback) {
  var arr;
  var ifmatch;
  var keys = obj['keys'];
  var str  = obj['template'];

  /* Check for if statements */
  str = str.replace(/{{if\s*(.*?)end}}/g,function (m,key) {
    ifmatch = key.split(' ')[0].split('{{')[1].split('}}')[0];
    if (typeof keys[ifmatch] != 'undefined' && keys[ifmatch].length > 0) {
      arr = key.split(' ');
      arr.splice(0,1);
      return arr.join(' ');
    }
    return '';
  });

  /* Replace keys with values */
  return str.replace(/{{\s*(.*?)}}/g,function(m,key){
    if (!keys.hasOwnProperty(key)) { return ''; }
    return keys[key];
  });
}

/* Loops through an arrow containing objects, each entry 
in the array will be a duplicate template element */
template.fill = function (obj,callback) {
  var str     = obj['template'],
      keys    = obj['keys'],
      output  = [];

  for (i=0;i<keys.length;i++) { output.push(template.insert(str,keys[i])); }
  if (typeof callback == 'function') { callback(output.join('')); }
  return output.join(''); 
}

/* Scans the active screen for a template -- replaces the empty contents of that template 
with the processed contents from the template string (or template from an html file) */
template.init = function(activeScreen,callback) {
  console.log('Scanning for templates...');

  activeScreen.find('[template]').each(function(){
    var keys         = $(this).attr('keys');
    var onload       = $(this).attr('onload');
    var processed;
    var selected     = $(this);
    var src          = $(this).attr('src');
    var temp         = $('<div></div>');
    var templateName = $(this).attr('template');

    temp.get({'src':src,'template':templateName},function (str) {

      if (typeof keys != 'undefined') { processed = $(template.fill({'template':str,'keys':template.keys[keys]()})); }
      if (typeof keys == 'undefined') { processed = $(str); }

      selected.children().remove();
      selected.append(processed);
      
      if (typeof fun[onload] == 'function') { fun[onload](processed); }
      if (typeof callback == 'function') { callback(); }
    
    });
  });
}

$(function () {
  /* Initialize scanning for template tag */
  template.init('body');
});
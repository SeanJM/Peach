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

# Functions

## Function: template.get()

### USAGE: 
`template.get({name:'template',src:'./templates/template.html'},function (html) {});`

### EXAMPLE
`template.get({name:'work',src:./templates/work-page-templates.html},function (html) {
    var keys    = {foo:'bar'}
  /* Get element, insert keys and convert to jQuery object */
  var element = $(template.insert({template:html,keys:keys}));

  element.appendTo('body');
});`

## Function: template.insert()

### USAGE: 

`var templatePre = '<div>{{template-tag}}</div>';
var keys        = {template-tag:foobar};
var element     = template.insert({template:templatePre,keys:keys});`

Optional If statements: 
`var element = template.insert{{if {{template-tag}} <div>{{template-tag}}</div> end}}`

The if statement checks if {{template-tag}} is undefined or empty

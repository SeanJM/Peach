# Simple as simple gets templates 
#### By Sean J MacIsaac (seanjmacisaac@gmail.com)
#### VERSION: 0.5

#### The MIT License (MIT)
#### Copyright (c) 2013 Sean J MacIsaac

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

#### This script requires jQuery to work.

# Functions

## Function: template.get()

### Usage: 
    template.get({name:'template',src:'./templates/template.html'},function (html) {});

### Example
    template.get({name:'work',src:./templates/work-page-templates.html},function (html) {

           var keys    = {foo:'bar'}

           /* Get element, insert keys and convert to jQuery object */

           var element = $(template.insert({template:html,keys:keys}));
           element.appendTo('body');

    });

## Function: template.insert()

### Usage: 

    var templatePre = '<div>{{template-tag}}</div>',
        keys        = {template-tag:foobar},
        element     = template.insert({template:templatePre,keys:keys});

#### Optional If statements:
    var element = template.insert{{if {{template-tag}} <div>{{template-tag}}</div> end}}

The if statement checks if `{{template-tag}}` is undefined or empty

## Including the templates on the page
    <div src="url" template="template-name" keys="keyObject" onload="function"></div>
So, this would be in your index.html or any html file.
#### SRC tag
The function will look for a template file corresponding to that URL

#### Template tag
The function will look for a corresponding template named `template-name` in the referenced template file, eg:
        
        <div template="template-name">
            <h1>{{title}}</h1>
            <p>{{text}}</p>
        </div>
    
#### Keys
keys, for this to work you'll need to create an object called `template.keys['keyObject']` this object, must be inside an array. 
Example:
    template.keys['keyObject'] = [{
        title:'This is awesome',
        text:'This paragraph is awesome'
        },{
        title:'This is awesome and will make sure the template creates multiple instances of this template on the page',
        text:'This paragraph is awesome and what the title said'
        }];
        
However many objects inside the array is how ever many templated objects that will be created inside that template element.


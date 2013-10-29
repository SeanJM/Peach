// ------------- Templating */
// Templating
// on develop
// Small Ideas
// The ctrl+7 key combination will bring up a menu allowing you to compile a template

// Big Ideas
// Allow people access to this tool somehow, so they can create templates online
// Don't store any of their data and offer it as a trully free service
// on production

/* Global Stuff */

var peach = {
  templates: {},
  dataFilter: {},
  _fn: {},
  error: function (options) {
    var error = {
      template:'<span class="peach-error"><span class="peach-error_text">%text</span></span>',
      code: options.code
    }
    var out = '';
    if (error.code === 1) {
      error.text = 'Template file: <strong>'+options.file+'</strong> does not exists.';
    } else if (error.code === 2) {
      error.text = 'Template: <strong>'+options.name+'</strong> does not exist.';
    } else if (error.code === 3) {
      error.text = 'Template: '+peach.find(options.name,options).src+' : '+options.name+'<br/>Variable: <strong>'+options.variable+'</strong> is undefined.';
    } else if (error.code === 4) {
      error.text = 'Unmatched Brackets: the <strong>'+options.name+'</strong> template has a bad nest.';
    } else if (error.code === 5) {
      error.text = 'Undefined Function: <strong>'+options.fn+'</strong><br/>Please define this function using: peach._fn.'+options.fn;
    }
    if (peach.debug) {
      out = error.template.replace(/%[a-z]+/g,function (m) {
        return error[m.match(/%([a-z]+)/)[1]];
      });
    }
    return out;
  },
  ifeval: function (string,options) {
    var eval = peach.eval(string,options);
    if (string.match(/^!/)) {
      if (eval.length > 0) {
        if (eval == 'true') {
          return false;
        }
        else if (eval == 'false') {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else if (eval.length < 1) {
      return false;
    }
    if (eval == 'true') {
      return true;
    }
    else if (eval == 'false') {
      return false;
    }
    return true;
  },
  eval: function (string,options) {
    string       = string.replace(/^\s+|\s+$/g,'');
    //            Not Equal - Variable    -   Property               -   Alt              - Is Escaped - Calc
    var pattern  = '(?:!|)%([a-zA-Z0-9-]+)(?:(?:\\.)([a-zA-Z0-9]+|)|)(?:\\|\\{([\\s\\S]*?)\\}|)(?:\\\\|)|(calc)\\{([\\s\\S]*?)\\}';
    var match    = string.match(pattern);
    var data     = options.data;
    var _options = $.extend({},options);

    function _eval() {
      //If is regular variable
      var _var    = match[1];
      var _prop   = match[2];
      var _alt    = match[3];
      var result;
      // Is Calc
      if (typeof match[4] === 'string') {
        return eval(peach.pit({output: match[5],data: data, templates: options.templates}).output);
      } else {
        if (_var.replace(/[0-9]+/,'').length < 1) {
          return match[0];
        } else if (data.hasOwnProperty(_var) && data[_var].length > 0) {
          // The value of data is a string
          if (typeof data[_var] === 'string') {
            result = data[_var].replace(/^\s+|\s+$/g,'');
            if (typeof _prop === 'string') {
              return peach._toProp(result,_prop);
            } else {
              return result;
            }
          } else {
            // The value of data is a javascript object or an array
            //return data[_var];
          }
        } else if (typeof _alt === 'string') {
          return peach.pit({output: _alt,data: data,templates: options.templates}).output;
        } else {
          return '';
        }
      }
    }

    if (match) {
      return _eval();
    } else {
      return string;
    }
  },
  _clear: function (string) {
    return string.replace(/(\r\n|\n|\r)/gm,'');
  },
  find: function (name,options) {
    var _options = {};
    if (options.templates.hasOwnProperty(name)) {
      _options.output   = options.templates[name].template;
      _options.src      = options.templates[name].src||'No source specified';
      _options.file     = _options.src.split('/')[_options.src.split('/').length-1];

      return _options;
    }

    return false;
  },
  get: function (name,options) {
    var find = peach.find(name,options);
    var comment = '';
    if (find) {
      if (peach.debug) {
        var tn_spacer = (new Array((26-name.length > 0)?26-name.length:1)).join(' ');
        var tf_spacer = (new Array((16-find.file.length > 0)?16-find.file.length:1)).join(' ');
        var comment   = '<!-- {Peach} '+find.file+tf_spacer+': '+name+tn_spacer+'-->\n';
      }
      return comment+peach.js.iterate(name,options);
    } else {
      return peach.error({code: 2,name: name});
    }
  },
  raw: function (object) {
    // Raw is peach.raw({template,call})

  },
  js: {
    iterate: function (name,options) {
      var iterData  = {};
      var arr       = [];
      var find      = peach.find(name,options);
      var output    = find.output;
      var data      = options.data;
      var out;
      function ifString_convertToObject(unknown) {
        if (typeof unknown === 'object') {
          return unknown;
        } else {
          return peach._stringToJavaScript(unknown);
        }
      }
      // is an Array
      if ($.isArray(data)) {
        for (var i=0;i<data.length;i++) {
          iterData              = ifString_convertToObject(data[i]);
          iterData['index']     = (i+1).toString();
          iterData['oddOrEven'] = (i%2 === 0) ? 'odd' : 'even';
          iterData['isLast']    = (i+1 === data.length) ? 'true' : 'false';
          iterData['isFirst']   = (i < 1) ? 'true' : 'false';
          iterData['length']    = data.length.toString();
          arr.push(peach.pit({name: name,output: output,data: iterData,templates: options.templates}).output);
        }
        return arr.join('');
      } else {
        // is an Object
        return peach.pit({name: name,output: output,data: data,templates: options.templates}).output;
      }
    },
  },
  getArray: function (string) {
    // Must strip white space characters because of Peach to JavaScript conversion
    var pattern = ['\\[','[\\s\\S]*?','\\]'];
    var match   = string.match(pattern.join(''));
    if (match) {
      while (match && match[0].match(/\[/g).length > match[0].match(/\]/g).length) {
        pattern.push('[\\s\\S]*?','(?:\\s+|)\\]')
        match   = string.match(pattern.join(''));
      }
      pattern.splice(1,0,'(');
      pattern.splice(pattern.length-1,0,')');
      return pattern.join('');
    } else {
      return false;
    }
  },
  getNest: function (pattern,string) {
    var start = pattern.substr(pattern.length-2,1);
    var end   = pattern.substr(pattern.length-1,1);
    pattern   = [pattern.substr(0,pattern.length-2),'(?:\\s+|)\\',start,'[\\s\\S]*?',end];
    var match = string.match(pattern.join(''));
    if (match) {
      while (match && match[0].match(new RegExp('\\'+start,'g')).length > match[0].match(new RegExp(end,'g')).length) {
        pattern.push('[\\s\\S]*?',end);
        match = string.match(pattern.join(''));
      }
      pattern.splice(3,0,'(?:\\s+|)(');
      pattern.splice(pattern.length-1,0,')(?:\\s+|)');
      return pattern.join('');
    }
    return false;
  },
  add: function (template,file) {
    var file = file||'no file specified';
    var templates = {};
    var match = peach.getNest('`([a-zA-Z0-9_-]+){}',template);

    while (match) {
      var templateMatch = template.match(match);
      var name          = templateMatch[1];
      var content       = templateMatch[2];

      templates[name] = {
        src: file,
        template: content
      }

      template = template.replace(new RegExp(match),function (m) {
        return '';
      });

      match = peach.getNest('`([a-zA-Z0-9_-]+){}',template);
    }

    return templates;
  },
  _stringToJavaScript: function (string) {
    string = string.replace(/^\s+|\s+$/g,'');
    // is Object
    function isObject(string) {
      if (string.match(/^[a-zA-Z0-9-]+(\s+|)\{/)) {
        return true;
      } else {
        return false;
      }
    }

    // Objects
    function toObject(string) {
      var property;
      var obj = {};
      while (string.match(/[a-zA-Z0-9-]+(\s+|)\{/)) {
        property  = peach.getNest('('+string.match(/([a-zA-Z0-9-]+)(\s+|)\{/)[1]+'){}',string);
        string    = string.replace(new RegExp(property),function (m) {
          match = m.match(property);
          obj[match[1]] = match[2];
          return '';
        });
      }
      return obj;
    }

    // Arrays
    function isArray(string) {
      /*
        Clean leading and trailing spaces from the string
        to determine whether or not it satisfies the con-
        dition of being an array
      */
      string = string.replace(/^\s+|\s+$/g,'');
      if (string.match(/^\[/m)) {
        return true;
      } else {
        return false;
      }
    }


    function toArray(string) {
      var arr  = [];
      var nest;
      while (string.match(/^(\s+|)\[/)) {
        nest   = peach.getArray(string);
        arr.push(peach._stringToJavaScript(string.match(nest)[1]));
        string = string.replace(new RegExp(nest),'');
      }
      return arr;
    }

    if (isArray(string)) {
      js = toArray(string);
    } else if(isObject(string)) {
      js = toObject(string);
    }
    return js;
  },
  _toProp: function (unknown,prop) {
    function propFn(unknown) {
      return {
        toLower: function () {
          return unknown.toLowerCase();
        },
        toUpper: function () {
          return unknown.toUpperCase();
        },
        length: function () {
          return peach._stringToJavaScript(unknown).length;
        },
        toDash: function () {
          return unknown.toLowerCase().replace(/\s+/g,'-').replace(/&amp;/g,'and');
        },
        toMonth: function () {

          return ['January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December'][parseInt(unknown)-1];
        }
      }
    }
    if (prop) { // For IE 8
      if (typeof propFn()[prop] === 'function') {
        return propFn(unknown)[prop]();
      } else {
        return unknown+'.'+prop;
      }
    } else {
      return unknown;
    }
  },
  script: {
    comments: function (options) {
      options.output = options.output.replace(/\@{\/\/[\s\S]*?}|(\s)\/\/[\s\S]*?\n|\/\*[\s\S]*?\*\/|\@{\/\*[\s\S]*?\*\/}/gm,function (m) {
        var pattern = /@{(\/\/[\s\S]*?)}|\/\/[\s\S]*?\n|\/\*[\s\S]*?\*\/|@{(\/\*[\s\S]*?\*\/)}/;
        if (m.match(/@{/)) {
          return m.match(pattern)[1];
        } else {
          return '';
        }
      });
      return options;
    },
    ifmatch: function (options) {
      function bool(string) {
        // Match 'string'|variable <>!== 'string'|variable|number
        string    = string.replace(/^\s+|\s+$/g,'');
        var match = string.match(/([\s\S]*?)(?:\s+|)([!=<>]+)(?:\s+|)([\s\S]*?)$/);
        var left,right,condition,out;
        if (match) { // There are conditions
          left      = peach.eval(match[1],options);
          condition = match[2];
          right     = peach.eval(match[3],options);
          if (condition === '==') out = (left == right);
          else if (condition === '===') out = (left === right);
          else if (condition === '!=')  out = (left != right);
          else if (condition === '!==') out = (left !== right);
          else if (condition === '<=')  out = (left <= right);
          else if (condition === '>=')  out = (left >= right);
          else if (condition === '>')   out = (left > right);
          else if (condition === '<')   out = (left < right);
          return out;
        } else {
          return (peach.ifeval(string,options)) ? true : false;
        }
      }

      function hasElse(string,pattern) {
        var hasElse = string.match(pattern+'(?:\\s+|)([a-zA-Z]{4}|)')[2];
        if (hasElse == 'else') {
          return true;
        } else {
          return false;
        }
      }

      function getWholeIf(string) {
        var pattern = peach.getNest('if(?:\\s+|)\\([\\s\\S]*?\\){}',string);
        if (hasElse(string,pattern)) {
          while (peach.getNest(pattern+'else if(?:\\s+|)\\([\\s\\S]*?\\){}',string)) {
            pattern = peach.getNest(pattern+'else if(?:\\s+|)\\([\\s\\S]*?\\){}',string);
          }
          if (peach.getNest(pattern+'(?:\\s+|)(else){}',string)) {
            pattern = peach.getNest(pattern+'(?:\\s+|)(else){}',string);
          }
        }
        return new RegExp(pattern);
      }

      function group(arr) {
        var out = arr;
        out.splice(1,0,'(');
        out.splice(arr.length-1,0,')');
        out.push('((?:\\s+|)else(?:\\s+|)|)')
        return out;
      }

      function ifmatch(ternian) {
        var clean      = ternian.replace(/&amp;/g,'&').replace(/&lt;/,'<').replace(/&gt;/,'>');
        var compare    = clean.split(/&&|\|\|/);
        var boolReturn = true;
        var op; // Operation type
        var eval;

        if (clean.match(/&/)) {
          op = 'and';
        } else if (clean.match(/\|\|/)) {
          op = 'or';
        }

        for (var i=0;i<compare.length;i++) {
          boolReturn = bool(compare[i]);
          if (op === 'or' && boolReturn === true) {
            i=compare.length;
          } else if (op === 'and' && boolReturn === false) {
            i=compare.length;
          }
        }
        return boolReturn;
      }

      function getIf(string) {
        var _if = peach.getNest('^if(?:\\s+|)\\(([\\s\\S]*?)\\){}',string);
        if (_if) { _if += '((\\s+|)else(\\s+|)|)'; }
        return _if;
      }

      function ifProcess(string) {
        // Get the if
        /*
          1. Process if statement -- if true, replace entire string with contents
          2. If statement is false, remove it and a possible 'else' and reprocess
        */
        function doIf () {
          var _if        = getIf(string);
          var _ifmatch   = string.match(_if);
          var _else      = peach.getNest('^{}',string);
          var _elsematch = string.match(_else);

          if (_if) {
            if (ifmatch(_ifmatch[1])) {
              string = _ifmatch[2];
            } else {
              string = string.replace(new RegExp(_if),'');
              doIf();
            }
          } else if (_else) {
            string = _elsematch[1];
          } else {
            string = "";
          }
        }
        doIf();
        return string;
      }

      function execute() {
        while (options.output.match(/if(\s+|)\([\s\S]*?\)/)) {
          options.output = options.output.replace(getWholeIf(options.output),function (m) {
            return ifProcess(m);
          });
        }
      }

      execute();

      return options;
    },
    insert: function (options) {
      //           Not Equal - Variable    -   Property               -   Alt              - Is Escaped - Calc
      var pattern = '(?:!|)%([a-zA-Z0-9-]+)(?:(?:\\.)([a-zA-Z0-9]+|)|)(?:\\|\\{([\\s\\S]*?)\\}|)(?:\\\\\|)|(calc)\\{([\\s\\S]*?)\\}';
      options.output = options.output.replace(new RegExp(pattern,'g'),function (m) {
        return peach.eval(m,options);
      });
      return options;
    },
    get: function (options) {
      function execute() {
        var pattern = '`([a-zA-Z0-9-_]+)';

        while (options.output.match(pattern)) {
          var templateMatch = options.output.match(pattern);
          var templateName  = templateMatch[1];
          var templateNest  = peach.getNest('('+templateMatch[0]+'){}',options.output);
          var _options      = $.extend({},options);
          var nest;

          if (templateNest) {
            nest = options.output.match(templateNest);
            if (nest) {
              _options.data = peach._stringToJavaScript(nest[2]);
            } else {
              $('body').append(peach.error({code: 4,name: templateName}));
              break;
            }
          } else {
            templateNest = pattern;
          }

          options.output = options.output.replace(new RegExp(templateNest),function (m) {
            return peach.get(templateName,_options);
          });
        }
      }

      execute();

      return options;
    },
    atGet: function (string,options) {
      string = string.replace(/@\{[a-zA-Z0-9-_]+\}/g,function (m) {
        var find = peach.find(m.match(/@\{([a-zA-Z0-9-_]+)\}/)[1],options);
        if (find) {
          return find.output;
        } else {
          return m;
        }
      });
      string = string.replace(/`\\[a-zA-Z0-9-_]+|%\\[a-zA-Z0-9-]+/g,function (m) {
        return m.replace(/\\/g,'')
      });
      return string;
    }
  }, /* FN */
  pit: function (options) {
    options.templates = options.templates||peach.templates;
    peach.script['comments'](options);
    peach.script['ifmatch'](options);
    peach.script['insert'](options);
    peach.script['get'](options);
    return options;
  },
  setTime: function (timeStart) {
    var timeEnd = new Date();
    if (peach.debug) {
      $('body').append('<!-- peach template render time: '+((timeEnd.getTime()-timeStart.getTime())/1000)+'s -->');
    }
  },
  start: function (options) {
    return options.output.replace(/~![\s\S]*?!~/g,function (m) {
      options.output = m.match(/~!([\s\S]*?)!~/)[1];
      return peach.script['atGet'](peach.pit(options).output,options);
    });
  },
  init_compiled: function (data,options) {
    if (typeof options.onload === 'function') {
      options.onload();
    }
  },
  init_default: function (data,options) {
    var peachData     = $('div[data-peach]'); // Check to see if the data-peach is present, if not, throw an error
    var output        = peachData.html();
    var peachAttr     = peachData.attr('data-peach');
    var directory     = options.directory||'templates/';
    var templateFiles = toTemplateFile(peach._clear(peachAttr.match(/templates:([\t\r\n\.\/a-zA-Z0-9_, ]+)(;|)/)[1]).replace(/ /g,'').split(','),directory);
    var templates     = {};
    var timeStart     = new Date();
    var container;

    peach.initTemplate = output;
    peach.initData     = data;
    peach.debug        = (peachAttr.match(/debug(\s+|);/)) ? true : false;
    peach.autoRefresh  = (peachAttr.match(/autoRefresh(\s+|);/)) ? true : false;

    function toTemplateFile(files,directory) {
      var arr = [];
      for (var i=0;i<files.length;i++) {
        arr.push(directory+files[i]+'.ptl');
      }
      return arr;
    }

    function load (filesArray,index,callback) {
      function execute() {
        $('<div/>').load(filesArray[index],function (d,k) {
          if (k === 'success') {
            $.extend(peach.templates,peach.add(d,filesArray[index]));
            load(filesArray,index+1,callback);
          } else {
            $('body').append(peach.error({code: 1,file: filesArray[index]}));
          }
          if ((index+1) === filesArray.length && typeof callback === 'function') {
            callback();
          }
        });
      }
      if (typeof filesArray[index] !== 'undefined') {
        execute();
      }
    }

    load(templateFiles,0,function () {
      output = peach.start({output:output,data:data,templates:peach.templates});
      if ($('.peach-container').size() < 1) {
        container = $('<div class="peach-container"></div>');
        $('div[data-peach]').after(container);
        $('div[data-peach]').remove();
      }
      $('.peach-container').html(output);
      peach.setTime(timeStart);
      if (typeof options.onload === 'function') {
        options.onload();
      }
    });
  },
  init:function (data,options) {
    data    = data||{};
    options = options||{};
    if ($('div[data-peach]').size() > 0) {
      peach.init_default(data,options);
    } else {
      peach.init_compiled(data,options);
    }

  }
}
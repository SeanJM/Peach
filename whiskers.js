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

String.prototype.repeat = function (n) {
  return new Array(n+1).join(this);
}

var whiskers = {
  template: {},
  dataFilter: {},
  options: function (object) {
    object.data["index"]     = 1;
    object.data["oddOrEven"] = 'odd';
    object.data["isLast"]    = true;
    object.data["isFirst"]   = true;

    return object;
  },
  _autoRefresh: function (object) {
    if (whiskers.autoRefresh) {
      setTimeout(function () {
        whiskers.init(whiskers.initData,whiskers.initCallback);
      },500);
    }
  },
  _eval: function (string,data) {
    var stringPattern = new RegExp(whiskers._string());
    var variable      = new RegExp(whiskers._var);
    var isVar         = string.match(variable);
    var isInt         = string.match(/^[0-9-]+/);
    var isString      = string.match(stringPattern);
    var out           = '';

    if (isVar) {
      if (data.hasOwnProperty(isVar[6])) {
        if (isVar[0].match(/^!/)) {
          return false;
        } else {
          return data[isVar[6]];
        }
      } else {
        if (isVar[0].match(/^!/)) {
          return true;
        } else {
          return false;
        }
      }
    } else if (isInt) {
      return string;
    } else {
      return isString[0];
    }
    return out;
  },
  _clear: function (string) {
    return string.replace(/(\r\n|\n|\r)/gm,'');
  },
  _match: function (b,r) {
    if (typeof r !== 'undefined') {
      r = new RegExp(b,r);
    } else r = b;
    return r;
  },
  _var        : '((?:!%|%)([a-zA-Z0-9-]+))(`([a-zA-Z-]+))|((?:!%|%)([a-zA-Z0-9-]+))',
  _each       : '%([a-zA-Z0-9-]+)`([a-zA-Z0-9-]+)(?:\\s+|)(?:{([^}]+)}|)',
  _propAll    : '([a-zA-Z0-9-]+)(\\s+|):(\\s+|)\\[([^\\]]+)\\]|([a-zA-Z0-9-]+)(\\s+|):([^;}]+)(?=;|}|$)',
  _prop       : '([a-zA-Z0-9-]+)(?:\\s+|):([^*]+)',
  _iterator   : '\\[([^\\]]+)\\]',
  _string: function (r) {
    return whiskers._match('[\\w=\\/@#%~`:,;\^\&\\.\"\'_\\-<>\\*\\n\\r\\t\\(\\)\\[\\]\\{\\}\\|\\?\\!\\$\\\\\ ]+',r);
  },
  _find: function (string) {
    var options = {};
    var template;
    var val;

    if (whiskers.template.hasOwnProperty(string)) {
      options.template = whiskers.template[string].template;
      options.src      = whiskers.template[string].src;

      if (whiskers.debug) {
        options.template = '<!-- whiskers: '+options.src+' : '+string+' -->\r\n'+options.template;
      }

      return options;
    }

    return false;
  },
  _path: function (path,templateName) {
    var out = templateName;
    if (typeof path !== 'undefined') {
      out = path+'_'+templateName
    }
    return out;
  },
  _getProperties: function (data,string) {
    out          = '';
    properties   = string.match(whiskers._match(whiskers._propAll,'g'));

    if (properties) {
      for (var i=0;i<properties.length;i++) {
        var k          = properties[i];
        var _propGroup = k.match(whiskers._match(whiskers._prop));
        data[_propGroup[1]] = _propGroup[2].replace(/^[ ]+/,'');
      }
    }
    return data;
  },
  _toObj: function (string) {
    var obj = {};

    function toProp(string,obj) {
      var out = string.replace(/[\s]+$/,'').match(/([a-zA-Z0-9-]+)(?:\s+|):(?:\s+|)([\s\S]*?)(?=$)/);
      obj[out[1]] = out[2];
    }

    function getNest(_string) {
      var _obj = {};
      var each = _string.match(/([a-zA-Z0-9-]+)(?:\s+|):(?:\s+|)([\s\S]*?)(?=;(?:\s+}|}|(?:\s+|)[a-zA-Z0-9-]+(?:\s|):(?:\s|))|})/g);
      var nested = /([a-z]+)(?:\s+|):(?:\s+|)({[\s\S]*?}(?!,\{))/;
      var isNested;
      var nestedMatch;
      for (var i=0;i<each.length;i++) {
        isNested = each[i].match(nested);
        if (isNested) {
          _obj[isNested[1]] = [];
          nestedMatch = isNested[2].match(/\{[\s\S]*?}/g);
          for (var j=0;j<nestedMatch.length;j++) {
            _obj[isNested[1]].push(getNest(nestedMatch[j]));
          }
        }
        else {
          toProp(each[i],_obj);
        }
      }
      return _obj;
    }

    obj = getNest(string);
    return obj;
  },
  _get: function (options) {
    var _options = whiskers.options($.extend(options,{}));
    var out;
    var template;
    var arr = [];
    var find = whiskers._find(_options.name);
    var iterOptions = {};

    function ifString_convertToObject(unknown) {
      if (typeof unknown === 'object') {
        return unknown;
      } else {
        return whiskers._stringToObject(unknown);
      }
    }

    if (find) {
      _options.template = find.template;
      // Has an iterator
      if (_options.iterator && typeof _options.iterator !== 'undefined') {
        if (_options.data.hasOwnProperty(_options.iterator)) {
          for (var i=0;i<_options.data[_options.iterator].length;i++) {
            iterOptions.name              = _options.name;
            iterOptions.data              = ifString_convertToObject(_options.data[_options.iterator][i]);
            iterOptions.data['index']     = (i+1);
            iterOptions.data['oddOrEven'] = (i%2 === 0) ? 'odd' : 'even';
            iterOptions.data['isLast']    = (i+1 === _options.data[_options.iterator].length) ? 'true' : 'false';
            iterOptions.data['isFirst']   = (i < 1) ? 'true' : 'false';
            iterOptions.template          = _options.template;
            console.log(iterOptions.data);
            arr.push(whiskers.it(iterOptions).template);
          }
          console.log(arr);
          out = {template: arr.join('')};
        } else {
          out = {template: '<span class="whiskers-error">Bad iterator: <strong>%'+_options.iterator+'</strong> (template: '+_options.name+')</span>'}
        }
      } else {
        // Does not have an iterator
        out = whiskers.it(options);
      }
    } else {
      out = {template: '<span class="whiskers-error">Template: <strong>'+_options.name+'</strong> does not exist.</span>'}
    }
    console.log(out);
    return out.template;
  },
  _getNest: function (pattern,string) {
    pattern = [pattern,'(?:\\s+|)\\{','[\\s\\S]*?','}'];
    var match = string.match(pattern.join(''));
    if (match) {
      while (match[0].match(/\{/g).length > match[0].match(/\}/g).length) {
        pattern.push('[\\s\\S]*?','}');
        match = string.match(pattern.join(''));
      }
      pattern.splice(2,0,'(');
      pattern.splice(pattern.length-1,0,')');
      return pattern.join('');
    }
    return false;
  },
  _getNestContents: function (pattern,string) {
    return string;
  },
  _stringToObject: function (string) {
    var property;
    var obj = {};
    while (string.match(/[a-zA-Z0-9-]+(\s+|)\{/)) {
      property  = whiskers._getNest('('+string.match(/([a-zA-Z0-9-]+)(\s+|)\{/)[1]+')',string);
      string    = string.replace(new RegExp(property),function (m) {
        match = m.match(property);
        obj[match[1]] = match[2];
        return '';
      });
    }
    return obj;
  },
  script: {
    comments: function (options) {
      options.template = options.template.replace(/^[\s+]+\/\*[\S\s]*?\*\/(\s+|)[\n]+|^[\s+]+\/\/[\S\s]*?$/gm,'');
      return options;
    },
    ifmatch: function (options) {
      function bool(string,data) {
        // Match 'string'|variable <>!== 'string'|variable|number
        var match = string.match(/([a-zA-Z0-9-% ]+)(?:\s+|)([!=<>]+)(?:\s+|)([a-zA-Z0-9-% ]+)/);
        var left,right,condition,out;
        if (match) { // There are conditions
          left      = whiskers._eval(match[1],data);
          condition = match[2];
          right     = whiskers._eval(match[3],data);
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
          return (whiskers._eval(string,data)) ? true : false;
        }
      }

      function getWholeIf(string) {
        var pattern = whiskers._getNest('(\s+|)if(?:\\s+|)\\([\\s\\S]*?\\)',string);
        var _pattern = pattern;
        while (pattern) {
          pattern = whiskers._getNest(pattern+'(?:\\s+|)else',string);
          if (pattern) _pattern = pattern;
        }
        return (new RegExp(_pattern));
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
          boolReturn = bool(compare[i],options.data);
          if (op === 'or' && boolReturn === true) {
            i=compare.length;
          } else if (op === 'and' && boolReturn === false) {
            i=compare.length;
          }
        }
        return boolReturn;
      }

      function getIf(string) {
        var ifStatement = 'if(?:\\s+|)\\(([\\s\\S]*?)\\)(?:\\s+|)(?:\\{)';
        var pattern = [ifStatement,'[\\s\\S]*?','(?:})'];
        var ifMatch = string.match((new RegExp(pattern.join(''))));
        var finalPattern;
        function group(arr) {
          var out = arr;
          out.splice(1,0,'(');
          out.splice(arr.length-1,0,')');
          out.push('(?:(?:\\s+|)else(?:\\s+|)|)')
          return out;
        }
        while (ifMatch[0].match(/\{/g).length > ifMatch[0].match(/\}/g).length) {
          pattern.push('[\\s\\S]*?','(?:})');
          ifMatch = string.match(pattern.join(''));
        }
        finalPattern = group(pattern).join('');
        return [string.match(finalPattern),getWholeIf(string),(new RegExp(finalPattern))];
      }

      function ifProcess(string) {
        var out = string;
        function doIf () {
          var _ifmatch   = string.match(/if(\s+|)\([\S\s]*?\)/);
          var _elsematch = string.match(/\{([\S\s]*?)}/);
          if (_ifmatch) {
            var get = getIf(string);
            if (get[0]) {
              if (ifmatch(get[0][1])) {
                string = string.replace(get[1],get[0][2]);
              } else {
                string = string.replace(get[2],'');
                doIf();
              }
            }
          } else if (_elsematch) {
            string = _elsematch[1];
          }
        }
        doIf();
        return string;
      }

      function execute() {
        while (options.template.match(/(\s+|)if(\s+|)\([\s\S]*?\)/)) {
          options.template = options.template.replace(getWholeIf(options.template),function (m) {
            return ifProcess(m);
          });
        }
      }

      execute();

      return options;
    },
    insert: function (options) {
      var pattern = '%([a-zA-Z0-9-]+)(?:(?:\\.)([a-z0-9\\[\\]\'\"\\.]+)|)(?:`([a-zA-Z0-9-]+)|)';
      options.template = options.template.replace(new RegExp(pattern,'g'),function (m) {
        var _out   = m;
        var _match = m.match(pattern);
        var _var   = _match[1];
        var _prop  = _match[2];
        var _name  = _match[3];

        if (typeof _name === 'undefined') {
          if (options.data.hasOwnProperty(_var)) {
            if (typeof _prop === 'string') {
              _out = options.data[_var][_prop];
            } else {
              _out = options.data[_var];
            }
          } else {
            _out = '<span class="whiskers-error">variable '+m+' is undefined.</span>';
          }
        }

        return _out;
      });
      return options;
    },
    get: function (options) {
      var iterator;
      var pattern;

      function getArrayNest(string) {
        var pattern = ['\\[','[\\s\\S]*?','\\]'];
        var match = string.match(pattern.join(''));
        while (match && match[0].match(/\[/g).length !== match[0].match(/\]/g).length) {
          pattern.push('[\\s\\S]*?','\\]');
          match = string.match(pattern.join(''));
        }
        pattern.splice(1,0,'(');
        pattern.splice(pattern.length-1,0,')');
        return {content: string.match(pattern.join(''))[1],pattern: pattern.join('')};
      }

      function stringToArray(properties) {
        function toArray(string) {
          var arr = [];
          var getArrayNestResult = getArrayNest(string);
          // Get array 'nest'
          while (string.match(getArrayNestResult.pattern)) {
            getArrayNestResult = getArrayNest(string);
            arr.push(getArrayNestResult.content);
            string = string.replace(new RegExp(getArrayNestResult.pattern),function (m) {
              return '';
            });
          }
          return arr;
        }
        // Check to see if value of property is an array
        function isArray(string) {
          if (string.match(/\[[\S\s]*?\]/)) {
            return true;
          }
          return false;
        }

        for (var k in properties) {
          if (isArray(properties[k])) {
            properties[k] = toArray(properties[k]);
          }
        }
        return properties;

      }

      function execute() {
        var pattern  = '(?:%([a-zA-Z0-9-]+)|)(?:`([a-zA-Z0-9-]+))';
        while (options.template.match(pattern)) {
          var templateMatch = options.template.match(pattern);
          var nestMatch          = templateMatch[0];
          var iterator           = templateMatch[1];
          var templateName       = templateMatch[2];
          var templateNest       = whiskers._getNest('('+nestMatch+')',options.template);
          var templateProperties = {};
          var templateNestInside;

          if (templateNest) {
            templateNestInside = options.template.match(templateNest)[2];
            templateProperties = whiskers._stringToObject(templateNestInside);
            templateProperties = stringToArray(templateProperties);
          } else {
            templateNest = pattern;
          }


          $.extend(templateProperties,options.data);

          options.template = options.template.replace(new RegExp(templateNest),function (m) {
            return whiskers._get({name: templateName, iterator: iterator,data: templateProperties});
          });
        }
      }

      execute();

      return options;
    },
    clean: function (options) {
      options = $.extend({},options);
      var pattern = /~\\!([\S\s]*?):\}/gm;
      var match;
      options.template = options.template.replace(pattern,function (m) {
        match = m.match(/~\\!([\S\s]*?):\}/);
        if (match) {
          return match[1];
        } else {
          return m;
        }
      });
      return options;
    }
  }, /* FN */
  it: function (options) {
    whiskers.script['comments'](options);
    whiskers.script['ifmatch'](options);
    whiskers.script['insert'](options);
    whiskers.script['get'](options);

    return options;
  },
  setTime: function (timeStart) {
    var timeEnd = new Date();
    console.log(((timeEnd.getTime()-timeStart.getTime())/1000)+'s');
  },
  start: function (options) {
    var _options = $.extend(options,{});
    var tmp;
    return options.template.replace(/~![\s\S]*?!~/g,function (m) {
      _options.template = m.match(/~!([\s\S]*?)!~/)[1];
      tmp = whiskers.it(_options).template.replace();
      return tmp;
    });
  },
  init:function (data,callback) {
    var whisker           = $('div[data-whiskers]');
    var whiskerAttr       = whisker.attr('data-whiskers');
    var templates         = whiskers._clear(whiskerAttr.match(/[ ]+templates:([\t\r\n\.\/a-zA-Z0-9_, ]+)(;|)/)[1]).replace(/ /g,'').split(',');
    var timeStart         = new Date();
    var template          = whisker.html();
    var container;
    whiskers.initTemplate = whisker.html();
    whiskers.initData     = data;
    whiskers.initCallback = callback;
    whiskers.debug        = (whiskerAttr.match(/debug(\s+|);/)) ? true : false;
    whiskers.autoRefresh  = (whiskerAttr.match(/autoRefresh(\s+|);/)) ? true : false;

    function add (file,template) {
      while (template.match(/>(\s+|)[a-zA-Z0-9-]+/)) {
        var templateStart = template.match(/>(?:\s+|)([a-zA-Z0-9-]+)(?:\s+|){/);
        var match         = whiskers._getNest('>(?:\\s+|)('+templateStart[1]+')',template);
        var templateMatch = template.match(match);
        var name          = templateMatch[1];
        var content       = templateMatch[2];
        whiskers.template[name] = {
          src: file,
          template: content
        }
        template = template.replace(new RegExp(match),function (m) {
          return '';
        });
      }
    }

    function load (arr,index,callback) {
      function execute() {
        $('<div/>').load(arr[index],function (d,k) {
          if (k === 'success') {
            add(arr[index],d);
            load(arr,index+1,callback);
          } else {
            whiskers._throwError({code: 2,file: arr[index]});
          }
          if ((index+1) === arr.length && typeof callback === 'function') {
            callback();
          }
        });
      }
      if (typeof arr[index] !== 'undefined') {
        execute();
      }
    }

    load(templates,0,function () {
      template = whiskers.start({template:template,data:data});
      //template = whiskers.it({template:template,data:data}).template;
      if ($('.whiskers-container').size() < 1) {
        container = $('<div class="whiskers-container"></div>');
        $('body').append(container);
      }
      $('.whiskers-container').html(template);
      whiskers.setTime(timeStart);
      whiskers._autoRefresh();
      if (typeof callback === 'function') {
        callback();
      }
    });

  }
}
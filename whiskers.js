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
      //var each = _string.match(/[a-zA-Z0-9-]+(\s+|):(\s+|)(\{[\S\s]*?}|[\S\s]*?)(;(?!}|(\s+)}|[\s\S]*?}(;))|$)/g);
      // New Pattern: ([a-zA-Z0-9-]+)(?:\s+|):(?:\s+|)([\s\S]*?)(?=;(?:\s+}|}|(?:\s+|)[a-zA-Z0-9-]+(?:\s|):(?:\s|))|})
      //var each = _string.match(/[a-zA-Z0-9-]+(\s+|):(\s+|)(\{[\S\s]*?|[\S\s]*?)(;|$)/g);
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
  _get: function (name,options) {
    var find,template,options,out;
    options          = whiskers.options(options);
    find             = whiskers._find(name);
    if (find) {
      options.template = find.template;
      out              = whiskers.it(options);
    } else {
      out = {template: '<h2 style="color:red;">Whiskers Error:</h2><p style="color:red;">Template: <strong>'+name+'</strong> does not exist.</p>'}
    }
    return out.template;
  },
  _getNest: function (pattern,string) {
    pattern = [pattern,'(?:\\s+|)\\{','[\\s\\S]*?}'];
    var match = string.match(pattern.join(''));
    var i = 0;
    if (match) {
      while (match[0].match(/\{/g).length > match[0].match(/\}/g).length && i < 10) {
        pattern.push('[\\s\\S]*?}');
        match = string.match(pattern.join(''));
        i++;
      }
      return pattern.join('');
    }
    return false;
  },
  _fn: {
    comments: function (m,options) {
      var options = $.extend({},options);
      var pattern = /^[\s+]+\/\*[\S\s]*?\*\/(\s+|)[\n]+|^[\s+]+\/\/[\S\s]*?$/gm;
      return m.replace(pattern,'');
      return options;
    },
    ifmatch: function (template,options) {
      function bool(string,data) {
        // Match 'string'|variable <>!== 'string'|variable|number
        var match = string.match(/([a-zA-Z0-9-% ]+)(?:[ ]+|)([!=<>]+)(?:[ ]+|)([a-zA-Z0-9-% ]+)/);
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

        // Return result after the loop is run
        return string;
      }

      function execute() {
        while (template.match(/(\s+|)if(\s+|)\([\s\S]*?\)/)) {
          template = template.replace(getWholeIf(template),function (m) {
            return ifProcess(m);
          });
        }
      }

      options = $.extend({},options);

      execute();

      return template;
    },
    insert: function (options) {
      var data = options.data;
      var pattern = whiskers._match(whiskers._var,'g');
      options.template = options.template.replace(pattern,function (m) {
        var _out   = m;
        var _match = m.match(whiskers._var);
        // Not attached
        if (typeof _match[2] === 'undefined') {
          if (data.hasOwnProperty(_match[6])) {
            _out = data[_match[6]];
          } else {
            _out = '';
          }
        }
        return _out;
      });
      return options;
    },
    get: function (options) {
      options = $.extend({},options);
      var properties,templateName,_match,data,pattern,_obj,iterator,arr,iteratorData,index,oddOrEven,newData,isLast,isFirst,tmpOptions;
      data    = options.data;
      pattern = /(?:%([a-zA-Z0-9-]+)|)(?:(`[a-zA-Z0-9-]+))(?:\s+|)({([\s\S]*?)}(?!,|\s+}|;)|)/g;
      arr     = [];

      options.template = options.template.replace(pattern,function (m) {
        _match         = m.match(/(?:%([a-zA-Z0-9-]+)|)(?:`([a-zA-Z0-9-]+))(?:\s+|)(?:({[\s\S]*?})(?!,|\s+}|;)|)/);
        iterator       = _match[1];
        templateName   = _match[2];
        properties     = _match[3];
        options.inside = true;

        if (typeof properties !== 'undefined') {
          _obj = whiskers._toObj(properties);
          $.extend(options.data,_obj);
        }

        if (typeof iterator === 'string') {
          if (options.data.hasOwnProperty(iterator)) {
            for (var i=0;i<options.data[iterator].length;i++) {
              iteratorData              = $.extend({},options.data[iterator][i]);
              iteratorData['index']     = (i+1);
              iteratorData['oddOrEven'] = (i%2 === 0) ? 'odd' : 'even';
              iteratorData['isLast']    = (i+1 === options.data[iterator].length) ? 'true' : 'false';
              iteratorData['isFirst']   = (i < 1) ? 'true' : 'false';
              tmpOptions                = {inside: true,data: iteratorData};

              arr.push(whiskers._get(templateName,tmpOptions));
            }
            return arr.join('');
          }
        } else {
          return whiskers._get(templateName,options);
        }
      });
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
    var pattern  = new RegExp('(?:\\s+|)~![\\S\\s]*?~!','gm');
    options.template = options.template.replace(/~![\s\S]*?~!/g,function (m) {
      m = whiskers._fn['comments'](m,options);
      m = whiskers._fn['ifmatch'](m,options);
      //m = whiskers._fn['insert'](m,options);
      //options = whiskers._fn['get'](options);
      //options = whiskers._fn['clean'](options);
      return m;
    });

    return options;
  },
  setTime: function (timeStart) {
    var timeEnd = new Date();
    console.log(((timeEnd.getTime()-timeStart.getTime())/1000)+'s');
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
      var _match, k, match, name, pattern, content;
      pattern = /^template(?:\s+|)([a-zA-Z0-9-]+)(?:\s+|){([\S\s]*?)\n}/gm;
      match   = template.match(pattern);

      for (var i=0;i<match.length;i++) {
        _match  = match[i].match(/^template(?:\s+|)([a-zA-Z0-9-]+)(?:\s+|){([\S\s]*?)\n}/m);
        name    = _match[1]
        content = _match[2];

        whiskers.template[name] = {
          src: file,
          template: content
        }
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
      template = whiskers.it({template:template,data:data}).template;
      console.log(template);
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
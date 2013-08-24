// ------------- Templating */
// Templating
// on develop
// Small Ideas
// The ctrl+7 key combination will bring up a menu allowing you to compile a template



// Big Ideas
// Allow people access to this tool somehow, so they can create templates online
// Don't store any of their data and offer it as a trully free service
// on production
var whiskers = {
  _add: function (object) {
    if (typeof whiskers.template[object['file']] === 'undefined') {
      whiskers.template[object['file']] = '';
    }
    whiskers.template[object['file']] += object['template'];
  },
  _load: function (arr,index,callback) {
    function execute() {
      $('<div/>').load(arr[index],function (d,k) {
        if (k === 'error') {
          whiskers._throwError({code: 2,file: arr[index]});
        } else {
          whiskers._add({file: arr[index],template: d});
          whiskers._load(arr,index+1,callback);
        }
        if ((index+1) === arr.length && typeof callback === 'function') {
          callback();
        }
      });
    }
    if (typeof arr[index] !== 'undefined') {
      execute();
    }
  },
  _eval: function (string,data) {
    var stringPattern = new RegExp(whiskers._matchString());
    var variable      = new RegExp(whiskers._var());
    var isVar         = string.match(variable);
    var isInt         = string.match(/^[0-9-]+/);
    var isString      = string.match(stringPattern);
    var out           = '';
    if (isVar) {
      if (data.hasOwnProperty(isVar[2])) {
        if (isVar[0].match(/^!/)) {
          out = false;
        } else {
          out = data[isVar[2]];
        }
      } else {
        if (isVar[0].match(/^!/)) {
          out = true;
        } else {
          out = false;
        }
      }
    } else if (isInt) {
      out = string;
    } else {
      out = isString[0];
    }
    return out;
  },
  _clear: function (string) {
    return string.replace(/(\r\n|\n|\r)/gm,'');
  },
  _var: function () {
    return '(!%|%)([a-zA-Z0-9-_]+)';
  },
  _matchString: function () {
    return '[\\w=\\/@#%~`:,;\^\&\\.\"\'_\\-<>\\*\\n\\r\\t\\(\\)\\[\\]\\{\\}\\|\\?\\!\\$\\\\\ ]+';
  },
  _pattern: function (string) {
    // Is the whitespace active element
    var args    = (typeof string.split('/')[1] !== 'undefined') ? string.split('/')[1] : '';
    var pattern = new RegExp('^([\\t ]+|)'+string.split('/')[0]+'[\\n\\r\\t ]+'+whiskers._matchString()+'?\/'+string.split('/')[0]+'([\\t ]+|)([\\n])',args+'m');
    return pattern;
  },
  _find: function (string) {
    var regex = new RegExp("<template[ ]+"+string+">("+whiskers._matchString()+"?)</template>",'m');
    var options = {};
    var template;
    var val;
    for (var k in whiskers.template) {
      template = whiskers.template[k];
      val = template.match(regex);
      if (val) {
        options.template = val[1];
        options.src      = k;

        if (whiskers.debug) {
          options.template = '<!-- whiskers: '+k+' : '+string+' -->\r\n'+val[1];
        }

        return options;
      }
    }
    return false;
  },
  _getJavaScript: function (fun) {
    $.getScript("./_whiskers/js/whiskers_debug.js",function () { fun(); });
  },
  template: {},
  dataFilter: {},
  options: function (object) {
    var p = {
      "data": {
        "index"       : "1",
        "oddOrEven"   : "odd",
        "isLast"      : "true",
        "isFirst"     : "true",
      },
      "templateName" : "init"
    };
    for (var k in object) {
      p[k] = object[k];
    }
    return p;
  },
  comments: function (out,options) {
    var patternSingle = new RegExp('^([\\t ]+|)\\/\\/([\\t ]+|)'+whiskers._matchString()+'?[\\n]+','m');
    var patternDouble = new RegExp('^([\\t ]+|)\\/\\*([\\t ]+|)'+whiskers._matchString()+'?\\*\\/([ ]+|)[\\n]+','m');
    out = out.replace(patternSingle,'');
    out = out.replace(patternDouble,'');
    return out;
  },
  ifmatch: function (out,options) {
    var pattern  = new RegExp('^([\\t ]+|)if[ ]+('+whiskers._matchString()+'?/if)','gm');
    var data     = options.data;

    function ifmatch(ternian) {
      var clean      = ternian.replace(/&amp;/g,'&').replace(/&lt;/,'<').replace(/&gt;/,'>');
      var compare    = clean.split(/&&|\|\|/);
      var boolReturn = true;
      var op; // Operation type
      if (clean.match(/&/)) {
        op = 'and';
      } else if (clean.match(/\|\|/)) {
        op = 'or';
      }
      function bool(string) {
        // Match 'string'|variable <>!== 'string'|variable|number
        var match = string.match(/([a-zA-Z0-9-_% ]+)[ ]+([=!<>]+)[ ]+([a-zA-Z0-9-_% ]+)/);
        var varPattern = whiskers._var();
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
          return whiskers._eval(ternian,data);
        }
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

    function execute() {
      var boolGroup,left,condition,right,bool,content,ifgroup;

      out = out.replace(pattern,function (m) {
        var ifPattern      = new RegExp('^([\\t ]+|)if[ ]+([a-zA-Z0-9\\-_<>%\'\"!&\|; ]+)?:('+whiskers._matchString()+'?(else|/if))','m');
        var elsePattern    = new RegExp('^([\\t ]+|):('+whiskers._matchString()+'?/if)','m');
        var contentPattern = new RegExp('('+whiskers._matchString()+')(else|/if)');
        var ifgroup        = m.match(ifPattern);
        var elsegroup      = m.match(elsePattern);
        var condition,content;

        while (ifgroup) {
          ifgroup = m.match(ifPattern);
          // if Statement
          if (ifgroup) {
            condition = ifmatch(ifgroup[2]);
            console.log(condition);
            content   = ifgroup[3].match(contentPattern)[1];
          } else {
            if (elsegroup) {
              condition = true;
              content   = elsegroup[2].match(contentPattern)[1];
            }
          }
          if (condition) {
            return content;
          }
          m = m.replace(ifPattern,'');
        }
        return '';
      });
    }

    if (out.match(pattern)) {
      execute();
    }

    return out;
  },
  cereal: function (out,options) {
    var pattern = /\[([^;]*?)\]=(&gt;|>)\(([^;]*?)\)/g;
    var data    = options.data;
    if (out.match(pattern)) {
      out = out.replace(pattern,function (m,key) {
        var group = m.match(/\[([^;]*?)\]=(&gt;|>)\(([^;]*?)\)/);
        var arr   = group[1].replace(/\s+/g,'').split(',');
        var micro = group[3];
        var out   = [];
        $.each(arr,function (i,k) {
          data['index']    = (i+1).toString();
          data['value']    = whiskers._eval(k,data)
          options.template = micro;
          options.inside   = true;

          out.push(whiskers.it(options).template);
        });
        return out.join('');
      });
    }
    return out;
  },
  insert: function (out,options) {
    var data = options.data;
    var varPattern = new RegExp(whiskers._var());
    var allVarPattern = new RegExp(whiskers._var(),'g');
    if (out.match(varPattern)) {
      out = out.replace(allVarPattern,function (m) {
        var key = m.match(varPattern)[2];
        return data.hasOwnProperty(key) ? data[key] :"";
      });
    }
    return out;
  },
  wrap: function (out,options) {
    var pattern  = whiskers._pattern('wrap/g');
    var data     = options.data;
    out = out.replace(pattern,function (m) {
      var _options        = $.extend({},options);
      var _attrPattern    = '[\\n\\r\\ta-zA-Z:, ]+';
      var _pattern        = new RegExp('wrap[\\n\\r\\t ]+([a-zA-Z0-9-_]+)(?=[\\n\\r\\t ]+|)({'+_attrPattern+'}|)(?=[\\n\\r\\t ]+|)('+whiskers._matchString()+')/wrap');
      var group           = m.match(_pattern);
      var templateName    = group[1];
      var properties      = group[2];
      var content         = group[3];

      if (properties.length > 0) {
        var propertiesPattern = new RegExp('{('+_attrPattern+')}');
        var propertiesArr = properties.match(propertiesPattern)[1].split(',');
        var _match;

        for (var i=0;i<propertiesArr.length;i++) {
          _match = propertiesArr[i].match(/(?=[\t ]+|)([a-zA-Z0-9-_]+)(?=[\t ]+|):(?=[\t ]+|)([a-zA-Z0-9-_% ]+)/);
          _options.data[_match[1]] = whiskers._eval(_match[2]);
        }
      }

      var find = whiskers._find(templateName);

      if (find) {
        _options.template = find.template.replace(/{{}}/g,content);
        _options.inside   = true;
        return whiskers.it(_options).template;
      }
      return '';
    });
    return out;
  },
  get: function (out,options) {
    var pattern = whiskers._pattern('get/g',out);
    var data     = options.data;
    if (pattern) {
      out = out.replace(pattern,function (m) {
        var _pattern     = new RegExp('get\\s+('+whiskers._matchString()+')/get');
        var group        = m.match(_pattern);
        var arr          = [];
        var templateName = group[1].split(',');
        for (var i=0;i<templateName.length;i++) {
          var k    = templateName[i].replace(/[\t ]+/,'');
          var find = whiskers._find(k);
          if (find) {
            var _options = $.extend(options,{});
            _options.templateName = k;
            _options.template     = find.template;
            _options.src          = find.src;
            arr.push(whiskers.it(_options).template);
          } else {
            whiskers._throwError({code: 7,templateName: k});
          }
        }
        return arr.join('');
      });
    }
    return out;
  },
  each: function (out,options) {
    var data = options.data;
    // Each statement
    var pattern = whiskers._pattern('each/g',out);
    if (out.match(pattern)) {
      out = out.replace(pattern,function (m) {
        var _out         = "";
        var _pattern     = new RegExp('each[\\n\\r\\t ]+([a-zA-Z0-9_\-]+)[\\n\\r\\t ]+([a-zA-Z0-9_\-]+)/each');
        var group        = m.match(_pattern);
        var iterator     = group[1];
        var templateName = group[2];

        if (data.hasOwnProperty(iterator)) {
          var html = [];
          for (var i=0;i<data[iterator].length;i++) {
            var index            = (i+1);
            var oddOrEven        = (i%2 === 0) ? 'odd' : 'even';
            var newData          = data[iterator][i];
            var isLast           = (i+1 === data[iterator].length) ? 'true' : 'false';
            var isFirst          = (i < 1) ? 'true' : 'false';
            var find             = whiskers._find(templateName);
            newData['index']     = index;
            newData['oddOrEven'] = oddOrEven;
            newData['isLast']    = isLast;
            newData['isFirst']   = isFirst;

            var eachOptions   = whiskers.options({
              "templateName" : templateName,
              "template"     : find.template,
              "data-context" : options["data-context"],
              "data"         : newData,
              "context"      : '',
              "src"          : find.src,
              "inside"       : true
            });

            html.push(whiskers.it(eachOptions).template);
          }
          _out = html.join('');
        } else {
          whiskers._throwError({code: 9,iterator: iterator,data: options.data});
        }
        return _out;
      });
    }
    return out;
  },
  clean: function (out,options) {
    var pattern = '{:('+whiskers._matchString()+'):}';
    var regex   = new RegExp(pattern,'g');
    var _regex;
    var _match;
    return out.replace(regex,function (m) {
      _regex = new RegExp(pattern);
      _match = m.match(_regex);
      if (_match) return _match[1];
      else return m;
    });
  },
  it: function (options,callback) {
    var pattern  = new RegExp('[\\t ]+{:('+whiskers._matchString()+'):}','gm');
    var out;

    function execute(out) {
      out = whiskers.comments(out,options);
      out = whiskers.ifmatch(out,options);
      out = whiskers.cereal(out,options);
      out = whiskers.insert(out,options);
      out = whiskers.wrap(out,options);
      out = whiskers.get(out,options);
      out = whiskers.each(out,options);
      out = whiskers.clean(out,options);
      return out;
    }

    if (typeof whiskers.dataFilter[options.templateName] === 'function') {
      options.data = whiskers.dataFilter[options.templateName](options);
    }

    if (options.template.match(pattern)) {
      options.template = options.template.replace(pattern,function (m) {
        return execute(m);
      });
    }
    else if (options.inside) {
      options.template = options.template.replace(options.template,function (m) {
        return execute(m);
      });
    }
    return options;
  },
  context: function (options) {
    return options;
  },
  init:function (options,callback) {
    var whisker     = $('template[whiskers]');
    var out         = whisker.html();
    var whiskerAttr = whisker.attr('whiskers');
    var templates   = whiskers._clear(whiskerAttr.match(/[ ]+templates:([\t\r\n\.\/a-zA-Z0-9_, ]+)(;|)/)[1]).replace(/ /g,'').split(',');
    whiskers.debug  = (whiskerAttr.match(/debug([ ]+|);/)) ? true : false;

    function debug(callback) {
      var whiskersCss     = $('<div class="whiskers_css"></div>').hide();
      var css             = ['./_whiskers/css/styles.css'];
      var systemTemplates = ['./_whiskers/templates/dialogs.html'];
      var timeout         = 100;
      var load;

      function remove() { clearInterval(load); whiskersCss.remove(); }

      $('body').append(whiskersCss);
      $('head').append('<link rel="stylesheet" href="'+css[0]+'" type="text/css">');

      load = setInterval(function () {
        timeout--;
        if ($('.whiskers_css').css('text-align') === 'center') {
          remove();
          whiskers._getJavaScript(function () {
            whiskers._load(systemTemplates,0,callback);
          });
        }
        else if (timeout < 0) {
          alert('whiskers\nThere must be something wrong with your whiskers directory. whiskers was unable to load!');
          remove();
        }
      },100);
    }

    function execute() {
      if (typeof options.data === 'undefined') {
        whiskers._throwError({code: 1});
      } else {
        console.log('Execute');
        options = whiskers.options({template: out,data: options.data});
        out     = whiskers.it(options);
        $('body').prepend(out.template);
      }
    }

    function init() {
      whiskers._load(templates,0,function () {
        if (whiskers.debug) {
          console.log(':: whiskers is in debug mode');
          debug(function () { execute(); });
        } else {
          execute();
        }
      });
    }

    init();
  }
}
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
  template: {},
  dataFilter: {},
  options: function (object) {
    var p = {
      "data": {
        "index"       : "1",
        "oddOrEven"   : "odd",
        "isLast"      : "true",
        "isFirst"     : "true",
      }
    };
    for (var k in object) {
      p[k] = object[k];
    }
    return p;
  },
  _throwError: function (options) {
    var find    = whiskers._find('whiskers-error-window_'+options.code);
    var template  = find.template;
    var data = {};

    data['template-name'] = options.templateName;
    data['file']          = options.file;
    data['url']           = options.src;
    data['data']          = JSON.stringify(options.data);
    data['iterator']      = options.iterator;

    if (options.code === 4) {
      data['error'] = JSON.stringify(options.data).replace(regex,function(m,key) {
        return "<span class='whiskersError-highlight'>"+m+"</span>";
      });
    }

    else if (options.code === 8) {
      data['error'] = JSON.stringify(options.data).replace(regex,function(m,key) {
        return "<span class='whiskersError-highlight'>"+m+"</span>";
      });
    }

    else if (options.code === 9) {
      var regex = new RegExp(options.iterator,'ig');
      data['error'] = JSON.stringify(options.data).replace(regex,function(m,key) {
        return "<span class='whiskersError-highlight'>"+m+"</span>";
      });
    }

    function execute() {
      console.log('exe');
      var options = whiskers.options({file: find.file,template: template,data: data});
      var out     = whiskers.it(options).template;
      return false;
      console.log(out);
      $('body').append(out);
    }

    execute();

    return false;
  },
  _add: function (object) {
    var pattern = '<template ([a-zA-Z0-9-_]+)>('+whiskers._matchString()+'?)</template>';
    var match   = object['template'].match(whiskers._match(pattern,'g'));
    var _match;

    for (var i=0;i<match.length;i++) {
      _match = match[i].match(whiskers._match(pattern));
      whiskers.template[_match[1]] = {
        src: object['file'],
        template: _match[2]
      }
    }
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
    var variable      = new RegExp(whiskers._matchVar);
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
  _match: function (b,r) {
    if (typeof r !== 'undefined') {
      r = new RegExp(b,r);
    } else r = b;
    return r;
  },
  _matchVar: '(?:!%|%)([a-zA-Z0-9-]+)(?:`([a-zA-Z-_]+))|(?:!%|%)([a-zA-Z0-9-]+[^-_<>!?=`\"\'%:;\n ])',
  _matchTemplate: function (r) {
    return whiskers._match('`([a-zA-Z0-9-_]+)',r);
  },
  _matchString: function (r) {
    return whiskers._match('[\\w=\\/@#%~`:,;\^\&\\.\"\'_\\-<>\\*\\n\\r\\t\\(\\)\\[\\]\\{\\}\\|\\?\\!\\$\\\\\ ]+',r);
  },
  _getPattern: function (r) {
    return whiskers._match('(%([a-zA-Z0-9\-]+)|)`([a-zA-Z0-9-\-]+)(\\s+|)({(\\s+|)[\\sa-zA-Z0-9-%:<=>\"\';{}\/\.!@#\$\^\&\*\(\)_\+\\[\\]\\\\]+([^:]})|)',r);
  },
  _eachPattern: function (r) {
    return whiskers._match(whiskers._matchVar+'(\\s+|)'+whiskers._matchTemplate());
  },
  _pattern: function (string) {
    // Is the whitespace active element
    var args    = (typeof string.split('/')[1] !== 'undefined') ? string.split('/')[1] : '';
    var pattern = new RegExp('^([\\t ]+|)'+string.split('/')[0]+'[\\n\\r\\t ]+'+whiskers._matchString()+'?\/'+string.split('/')[0]+'([\\t ]+|)([\\n])',args+'m');
    return pattern;
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
  _getJavaScript: function (fun) {
    var timer;
    $('body').append('<script src="./_whiskers/js/whiskers_debug.js"></script>');
    function checkLoaded() {
      if (whiskers._debugScript) {
        clearTimeout(timer);
        fun();
      } else {
        timer = setTimeout(function() { checkLoaded() },10);
      }
    }
    checkLoaded();
  },
  _fn: {
    comments: function (options) {
      var pattern = new RegExp('\\/\\/([\\t ]+|)'+whiskers._matchString()+'?[\\n]+|\\/\\*([\\t ]+|)'+whiskers._matchString()+'?\\*\\/([ ]+|)[\\n]+','gm');
      options.template = options.template.replace(pattern,'');
      return options;
    },
    ifmatch: function (global) {
      var pattern  = new RegExp('^([\\t ]+|)if[ ]+('+whiskers._matchString()+'?endif)','gm');
      var data     = global.data;

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

        global.template = global.template.replace(pattern,function (m) {
          var ifPattern      = new RegExp('^([\\t ]+|)if[ ]+([a-zA-Z0-9\\-_<=>%\'\"!&\|; ]+)?:('+whiskers._matchString()+'?(else|endif))','m');
          var elsePattern    = new RegExp('^([\\t ]+|):('+whiskers._matchString()+'?endif)','m');
          var contentPattern = new RegExp('('+whiskers._matchString()+')(else|endif)');
          var ifgroup        = m.match(ifPattern);
          var elsegroup      = m.match(elsePattern);
          var condition,content;

          while (ifgroup) {
            ifgroup   = m.match(ifPattern);
            elsegroup = m.match(elsePattern);
            // if Statement
            if (ifgroup) {
              condition = ifmatch(ifgroup[2]);
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

      if (global.template.match(pattern)) {
        execute();
      }

      return global;
    },
    cereal: function (options) {
      var pattern = /\[([^;]*?)\]=(&gt;|>)\(([^;]*?)\)/g;
      var data    = options.data;
      options.template = options.template.replace(pattern,function (m,key) {
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
      return options;
    },
    insert: function (global) {
      var data = global.data;
      var pattern = whiskers._match(whiskers._matchVar,'g');
      global.template = global.template.replace(pattern,function (m) {
        console.log(m);
        var _match = m.match(whiskers._match(whiskers._matchVar));
        var _out   = m;
        // Is insert
        if (typeof _match[1] === 'undefined') {
          var key  = _match[3];
          if (data.hasOwnProperty(key)) {
            _out = data[key];
          } else {
            _out = '';
          }
        }
        return _out;
      });
      return global;
    },
    get: function (global) {
      var data = global.data;
      global.template = global.template.replace(whiskers._getPattern('g'),function (m) {
        if (!m.match(/^%[a-zA-Z0-9-]+/)) {
          var _out               = '';
          var arr                = [];
          var single_propPattern = '([a-zA-Z0-9-_]+)(?=\\s+|):(?=\\s+|)([\\w\\-<=%\"\';\\{}\\[\\]/>\ ]+)';
          var propPattern        = '([a-zA-Z0-9-_]+)(?=\\s+|):(?=\\s+|)([\\w\\-<=%\"\';\\{}\\[\\]/>\\ ]+)((?=;|;\\s+})|(?=\\s+}|}))';
          var group              = m.match(whiskers._getPattern());
          var properties         = group[5].match(whiskers._match(propPattern,'g'));
          var templateName       = group[3];
          var find               = whiskers._find(templateName);
          var data               = {}

          if (find) {
            if (properties) {
              for (var i=0;i<properties.length;i++) {
                var _propGroup = properties[i].match(whiskers._match(single_propPattern));
                global.data[_propGroup[1]] = _propGroup[2].replace(/^[ ]+/,'');
              }
            }
            global.templateName = templateName;
            global.template     = find.template;
            global.src          = find.src;
            global.inside       = true;
            _out                = whiskers.it(global).template;

            return _out;
          } else {
            //whiskers._throwError({code: 7,templateName: k});
            return _out;
          }
        } else {
          return m;
        }
      });
      return global;
    },
    each: function (options) {
      var data     = options.data;
      var pattern  = whiskers._match(whiskers._matchVar,'g');
      options.template = options.template.replace(pattern,function (m) {
        var _match = m.match(whiskers._matchVar);
        if (typeof _match[1] === 'string') {
          var _out         = "";
          var iterator     = _match[1];
          var templateName = _match[2];

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

              var _options   = whiskers.options({
                "templateName" : templateName,
                "template"     : find.template,
                "data-context" : options["data-context"],
                "data"         : newData,
                "context"      : '',
                "src"          : find.src,
                "inside"       : true
              });

              html.push(whiskers.it(_options).template);
            }
            _out = html.join('');
          } else {
            whiskers._throwError({code: 9,iterator: iterator,data: options.data});
          }
          return _out;
        } else {
          return m;
        }
      });
      return options;
    },
    clean: function (options) {
      var pattern = '{:('+whiskers._matchString()+'):}';
      var regex   = new RegExp(pattern,'g');
      var _regex;
      var _match;
      options.template = options.template.replace(regex,function (m) {
        _regex = new RegExp(pattern);
        _match = m.match(_regex);
        if (_match) return _match[1];
        else return m;
      });
      return options;
    }
  }, /* FN */
  it: function (global) {
    var pattern  = new RegExp('(\\s+|){:('+whiskers._matchString()+'):}','gm');

    if (typeof whiskers.dataFilter[global.templateName] === 'function') {
      global = whiskers.dataFilter[global.templateName](global);
    }

    if (global.template.match(pattern) || global.inside) {
      for (var k in whiskers._fn) {
        whiskers._fn[k](global);
      }
    }

    return global;
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
          whiskers._load(systemTemplates,0,callback);
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
        options = whiskers.options({template: out,data: options.data});
        out     = whiskers.it(options);
        $('body').prepend(out.template);
      }
    }

    function init() {
      whiskers._load(templates,0,function () {
        if (whiskers.debug) {
          debug(function () { execute(); });
        } else {
          execute();
        }
      });
    }

    init();
  }
}
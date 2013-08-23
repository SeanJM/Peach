// ------------- Templating */
// Templating
// on develop
// Small Ideas
// The ctrl+7 key combination will bring up a menu allowing you to compile a template



// Big Ideas
// Allow people access to this tool somehow, so they can create templates online
// Don't store any of their data and offer it as a trully free service
// on production
var koala = {
  _add: function (object) {
    if (typeof koala.template[object['file']] === 'undefined') {
      koala.template[object['file']] = '';
    }
    koala.template[object['file']] += object['template'];
  },
  _load: function (arr,index,callback) {
    function execute() {
      $('<div/>').load(arr[index],function (d,k) {
        if (k === 'error') {
          koala._throwError({code: 2,file: arr[index]});
        } else {
          koala._add({file: arr[index],template: d});
          koala._load(arr,index+1,callback);
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
  _stringEval: function (string,data) {
    var isString = string.match(/('|")([^;]*?)('|")/);
    var isInt    = string.match(/^[0-9-]+/);
    var out = '';
    if (isString) {
      out = isString[2];
    } else if (isInt) {
      out = string;
    } else {
      if (data.hasOwnProperty(string)) {
        out = data[string];
      } else {
        out = false;
      }
    }
    return out;
  },
  _clear: function (string) {
    return string.replace(/(\r\n|\n|\r)/gm,'');
  },
  _matchVariables: function () {
    return '[a-zA-Z0-9-_,]+';
  },
  _matchContent: function () {
    return '[\\w=\\/@#%~`:,;\^\&\\.\"\'_\\-<>\\*\\n\\r\\t\\(\\)\\[\\]\\{\\}\\|\\?\\!\\$\\\\\ ]+';
  },
  _pattern: function (string) {
    // Is the whitespace active element
    var args    = (typeof string.split('/')[1] !== 'undefined') ? string.split('/')[1] : '';
    var pattern = new RegExp('^([\\t ]+|)'+string.split('/')[0]+'[\\n\\r\\t ]+'+koala._matchContent()+'?\/'+string.split('/')[0]+'([\\t ]+|)([\\n])',args+'m');
    return pattern;
  },
  _find: function (string) {
    var regex = new RegExp("<template[ ]+"+string+">("+koala._matchContent()+"?)</template>",'m');
    var options = {};
    var template;
    var val;
    for (var k in koala.template) {
      template = koala.template[k];
      val = template.match(regex);
      if (val) {
        options.template = val[1];
        options.src      = k;

        if (koala.debug) {
          options.template = '<!-- koala: '+k+' : '+string+' -->\r\n'+val[1];
        }

        return options;
      }
    }
    return false;
  },
  _throwError: function (options) {
    var find = koala._find('koala-error-window');
    var window     = find.template;
    var data = {};

    if (options.code === 1) {
      data['error-code'] = 'JSON is missing <strong>"init"</strong> at root';
      data['error-message'] = 'koala initializer requires a JSON object named <span class="koala-error-highlight">init</span>';
      data['example'] = '{\n "init": {\n "header":"header",\n "body":"header"\n }\n }';
    }
    if (options.code === 2) {
      data['error-code'] = 'Template File: '+options.file+' does not exist';
      data['error-message'] = 'Make sure your template file is a real file before refreshing.';
    }
    else if (options.code === 3) {
      data['error-code'] = 'Invalid URL';
      data['error-message'] = 'The url <strong>"'+options.src+'"</strong> is not a valid URL. Please check the address and try again';
    }
    else if (options.code === 4) {
      data['error-code'] = 'JSON Object requires the matching key for the template name';
      data['error-message'] = 'Check JSON for a key with the name: <strong>'+options.templateName+'</strong>';
      data['error'] = JSON.stringify(options.data).replace(regex,function(m,key) {
        return "<span class='koalaError-highlight'>"+m+"</span>";
      });
      data['example'] = '{<span class="koalaError-highlight">"'+options.templateName+'"</span>:'+JSON.stringify(options.data)+'}'
    }
    else if (options.code === 5) {
      data['error-code'] = 'Missing JSON Object';
      data['error-message'] = 'koala initializer requires a JSON object';
      data['example'] = 'koala.init({\n\t"src": "templates/templates.html",\n\t"data": JSON\n},callback)';
    }
    else if (options.code === 6) {
      data['error-code'] = 'Invalid URL';
      data['error-message'] = 'The url <strong>"'+options.src+'"</strong> is not a valid URL. Please check the address and try again';
    }
    else if (options.code === 7) {
      data['error-code'] = '7';
      data['error-title'] = 'Template "'+options.templateName+'" does not exist';
      if (typeof options.url !== 'undefined') data['error-message'] = 'Check <strong>'+options.url+'</strong> for errors';
      data['example'] = '&lt;template <strong>'+options.templateName+'</strong>&gt;{{key}}&lt;/template&gt;';
      data['example-text'] = '{{key}} will return a value from your JSON object, if it exists.';
    }
    else if (options.code === 8) {
      data['error-code'] = 'JSON Object requires the matching key for the template name';
      data['error-message'] = 'Check JSON for a key with the name: <strong>'+options.templateName+'</strong>';
      data['error'] = JSON.stringify(options.data).replace(regex,function(m,key) {
        return "<span class='koalaError-highlight'>"+m+"</span>";
      });
      data['example'] = '{<span class="koalaError-highlight">"'+options.templateName+'"</span>:'+JSON.stringify(options.data)+'}'
    }
    else if (options.code === 9) {
      var regex = new RegExp(options.iterator,'ig');
      data['error-code'] = 'Iterator <strong>'+options.iterator+'</strong> does not exist'
      data['error-message'] = 'Check JSON for:'+options.iterator;
      data['error'] = JSON.stringify(options.data).replace(regex,function(m,key) {
        return "<span class='koalaError-highlight'>"+m+"</span>";
      });
    }
    else if (options.code === 10) {
      data['error-code']    = 'Templates are not defined'
      data['error-message'] = 'Make sure to attach templates to koala.init()';
      data['example']       = 'koala.init({\n\tdata: json,\n\ttemplates: ["./templates/template_header.html,./templates/template_body.html"],\n\tonload: script.init();\n});';
    }
    else if (options.code === 11) {
      data['error-code']    = 'Invalid if statement'
      data['error-message'] = 'Make sure if statement is properly formated';
      data['example']       = 'if variable|variable == true: \n\tmy other arguments\n /if';
    }

    function execute() {
      var options = koala.options({file: find.file,template: window,data: data});
      var out     = koala.it(options).template;
      $('body').append(out);
    }

    if (koala.debug) execute();

    return false;
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
    var patternSingle = new RegExp('^([\\t ]+|)\\/\\/([\\t ]+|)'+koala._matchContent()+'?[\\n]+','m');
    var patternDouble = new RegExp('^([\\t ]+|)\\/\\*([\\t ]+|)'+koala._matchContent()+'?\\*\\/([ ]+|)[\\n]+','m');
    out = out.replace(patternSingle,'');
    out = out.replace(patternDouble,'');
    return out;
  },
  ifmatch: function (out,options) {
    var pattern  = new RegExp('^([\\t ]+|)if[ ]+('+koala._matchContent()+'?/if)','gm');
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
        var match = string.match(/([a-zA-Z0-9-_'"]+)[ ]+([=!<>]+)[ ]+([a-zA-Z0-9-_'"]+)/);
        var left,right,condition,out;
        if (match) { // There are conditions
          left      = koala._stringEval(match[1],data);
          condition = match[2];
          right     = koala._stringEval(match[3],data);
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
          if (koala._stringEval(ternian,data)) {
            return data.hasOwnProperty(ternian);
          }
          return false;
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
        var ifPattern      = new RegExp('^([\\t ]+|)if[ ]+([a-zA-Z0-9\\-_<>=\'\"!&\|; ]+)?:('+koala._matchContent()+'?(else|/if))','m');
        var elsePattern    = new RegExp('^([\\t ]+|):('+koala._matchContent()+'?/if)','m');
        var contentPattern = new RegExp('('+koala._matchContent()+')(else|/if)');
        var ifgroup        = m.match(ifPattern);
        var elsegroup      = m.match(elsePattern);
        var condition,content;

        while (ifgroup) {
          ifgroup = m.match(ifPattern);
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
          data['value']    = koala._stringEval(k,data)
          options.template = micro;
          options.inside   = true;

          out.push(koala.it(options).template);
        });
        return out.join('');
      });
    }
    return out;
  },
  each: function (out,options) {
    var data = options.data;
    // Each statement
    var pattern = koala._pattern('each/g',out);
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
            var find             = koala._find(templateName);
            newData['index']     = index;
            newData['oddOrEven'] = oddOrEven;
            newData['isLast']    = isLast;
            newData['isFirst']   = isFirst;

            var eachOptions   = koala.options({
              "templateName" : templateName,
              "template"     : find.template,
              "data-context" : options["data-context"],
              "data"         : newData,
              "context"      : '',
              "src"          : find.src,
              "inside"       : true
            });

            html.push(koala.it(eachOptions).template);
          }
          _out = html.join('');
        } else {
          koala._throwError({code: 9,iterator: iterator,data: options.data});
        }
        return _out;
      });
    }
    return out;
  },
  get: function (out,options) {
    var pattern = koala._pattern('get/g',out);
    var data     = options.data;
    if (pattern) {
      out = out.replace(pattern,function (m) {
        var _pattern     = new RegExp('get\\s+('+koala._matchContent()+')/get');
        var group        = m.match(_pattern);
        var arr          = [];
        var templateName = group[1].split(',');
        for (var i=0;i<templateName.length;i++) {
          var k    = templateName[i].replace(/[\t ]+/,'');
          var find = koala._find(k);
          if (find) {
            var _options = $.extend(options,{});
            _options.templateName = k;
            _options.template     = find.template;
            _options.src          = find.src;
            arr.push(koala.it(_options).template);
          } else {
            koala._throwError({code: 7,templateName: k});
          }
        }
        return arr.join('');
      });
    }
    return out;
  },
  wrap: function (out,options) {
    var pattern  = koala._pattern('wrap/g');
    var data     = options.data;
    out = out.replace(pattern,function (m) {
      var _options        = $.extend({},options);
      var _attrPattern    = '[\\n\\r\\ta-zA-Z:\'\", ]+';
      var _pattern        = new RegExp('wrap[\\n\\r\\t ]+([a-zA-Z0-9-_]+)(?=[\\n\\r\\t ]+|)(=>|=&gt;|)(?=[\\n\\r\\t ]+|)({'+_attrPattern+'}|)(?=[\\n\\r\\t ]+|)('+koala._matchContent()+')/wrap');
      var group           = m.match(_pattern);
      var templateName    = group[1];
      var properties      = group[3];
      var content         = group[4];

      if (properties.length > 0) {
        var propertiesPattern = new RegExp('{('+_attrPattern+')}');
        var propertiesArr = properties.match(propertiesPattern)[1].split(',');
        var _match;

        for (var i=0;i<propertiesArr.length;i++) {
          _match = propertiesArr[i].match(/(?=[\t ]+|)([a-zA-Z0-9-_]+)(?=[\t ]+|):(?=[\t ]+|)([a-zA-Z0-9-_'" ]+)/);
          _options.data[_match[1]] = koala._stringEval(_match[2]);
        }
      }

      var find = koala._find(templateName);

      if (find) {
        _options.template = find.template.replace(/{{}}/g,content);
        _options.inside   = true;
        return koala.it(_options).template;
      }
      return '';
    });
    return out;
  },
  insert: function (out,options) {
    var data = options.data;
    if (out.match(/=([a-zA-Z0-9-_]+)/)) {
      out = out.replace(/=[\a-zA-Z0-9-_]+/g,function (m) {
        var key = m.match(/=([a-zA-Z0-9-_]+)/)[1];
        return data.hasOwnProperty(key) ? data[key] :"";
      });
    }
    return out;
  },
  clean: function (out,options) {
    var pattern = '{:('+koala._matchContent()+'):}';
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
    var pattern  = new RegExp('[\\t ]+{:('+koala._matchContent()+'):}','gm');
    var out;

    function execute(out) {
      out = koala.comments(out,options);
      out = koala.ifmatch(out,options);
      out = koala.cereal(out,options);
      out = koala.insert(out,options);
      out = koala.wrap(out,options);
      out = koala.get(out,options);
      out = koala.each(out,options);
      out = koala.clean(out,options);
      return out;
    }

    if (typeof koala.dataFilter[options.templateName] === 'function') {
      options.data = koala.dataFilter[options.templateName](options);
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
    var whisker     = $('template[koala]');
    var out         = whisker.html();
    var whiskerAttr = whisker.attr('koala');
    var templates   = koala._clear(whiskerAttr.match(/[ ]+templates:([\t\r\n\.\/a-zA-Z0-9_, ]+)(;|)/)[1]).replace(/ /g,'').split(',');
    koala.debug  = (whiskerAttr.match(/debug([ ]+|);/)) ? true : false;

    function debug(callback) {
      var koalaCss     = $('<div class="koala_css"></div>').hide();
      var css             = ['./_koala/css/styles.css'];
      var systemTemplates = ['./_koala/templates/dialogs.html'];
      var timeout         = 100;
      var load;

      function remove() { clearInterval(load); koalaCss.remove(); }

      $('body').append(koalaCss);
      $('head').append('<link rel="stylesheet" href="'+css[0]+'" type="text/css">');

      load = setInterval(function () {
        timeout--;
        if ($('.koala_css').css('text-align') === 'center') {
          remove();
          koala._load(systemTemplates,0,callback);
        }
        else if (timeout < 0) {
          alert('koala\nThere must be something wrong with your koala directory. koala was unable to load!');
          remove();
        }
      },100);
    }

    function execute() {
      if (typeof options.data === 'undefined') {
        koala._throwError({code: 1});
      } else {
        console.log('Execute');
        options = koala.options({template: out,data: options.data});
        out     = koala.it(options);
        $('body').prepend(out.template);
      }
    }

    function init() {
      koala._load(templates,0,function () {
        if (koala.debug) {
          console.log(':: koala is in debug mode');
          debug(function () { execute(); });
        } else {
          execute();
        }
      });
    }

    init();
  }
}
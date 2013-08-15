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
  _stringEval: function (string,data) {
    var isString = string.match(/('|")(.*?)('|")/);
    var out = '';
    if (isString) out = isString[2];
    else out = data[string];
    return out;
  },
  template: {},
  dataFilter: {

  },
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
  throwError: function (options) {
    var findObject = whiskers.find('whiskers-error-window');
    var window     = findObject.template;
    var data = {};

    if (options.code === 1) {
      data['error-code'] = 'JSON is missing <strong>"init"</strong> at root';
      data['error-message'] = 'whiskers initializer requires a JSON object named <span class="whiskers-error-highlight">init</span>';
      data['example'] = '{\n "init": {\n "header":"header",\n "body":"header"\n }\n }';
    }
    if (options.code === 2) {
      data['error-code'] = 'Template File: '+options.file+' does not exist';
      data['error-message'] = 'Make sure your template file is a real file before refreshing.';
    } else if (options.code === 3) {
      data['error-code'] = 'Invalid URL';
      data['error-message'] = 'The url <strong>"'+options.src+'"</strong> is not a valid URL. Please check the address and try again';
    } else if (options.code === 4) {
      data['error-code'] = 'JSON Object requires the matching key for the template name';
      data['error-message'] = 'Check JSON for a key with the name: <strong>'+options.templateName+'</strong>';
      data['error'] = JSON.stringify(options.data).replace(regex,function(m,key) {
        return "<span class='whiskersError-highlight'>"+m+"</span>";
      });
      data['example'] = '{<span class="whiskersError-highlight">"'+options.templateName+'"</span>:'+JSON.stringify(options.data)+'}'
    } else if (options.code === 5) {
      data['error-code'] = 'Missing JSON Object';
      data['error-message'] = 'whiskers initializer requires a JSON object';
      data['example'] = 'whiskers.init({\n\t"src": "templates/templates.html",\n\t"data": JSON\n},callback)';
    } else if (options.code === 6) {
      data['error-code'] = 'Invalid URL';
      data['error-message'] = 'The url <strong>"'+options.src+'"</strong> is not a valid URL. Please check the address and try again';
    } else if (options.code === 7) {
      data['error-code'] = 'Template "'+options.templateName+'" does not exist';
      if (typeof options.url !== 'undefined') data['error-message'] = 'Check <strong>'+options.url+'</strong> for errors';
      data['example'] = '&lt;template <strong>'+options.templateName+'</strong>&gt;{{key}}&lt;/template&gt;';
      data['example-text'] = '{{key}} will return a value from your JSON object, if it exists.';
    } else if (options.code === 8) {
      data['error-code'] = 'JSON Object requires the matching key for the template name';
      data['error-message'] = 'Check JSON for a key with the name: <strong>'+options.templateName+'</strong>';
      data['error'] = JSON.stringify(options.data).replace(regex,function(m,key) {
        return "<span class='whiskersError-highlight'>"+m+"</span>";
      });
      data['example'] = '{<span class="whiskersError-highlight">"'+options.templateName+'"</span>:'+JSON.stringify(options.data)+'}'
    } else if (options.code === 9) {
      var regex = new RegExp(options.iterator,'ig');
      data['error-code'] = 'Iterator <strong>'+options.iterator+'</strong> does not exist'
      data['error-message'] = 'Check JSON for:'+options.iterator;
      data['error'] = JSON.stringify(options.data).replace(regex,function(m,key) {
        return "<span class='whiskersError-highlight'>"+m+"</span>";
      });
    }

    function execute() {
      var options   = whiskers.options({file: findObject.file,template: window,data: data});
      var out = whiskers.it(options).template;
      $('body').append(out);
      //processed.css('left',($('body').width()/2)-(processed.width()/2)+'px');
      //processed.on('click',function () { processed.remove(); });
    }

    if (whiskers.debug) execute();

    return false;
  },
  each: function (out,options) {
    var data = options.data;
    // Each statement
    var pattern = /each\s+(.*?)\s+endeach/g;
    if (out.match(pattern)) {
      out = out.replace(pattern,function (m,key) {
        var _out          = "";
        var group        = m.match(/each\s+([a-zA-Z0-9-]+)\s+([a-zA-Z0-9-]+)\s+endeach/);
        var iterator     = group[1];
        var templateName = group[2];

        if (options.data.hasOwnProperty(iterator)) {
          var html = [];
          for (var i=0;i<options.data[iterator].length;i++) {
            var index            = (i+1);
            var oddOrEven        = (i%2 === 0) ? 'odd' : 'even';
            var newData          = options.data[iterator][i];
            var isLast           = (i+1 === options.data[iterator].length) ? 'true' : 'false';
            var isFirst          = (i < 1) ? 'true' : 'false';
            var find             = whiskers.find(templateName);
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
              "src"          : find.src
            });

            console.log(eachOptions);

            html.push(whiskers.it(eachOptions).template);
          }
          _out = html.join('');
        } else {
          whiskers.throwError({code: 9,iterator: iterator,data: options.data});
        }
        return _out;
      });
    }
    return out;
  },
  find: function (string) {
    var regex = new RegExp("<template\\s+"+string+">(.*?)</template>","i");
    var val;
    var options = {};
    for (var k in whiskers.template) {
      val = whiskers.template[k].match(regex);
      if (val) {
        options.template = val[1];
        options.src      = k;

        if (whiskers.debug) {
          options.template = '<!-- template: '+k+' ('+string+') -->'+val[1];
        }

        return options;
      }
    }
    whiskers.throwError({code: 7,templateName: string});
    return false;
  },
  get: function (out,options) {
    var pattern = /get\s+(.*?)\s+endget/g;
    if (out.match(pattern)) {
      out = out.replace(pattern,function (m) {
        var group = m.match(/get\s+(.*?)\s+endget/);
        var arr   = [];
        var templateName = group[1].split(',');
        $.each(templateName,function (i,k) {
          var find = whiskers.find(k);
          if (find) {
            var _options = options;
            _options.templateName = k;
            _options.template     = find.template;
            _options.src          = find.src;
            arr.push(whiskers.it(_options).template);
          }
        });
        return arr.join('');
      });
    }
    return out;
  },
  wrap: function (out,options) {
    var pattern = /wrap\s+([a-zA-Z0-9_-]+)\s+(.*?)\s+endwrap/g;
    var data    = options.data;
    var match   = out.match(pattern);
    if (out.match(pattern)) {
      out = out.replace(pattern,function (m,key) {
        var group           = m.match(/wrap\s+([a-zA-Z0-9_-]+)\s+(.*?)\s+endwrap/);
        var templateName    = group[1];
        var content         = group[2];
        var find            = whiskers.find(templateName);
        var _options      = options;
        if (find) {
          template            = find.template.replace(/{{}}/g,content);
          _options.template = template;
          src                 = find.src;
          return whiskers.it(_options).template;
        }
        return '';
      });
    }
    return out;
  },
  templateAdd: function (object) {
    if (typeof whiskers.template[object['file']] === 'undefined') {
      whiskers.template[object['file']] = '';
    }
    whiskers.template[object['file']] += object['template'].replace(/(\r\n|\n|\r)/gm,'');
  },
  templateLoad: function (arr,index,callback) {
    function execute() {
      $('<div/>').load(arr[index],function (d,k) {
        if (k === 'error') {
          whiskers.throwError({code: 2,file: arr[index]});
        } else {
          whiskers.templateAdd({file: arr[index],template: d});
          whiskers.templateLoad(arr,index+1,callback);
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
  insert: function (out,options) {
    var data = options.data;
    console.log(data);
    if (out.match(/=([a-zA-Z0-9-_]+)/)) {
      out = out.replace(/=[\a-zA-Z0-9-_]+/g,function (m) {
        var key = m.match(/=([a-zA-Z0-9-_]+)/)[1];
        return data.hasOwnProperty(key) ? data[key] :"";
      });
    }
    return out;
  },
  cereal: function (out,options) {
    var pattern = /\[(.*?)\]-(&gt;|>)\((.*?)\)/g;
    var data    = options.data;
    if (out.match(pattern)) {
      out = out.replace(pattern,function (m,key) {
        var group = m.match(/\[(.*?)\]-(&gt;|>)\((.*?)\)/);
        var arr   = group[1].replace(/\s+/g,'').split(',');
        var micro = group[3];
        var out   = [];
        $.each(arr,function (i,k) {
          var variables = {
            'index':(i+1).toString(),
            'value': whiskers._stringEval(k,data)
          }
          var options = whiskers.options({data: variables,template: micro,inside: true});
          out.push(whiskers.it(options).template);
          console.log(whiskers.it(options));
        });
        return out.join('');
      });
    }
    return out;
  },
  comments: function (out,options) {
    return out.replace(/\/\/(.*?)\/\//,'');
  },
  ifmatch: function (template,options) {
    // Next thing is fixing ifmatch
    var pattern  = /if\s+(.*?)\s+endif/ig;
    var data     = options.data;

    function ifmatch(left,condition,right) {
      var bool;
      left  = whiskers._stringEval(left,data);
      right = whiskers._stringEval(right,data);
      if (condition === '==') bool = (left == right);
      else if (condition === '===') bool = (left === right);
      else if (condition === '!=') bool = (left != right);
      else if (condition === '!==') bool = (left !== right);
      else if (condition === '<=') bool = (left <= right);
      else if (condition === '>=') bool = (left >= right);
      else if (condition === '>') bool  = (left > right);
      else if (condition === '<') bool  = (left < right);
      return bool;
    }

    var out = template.replace(pattern,function (m,key) {
      var pat   = /(else|if)(\s+)([a-zA-Z0-9-'"]+(\s+|)(===|==|=|!|<|>)(\s+|)[a-zA-Z0-9-'"]+|[a-zA-Z0-9-'"]+)(\s+|)(.*?)(else|endif)/ig;
      // Match if groups
      var ifgroup = m.split('else');
      for (var i=0;i<ifgroup.length;i++) {
        k = ifgroup[i];
        var match   = k.match(/if\s+([a-zA-Z0-9-'"]+\s+(===|==|<=|>=|!==|!=|<|>)\s+[a-zA-Z0-9-'"]+|[a-zA-Z0-9-'"]+)\s+([<\/='"_+->a-zA-Z0-9 ]+)(endif|)/);
        var bool,content;
        // group is if or else if
        if (match) {
          bool    = match[1];
          content = match[3].replace(/(.*?)\s+endif/,function (m,key) {
            return m.match(/(.*?)(\s+endif)/)[1];
          });
          // check if bool has left & right
          var boolGroup = bool.match(/([a-zA-Z0-9-'"]+)(\s+(===|==|<=|>=|!==|!=|<|>)\s+|)([a-zA-Z0-9-'"]+|)/);
          var left      = boolGroup[1];
          var condition = boolGroup[3];
          var right     = boolGroup[4];
          if (typeof condition === 'undefined') {
            if (data.hasOwnProperty(left)) {
              return content;
            }
          } else {
            if (ifmatch(left,condition,right)) {
              return content;
            }
          }
        } else {
          // group is else
          match = k.match(/([\(\){}\,\[\]$&<\/='"_+->a-zA-Z0-9 ]+)endif/);
          bool    = '';
          content = match[1];
          return content;
        }
      }
      return '';
    });

    return out;
  },
  clean: function (out,options) {
    return out.replace(/{:(.*?):}/,function (m,key) {
      var match = m.match(/{:(.*?):}/);
      if (match) return match[1];
      else return m;
    });
  },
  it: function (options,callback) {
    var pattern  = /{:(.*?):}/ig;
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
      options.template = options.template.replace(pattern,function (m,key) {
        return execute(m);
      });
    } else if (options.inside) {
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
    var timeout         = 100;
    var whisker         = $('template[whiskers]');
    var out             = whisker.html().replace(/(\r\n|\n|\r)/gm,'');
    var systemTemplates = ['./_whiskers/templates/dialogs.html'];
    var css             = ['./_whiskers/css/styles.css'];
    var whiskersCss     = $('<div class="whiskers_css"></div>').hide();
    var load;

    whiskers.debug = (whisker.attr('whiskers') === 'debug');

    function execute() {
      console.log(':: Whiskers execute');
      if (typeof options.data.init === 'undefined') {
        whiskers.throwError({code: 1});
      } else {
        options = whiskers.options({template: out,data: options.data});
        out = whiskers.it(options);
        $('body').prepend(out.template);
      }
    }

    function debug(callback) {
      function remove() {
        clearInterval(load);
        whiskersCss.remove();
      }
      $('body').append(whiskersCss);
      $('head').append('<link rel="stylesheet" href="'+css[0]+'" type="text/css">');

      load = setInterval(function () {
        timeout--;
        if ($('.whiskers_css').css('text-align') === 'center') {
          remove();
          whiskers.templateLoad(systemTemplates,0,callback);
        }
        else if (timeout < 0) {
          alert('Whiskers\nThere must be something wrong with your Whiskers directory. Whiskers was unable to load!');
          remove();
        }
      },100);
    }

    function init() {
      var pattern = out.match(/{:(.*?)\s+init\s+(.*?)\s+endinit(.*?):}/);
      var templateFiles;

      function cleanArray(arr) {
        var newArr = [];
        $.each(arr,function (i,k) {
          if (k.length > 0) newArr.push(k.replace(/ /g,''));
        });
        return newArr;
      }

      function init_execute() {
        if (whiskers.debug) {
          console.log(':: Whiskers is in debug mode');
          debug(function () { execute(); });
        } else {
          execute();
        }
      }

      if (pattern) {
        out = whiskers.ifmatch(out,options);
        templateFiles = cleanArray(out.match(/init\s+(.*?)\s+endinit/)[1].split(','));
        out = out.replace(/init\s+(.*?)\s+endinit/,function (m,key) {
          return '';
        });
        whiskers.templateLoad(templateFiles,0,function () {
          init_execute();
        });
      } else {
        init_execute();
      }
    }

    init();
  }
}
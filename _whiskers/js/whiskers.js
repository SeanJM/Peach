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
  template: '',
  dataFilter: {

  },
  options: function (object) {
    var p = {
      "$index"       : "1",
      "$oddOrEven"   : "odd",
      "$isLast"      : "true",
      "$isFirst"     : "true",
      "templateName" : "init"
    };
    for (var k in object) {
      p[k] = object[k];
    }
    return p;
  },
  throwError: function (options) {
    console.log('Error',options);
    var window =  whiskers.find('whiskers-error-window');
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
      console.log('execute error window');
      var options   = whiskers.options({template: window,data: data});
      var processed = $(whiskers.it(options).template);
      console.log(processed);
      $('body').append(processed);
      processed.css('left',($('body').width()/2)-(processed.width()/2)+'px');
      processed.on('click',function () { processed.remove(); });
    }

    if (whiskers.debug) execute();

    return false;
  },
  each: function (options) {
    // Each statement
    var regEx = /{{(\s+|)each\s+(.*?)\s+each(\s+|)}}/g;
    if (options.template.match(regEx)) {
      options.template = options.template.replace(regEx,function (m,key) {
        var out          = "";
        var group        = m.match(/{{(\s+|)each\s+([a-zA-Z0-9-]+)\s+do\s+([a-zA-Z0-9-]+)/);
        var iterator     = group[2];
        var templateName = group[3];

        if (options.data.hasOwnProperty(iterator)) {
          var html = [];
          for (var i=0;i<options.data[iterator].length;i++) {
            var index             = (i+1);
            var oddOrEven         = (i%2 === 0) ? 'odd' : 'even';
            var newData           = options.data[iterator][i];
            var isLast            = (i+1 === options.data[iterator].length) ? 'true' : 'false';
            var isFirst           = (i < 1) ? 'true' : 'false';
            newData['$index']     = index;
            newData['$oddOrEven'] = oddOrEven;
            newData['$isLast']    = isLast;
            newData['$isFirst']   = isFirst;

            var eachOptions   = whiskers.options({
              "$index"       : index,
              "$oddOrEven"   : oddOrEven,
              "$isLast"      : isLast,
              "$isFirst"     : isFirst,
              "templateName" : templateName,
              "template"     : whiskers.find(templateName),
              "data-context" : options["data-context"],
              "data"         : newData,
              "context"      : '',
              "url"          : options['url']
            });

            if (whiskers.debug) {
              eachOptions.template = '<!-- Template: '+options['url']+' >> '+templateName+' -->'+eachOptions.template;
            }

            html.push(whiskers.it(eachOptions).template);
          }
          out = html.join('');
        } else {
          whiskers.throwError({code: 9,iterator: iterator,data: options.data});
        }
        return out;
      });
    }
    return options;
  },
  find: function (string) {
    var regex = new RegExp("<template\\s+"+string+">(.*?)</template>","i");
    var val = whiskers.template.match(regex);
    if (val === null) return false;
    if (val) return val[1];
  },
  get: function (options) {
    // get statement
    if (options.template.match(/{{(\s+|)get\s+(.*?)\s+get(\s+|)}}/)) {
      options.template = options.template.replace(/{{(\s+|)get\s+(.*?)\s+get(\s+|)}}/g,function (m,key) {
        var group = m.match(/{{(\s+|)get\s+(.*?)\s+get(\s+|)}}/);
        var out = [];
        var templateName = group[2].split(',');
        $.each(templateName,function (i,k) {
          if (whiskers.find(k)) {
            var newOptions   = {
              "$index"       : "1",
              "$oddOrEven"   : "odd",
              "$isLast"      : "true",
              "$isFirst"     : "true",
              "templateName" : k,
              "template"     : whiskers.find(k),
              "data-context" : options["data-context"],
              "data"         : options["data"],
              "context"      : '',
              "url"          : options['url']
            }
            out.push(whiskers.it(newOptions).template);
          } else {
            whiskers.throwError({code: 7,templateName: k});
          }
        });
        return out.join('');
      });
    }
    return options;
  },
  wrap: function (options) {
    if (options.template.match(/{{(\s+|)wrap\s+(.*?)\s+wrap(\s+|)}}/)) {
      console.log('wrap');
      options.template = options.template.replace(/{{(\s+|)wrap\s+(.*?)\s+wrap(\s|)}}/g,function (m,key) {
        var group           = m.match(/{{(\s+|)wrap\s+([a-zA-Z0-9-]+)\s+(.*?)\s+wrap(\s|)}}/);
        var templateName    = group[2];
        var content         = group[3];
        var template        = whiskers.find(templateName).replace(/{{}}/g,content);
        var newOptions      = options;
        newOptions.template = template;
        return whiskers.it(newOptions).template;
      });
    }
    return options;
  },
  insert: function (options) {
    var template = options.template;
    var data     = options.data;

    if (typeof whiskers.dataFilter[options.templateName] === 'function') {
      data = whiskers.dataFilter[options.templateName](options);
    }

    options.template = template.replace(/{{([\$a-zA-Z0-9-]+)}}/g,function (m,key) {
      var out = "";
      out = data.hasOwnProperty(key) ? data[key] :"";
      return out;
    });
    return options;
  },
  ifmatch: function (options) {
    // Next thing is fixing ifmatch
    var template = options.template;
    function ifmatch(left,condition,right) {
      var bool;
      if (condition === '==') bool = (left == right);
      else if (condition === '!=') bool = (left != right);
      else if (condition === '<=') bool = (left <= right);
      else if (condition === '>=') bool = (left >= right);
      else if (condition === '>') bool  = (left > right);
      else if (condition === '<') bool  = (left < right);
      return bool;
    }
    function execute() {
      return template.replace(/{{(\s+|)if\s+(.*?)\s+if(\s+|)}}/ig,function (m,key) {
        var data       = options.data;
        var out        = "";
        var ifgroup    = m.match(/{{(\s+|)if\s+([\$a-zA-Z0-9-]+)\s+(.*?)\s+(else|if(\s+|)}})/);
        var comparison = m.match(/(=|==|!=|<|>)\s+([a-zA-Z0-9-]+)\s+(.*?)\s+(else|if)/);
        var elsegroup  = m.match(/else (.*?) if}}/);

        // No Comparison
        if (!comparison) {
          if (data.hasOwnProperty(ifgroup[2])) {
            out = ifgroup[3];
          } else if (elsegroup) {
            out = elsegroup[1];
          }
        } else {
          if (ifmatch(data[ifgroup[2]],comparison[1],comparison[2])) {
            out = comparison[3];
          } else if (elsegroup) {
            out = elsegroup[1];
          }
        }
        return out;
      });
    }
    if (template.match(/{{(\s+|)if\s+(.*?)\s+if(\s+|)}}/)) {
      options.template = execute();
    }
    return options;
  },
  cereal: function (options) {
    var regEx = /\[(.*?)\]\((.*?){{(.*?)}}(.*?)\)/g;

    if (options.template.match(regEx)) {
      options.template = options.template.replace(regEx,function (m,key) {
        var group = m.match(/\[(.*?)\]\((.*?)\)/);
        var arr   = group[1].replace(/\s+/g,'').split(',');
        var micro = group[2];
        var out   = [];
        $.each(arr,function (i,k) {
          var variables = {
            '$index':(i+1).toString(),
            '$name': k
          }
          var options = whiskers.options({data: variables,template: micro});
          out.push(whiskers.it(options).template);
        });
        return out.join('');
      });
    }
    return options;
  },
  templateAdd: function (string) {
    whiskers.template += string.replace(/(\r\n|\n|\r)/gm,'');
  },
  templateLoad: function (arr,index,callback) {
    function execute() {
      $('<div/>').load(arr[index],function (d,k) {
        console.log('Template Load');
        if (k === 'error') {
          whiskers.throwError({code: 2,file: arr[index]});
        } else {
          whiskers.templateAdd(d);
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
  cmd_init: function (options,callback) {
    var out;
    function cleanArray(arr) {
      var newArr = [];
      $.each(arr,function (i,k) {
        if (k.length > 0) newArr.push(k);
      });
      return newArr;
    }
    if (options.template.match(/#init\((.*?)\)/)) {
      options.template = options.template.replace(/#init\((.*?)\)/,function (m,key) {
        var templateFiles = cleanArray(m.match(/\((.*?)\)/)[1].split(','));
        whiskers.templateLoad(templateFiles,0,callback);
        return '';
      });
    }
    return options;
  },
  removeComments: function (options) {
    options.template = options.template.replace(/{{(.*?)\/\/(.*?)\/\/(.*?)}}/,function (m,key) {
      return m.replace(/\/\/(.*?)\/\//,'');
    });
    return options;
  },
  it: function (options) {
    console.log('whiskers it');
    options = whiskers.removeComments(options);
    options = whiskers.ifmatch(options);
    options = whiskers.cereal(options);
    options = whiskers.wrap(options);
    options = whiskers.get(options);
    options = whiskers.insert(options);
    options = whiskers.each(options);
    return options;
  },
  loader: function (options,callback) {
    options = whiskers.ifmatch(options);
    options = whiskers.cereal(options);
    options = whiskers.cmd_init(options,function () {
      console.log('cmd_init');
      // Loaded all templates into whiskers.template;
      console.log(options);
      options = whiskers.it(options);
      $('body').prepend(options.template);
      if (typeof callback === 'function') callback();
    });
  },
  system_init: function (callback) {
    var systemTemplates = ['./_whiskers/templates/dialogs.html'];
    var css             = ['./_whiskers/css/styles.css'];
    var timeout         = 100;
    var whiskersCss     = $('<div class="whiskers_css"></div>').hide();

    function remove() {
      clearInterval(load);
      whiskersCss.remove();
    }

    $('body').append(whiskersCss);
    $('head').append('<link rel="stylesheet" href="'+css[0]+'" type="text/css">');

    var load = setInterval(function () {
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
  },
  init:function (options,callback) {
    var frame      = $('template');
    var string     = frame.html().replace(/(\r\n|\n|\r)/gm,'');
    whiskers.debug = (typeof frame.attr('debug') === 'string');

    function execute() {
      if (typeof options.data.init === 'undefined') {
        whiskers.throwError({code: 1});
      } else {
        options = whiskers.options({template: string,data: options.data});
        whiskers.loader(options,callback);
      }
    }

    whiskers.system_init(function () {
      execute();
    });
  }
}
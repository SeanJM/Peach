// ------------- Templating */
// Templating
// on develop
// Small Ideas
// The ctrl+7 key combination will bring up a menu allowing you to compile a template



// Big Ideas
// Allow people access to this tool somehow, so they can create templates online
// Don't store any of their data and offer it as a trully free service
// on production
var templit = {
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
    var styles =  '<style>'+
                    '.templit-error                   { font-family: Arial, Helvetica, Sans-serif;margin: auto; width: 500px; background: #ffffff; position: absolute; box-shadow: 0 3px 6px rgba(0,0,0,0.2); color: #3d3232; z-index: 99999}'+
                    '.templit-error-title             { color: #fff; padding: 2px 20px 0; margin: 0; line-height: 50px; font-size: 16px; background: #831118}'+
                    '.templit-error-message-container { padding: 20px 20px 20px; margin: 0; line-height: 20px; font-size: 13px;}'+
                    '.templit-error-content           { padding: 0px 20px 30px;}'+
                    '.templit-error-highlight         { font-weight: bold; background: #d3666c; padding: 0 5px;}'+
                    '.templit-error-subtitle          { font-size: 13px; line-height: 20px; margin: 0 0 10px 0;}'+
                    '.templit-error-message           { font-size: 13px;}'+
                    '.templit-error-code              { font-size: 12px; background: #d8d8d8; padding: 10px; border-radius: 10px;}'+
                    '.templit-error-example-text      { font-size: 13px; margin: 16px 0 0 0; }'+
                  '</style>';

    var window =  '<div class="templit-error">'+
                    '<div class="templit-error-title">{{error-code}}</div>'+
                    '{{if error-message <div class="templit-error-message-container">{{error-message}}</div> if}}'+
                    '<div class="templit-error-content">'+
                      '{{if error <h2 class="templit-error-subtitle">JSON:</h2><div class="templit-error-code">{{error}}</div> if}}'+
                      '{{if example <h2 class="templit-error-subtitle">Example:</h2><div class="templit-error-code">{{example}}</div> if}}'+
                      '{{if example-text <p class="templit-error-example-text">{{example-text}}</p> if}}'+
                    '</div>'+
                  '</div>';
    var data = {};
    if (options.code === 1) {
      data['error-code'] = 'JSON is missing <strong>"init"</strong> at root';
      data['error-message'] = 'Templit initializer requires a JSON object named <span class="templit-error-highlight">init</span>';
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
        return "<span class='templitError-highlight'>"+m+"</span>";
      });
      data['example'] = '{<span class="templitError-highlight">"'+options.templateName+'"</span>:'+JSON.stringify(options.data)+'}'
    } else if (options.code === 5) {
      data['error-code'] = 'Missing JSON Object';
      data['error-message'] = 'Templit initializer requires a JSON object';
      data['example'] = 'templit.init({\n\t"src": "templates/templates.html",\n\t"data": JSON\n},callback)';
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
        return "<span class='templitError-highlight'>"+m+"</span>";
      });
      data['example'] = '{<span class="templitError-highlight">"'+options.templateName+'"</span>:'+JSON.stringify(options.data)+'}'
    } else if (options.code === 9) {
      var regex = new RegExp(options.iterator,'ig');
      data['error-code'] = 'Iterator <strong>'+options.iterator+'</strong> does not exist'
      data['error-message'] = 'Check JSON for:'+options.iterator;
      data['error'] = JSON.stringify(options.data).replace(regex,function(m,key) {
        return "<span class='templitError-highlight'>"+m+"</span>";
      });
    }

    function execute() {
      var options   = templit.options({template: window,data: data});
      var processed = $(templit.it(options));
      $('head').append(styles);
      $('body').append(processed);
      processed.css('left',($('body').width()/2)-(processed.width()/2)+'px');
      processed.on('click',function () { processed.remove(); });
    }

    if (templit.debug) execute();

    return false;
  },
  each: function (options) {
    var template = options.template;
    // Each statement
    if (template.match(/{{(\s+|)each\s+(.*?)\s+each(\s+|)}}/)) {
      return template.replace(/({{(\s+|)each\s+(.*?)\s+each(\s+|)}})/g,function (m,key) {
        var template     = options.template;
        var data         = options.data;
        var out          = "";
        var group        = m.match(/{{(\s+|)each\s+([a-zA-Z0-9-]+)\s+do\s+([a-zA-Z0-9-]+)/);
        var iterator     = group[2];
        var templateName = group[3];

        if (data.hasOwnProperty(iterator)) {
          var html = [];
          for (var i=0;i<data[iterator].length;i++) {
            var index             = (i+1);
            var oddOrEven         = (i%2 === 0) ? 'odd' : 'even';
            var newData           = data[iterator][i];
            var isLast            = (i+1 === data[iterator].length) ? 'true' : 'false';
            var isFirst           = (i < 1) ? 'true' : 'false';
            newData['$index']     = index;
            newData['$oddOrEven'] = oddOrEven;
            newData['$isLast']    = isLast;
            newData['$isFirst']   = isFirst;

            var eachOptions   = {
              "$index"       : index,
              "$oddOrEven"   : oddOrEven,
              "$isLast"      : isLast,
              "$isFirst"     : isFirst,
              "templateName" : templateName,
              "template"     : templit.find(templateName),
              "data-context" : options["data-context"],
              "data"         : newData,
              "context"      : '',
              "url"          : options['url']
            }

            if (templit.debug) {
              eachOptions.template = '<!-- Template: '+options['url']+' >> '+templateName+' -->'+eachOptions.template;
            }

            html.push(templit.it(eachOptions));
          }
          out = html.join('');
        } else {
          templit.throwError({code: 9,iterator: iterator,data: options.data});
        }
        return out;
      });
    } else {
      return template;
    }
  },
  find: function (string) {
    var regex = new RegExp("<template\\s+"+string+">(.*?)</template>","i");
    var val = templit.template.match(regex);
    if (val === null) {
      templit.throwError({code: 7,templateName: string});
    }
    if (val) return val[1];
  },
  get: function (options) {
    var template = options.template;
    // Each statement
    if (template.match(/{{(\s+|)get\s+(.*?)\s+get(\s+|)}}/)) {
      return options.template.replace(/{{(\s+|)get\s+(.*?)\s+get(\s+|)}}/g,function (m,key) {
        var group = m.match(/{{(\s+|)get\s+(.*?)\s+get(\s+|)}}/);
        var out = [];
        var templateName = group[2].split(',');
        $.each(templateName,function (i,k) {
          var newOptions   = {
            "$index"       : "1",
            "$oddOrEven"   : "odd",
            "$isLast"      : "true",
            "$isFirst"     : "true",
            "templateName" : k,
            "template"     : templit.find(k),
            "data-context" : options["data-context"],
            "data"         : options["data"],
            "context"      : '',
            "url"          : options['url']
          }
          out.push(templit.it(newOptions));
        });
        return out.join('');
      });
    } else {
      return template;
    }
  },
  wrap: function (options) {
    if (options.template.match(/{{(\s+|)wrap\s+(.*?)\s+wrap(\s+|)}}/)) {
      console.log('wrap');
      return options.template.replace(/{{(\s+|)wrap\s+(.*?)\s+wrap(\s|)}}/g,function (m,key) {
        var group           = m.match(/{{(\s+|)wrap\s+([a-zA-Z0-9-]+)\s+(.*?)\s+wrap(\s|)}}/);
        var templateName    = group[2];
        var content         = group[3];
        var template        = templit.find(templateName).replace(/{{}}/g,content);
        var newOptions      = options;
        newOptions.template = template;
        return templit.it(newOptions);
      });
    }
    return options.template;
  },
  insert: function (options) {
    var template = options.template;
    var data     = options.data;

    if (typeof templit.dataFilter[options.templateName] === 'function') {
      data = templit.dataFilter[options.templateName](options);
    }

    return template.replace(/{{([\$a-zA-Z0-9-]+)}}/g,function (m,key) {
      var out = "";
      out = data.hasOwnProperty(key) ? data[key] :"";
      return out;
    });
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
      return execute();
    } else {
      return options.template;
    }
  },
  cereal: function (options) {
    if (options.template.match(/\[(.*?)\]\((.*?)\)/)) {
      return options.template.replace(/\[(.*?)\]\((.*?)\)/g,function (m,key) {
        var group = m.match(/\[(.*?)\]\((.*?)\)/);
        var arr   = group[1].split(',');
        var micro = group[2];
        var out   = [];
        $.each(arr,function (i,k) {
          var variables = {
            '$index':(i+1).toString(),
            '$name': k
          }
          var options = templit.options({data: variables,template: micro});
          out.push(templit.it(options));
        });
        return out.join('');
      });
    }
    return options.template;
  },
  templateAdd: function (string) {
    templit.template += string.replace(/(\r\n|\n|\r)/gm,'');
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
    function templateLoad (arr,index,callback) {
      $('<div/>').load(arr[index],function (d,k) {
        if (k === 'error') {
          templit.throwError({code: 2,file: arr[index]});
        } else {
          templit.templateAdd(d);
          templateLoad(arr,index+1,callback);
        }
        if ((index+1) === arr.length && typeof callback === 'function') {
          callback(out);
        }
      });
    }
    if (options.template.match(/#init\((.*?)\)/)) {
      out = options.template.replace(/#init\((.*?)\)/,function (m,key) {
        var templateFiles = cleanArray(m.match(/\((.*?)\)/)[1].split(','));
        templateLoad(templateFiles,0,callback);
        return '';
      });
    }
    return options.template;
  },
  removeComments: function (options) {
    return options.template.replace(/{{(.*?)\/\/(.*?)\/\/(.*?)}}/,function (m,key) {
      return m.replace(/\/\/(.*?)\/\//,'');
    });
  },
  it: function (options) {
    options.template = templit.removeComments(options);
    options.template = templit.cereal(options);
    options.template = templit.ifmatch(options);
    options.template = templit.wrap(options);
    options.template = templit.cmd_init(options);
    options.template = templit.get(options);
    options.template = templit.insert(options);
    options.template = templit.each(options);

    return options.template;
  },
  auto: function (url,data,callback) {
    // Get all template tags on page
    var deffereds = $('[template]').map(function (i) {
      var el           = $(this);
      var templateName = el.attr('template');
      var options      = {
        "$index"       : 1,
        "$oddOrEven"   : 'odd',
        "templateName" : templateName,
        "template"     : templit.find(templateName),
        "data-context" : data,
        "data"         : data[templateName],
        "context"      : el,
        "url"          : url
      }

      if (typeof options.template === 'undefined') {
        templit.throwError({code: 7,templateName: options.templateName,url: options.url});
      } else if (typeof data[templateName] === 'undefined' && options.template.match(/{{(.*?)}}/)) {
        templit.throwError({code: 5,templateName: templateName,data: data});
      }

      var processed = templit.it(options);

      if (templit.debug) {
        processed = '<!-- Template: '+url+' >> '+templateName+' -->\n'+processed;
      }

      el.html(processed);

    });

    // Perform Callback when all templating is done
    $.when.apply(null, deffereds.get()).then(function () {
      if (typeof callback === 'function') callback();
    });

  },
  loader: function (options,callback) {
    options.template = templit.ifmatch(options);
    options.template = templit.cereal(options);
    options.template = templit.cmd_init(options,function (template) {
      // Loaded all templates into templit.template;
      options.template = template;
      options.template = templit.it(options);
      $('body').prepend(options.template);
      if (typeof callback === 'function') callback();
    });
  },
  init:function (options,callback) {
    var frame     = $('template');
    var string    = frame.html().replace(/(\r\n|\n|\r)/gm,'');
    templit.debug = (typeof frame.attr('debug') === 'string');
    if (typeof options.data.init === 'undefined') {
      templit.throwError({code: 1})
    } else {
      options = templit.options({template: string,data: options.data});
      templit.loader(options,callback);
    }
  }
}
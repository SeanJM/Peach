whiskers._throwError = function (options) {
  var find = whiskers._find('whiskers-error-window');
  var window     = find.template;
  var data = {};

  data['templateName'] = options.templateName;
  data['file'] = options.file;

  if (options.code === 4) {
    data['error'] = JSON.stringify(options.data).replace(regex,function(m,key) {
      return "<span class='whiskersError-highlight'>"+m+"</span>";
    });
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
      return "<span class='whiskersError-highlight'>"+m+"</span>";
    });
    data['example'] = '{<span class="whiskersError-highlight">"'+options.templateName+'"</span>:'+JSON.stringify(options.data)+'}'
  }
  else if (options.code === 9) {
    var regex = new RegExp(options.iterator,'ig');
    data['error-code'] = 'Iterator <strong>'+options.iterator+'</strong> does not exist'
    data['error-message'] = 'Check JSON for:'+options.iterator;
    data['error'] = JSON.stringify(options.data).replace(regex,function(m,key) {
      return "<span class='whiskersError-highlight'>"+m+"</span>";
    });
  }
  else if (options.code === 10) {
    data['error-code']    = 'Templates are not defined'
    data['error-message'] = 'Make sure to attach templates to whiskers.init()';
    data['example']       = 'whiskers.init({\n\tdata: json,\n\ttemplates: ["./templates/template_header.html,./templates/template_body.html"],\n\tonload: script.init();\n});';
  }
  else if (options.code === 11) {
    data['error-code']    = 'Invalid if statement'
    data['error-message'] = 'Make sure if statement is properly formated';
    data['example']       = 'if variable|variable == true: \n\tmy other arguments\n /if';
  }

  function execute() {
    var options = whiskers.options({file: find.file,template: window,data: data});
    var out     = whiskers.it(options).template;
    $('body').append(out);
  }

  if (whiskers.debug) execute();

  return false;
}
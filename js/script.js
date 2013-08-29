var json = {
  "test":"This is some testing text",
  "test1":1,
  "test2":"test_2",
  "test3":"test_3",
  "test4":"test_4",
  "some": "Some, some ",
  "init": {
    "header":"header",
    "body":"body",
  },
  "nav":[{
    "name":"Home",
    "href":"#"
  },{
    "name":"About",
    "href":"#"
  },{
    "name":"Contact",
    "href":"#"
  }]
}

var script = {
  init: function () {
    console.log('LOADED');
  }
}

$(function () {
  whiskers.init({
    data: json,
    onload: function () { script.init(); }
  });
});
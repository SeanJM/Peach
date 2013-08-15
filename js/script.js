var json = {
  "test":"This is some testing text",
  "test2":"test2",
  "init": {
    "header":"header",
    "body":"body",
  },
  "nav":[{
    "name":"1",
    "href":"#"
  },{
    "name":"2",
    "href":"#"
  }]
}

$(function () {
  whiskers.init({
    data: json
  });
});
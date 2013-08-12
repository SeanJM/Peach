var json = {
  "init": {
    "header":"header",
    "body":"body",
  },
  "test":"[This is some testing data]",
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
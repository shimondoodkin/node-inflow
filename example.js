var http = require('http');
var app={libs:{}};
app.libs.inflow = require('./index');

function helloworld()
{
  this.shared.text_to_show='Hello World!';
  this.next();
};

function render()
{
 this.shared.res.writeHead(200, {'Content-Type': 'text/plain'});
 this.shared.res.end(this.shared.text_to_show);     
 this.next();
};

function surprise(name)
{
 var self=this;  var shared=this.shared; var req=shared.req; // some shorcuts
 if(!app.libs.fs)app.libs.fs=require('fs'); // dependency injection, here just for the sake of loading something
 shared.text_to_show='Surprise ' + name ;
 setTimeout(function() {
  self.next();
 } , Math.ceil(Math.random()*5)*1000 ) ;
};

http.createServer(function (req, res)
{
 var shared={ 'req':req, 'res':res , 'app':app, 'libs':app.libs }; // an object which hold all the variables related to a specific request.
 if(req.url.indexOf("surprise")!=-1)
  app.libs.inflow.flow(shared,[      [surprise,["it can have arguments"]]      , render ]);
 else
  app.libs.inflow.flow(shared,[ helloworld , render ]);
}).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');

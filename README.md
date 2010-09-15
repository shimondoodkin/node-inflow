# node-inflow
  a simple "Step" library with a *shared* object.
  designed with the user and debugging in mind.

* no more complicated closures
* the sharted object simplifies everything with async calls.
* functions can have argunets
* with this library I could reinvented the way I use an http server
* simplifies the application structure

your application is composed from small parts
each part must have a standard structure to allow integration between all the parts

## anatomy of a standart function
    function part(argument1,...)
    {
     this.next(return_value); // a function to call to as a callback, return value only useful in paralel
     this.shared // a shared object between all the calls in a flow
     this.shared.libs //  dependency injection (a shared object that holds all the libraries)
     
     //and also:
     this.shared.app // also you can give access to other global shared objects
     this.steps; // array of all function (it is posible to push to it a new next step)
     this.step; // current step (for information);
    };


## example:
    var http = require('http');
    var app={libs:{}};
    app.libs.inflow = require('node-inflow');
    
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
     if(req.url.indexOf("surprise"))
      app.libs.inflow.flow(shared,[      [surprise,["it can have arguments"]]      , render ]);
     else
      app.libs.inflow.flow(shared,[ helloworld , render ]);
    }).listen(8124);
    
    console.log('Server running at http://127.0.0.1:8124/');


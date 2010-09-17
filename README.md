# node-inflow
A next generation async control-flow library,
with a shared object for called functions
and debugging made easy.
  
designed with usege in mind
and debugging in mind.

## why use it
* no more complicated closures
* the shared object simplifies everything with async calls.
* functions can have argunets
* with this library I could reinvented the way I use an http server
* it simplified my  application structure
* no need to pass req, res as seperate arguments, just one simple shared object.
* i used to store temporary variables of the request in the req object but now i store them in the shared object.
* now i use a common library object that contains varius useful function   

## how to install
simply download it:
    git clone https://shimondoodkin@github.com/shimondoodkin/node-inflow.git


##How to use it
    var inflow = require('node-inflow'); // require it
    inflow.flow(shared_object,[function,nextfunction,[otherfunction,[function_argument]])
    inflow.paralel(shared_object,[function,nextfunction,[otherfunction,[function_argument]],done_function);

## idea
each function composed from a function it self and a next() call as a return value.
your application is composed from small parts each part must have a standard structure to allow integration between all the parts.

## anatomy of a standard function
    function part(argument1,...)
    {
     this.next(return_value); // a function to call to as a callback, the return value only useful in paralel
     this.shared // a shared object between all the calls in a flow
     this.shared.libs //  dependency injection (a shared object that holds all the libraries)
     
     //and also:
     this.shared.app // also you can give access to other global shared objects
     this.steps; // array of all function (it is posible to push to it a new next step)
     this.flow; // inflow.flow shortcut
     this.paralel; // inflow.paralel shortcut
     //also you can do:
     this(); or this.next(); //thouse are the same.
    };


## example:
    var http = require('http');
    var app={libs:{}};
    var app.libs.inflow = require('node-inflow');
    var inflow = app.libs.inflow.flow; // optional
    var inparallel = app.libs.inflow.parallel; // optional
    
    http.createServer(function (req, res)  {
     var shared = { 
                          'req':req, 
                          'res':res, 
                          'app':app, 
                          'libs':app.libs
                  };
                        
     if(req.url.indexOf("surprise")!=-1)
       inflow(shared,[
                      [surprise, ["it can have arguments"]]
                     ,
                      render
                     ]);
     else
       inflow(shared, [ helloworld , render ]);
        
    }).listen(8124);
    
    function helloworld() {
      this.shared.text_to_show='Hello World!';
      this.next();
    };
    
    function render()  {
      with(this.shared) // you can use it with a with statment   
         res.writeHead(200, {'Content-Type': 'text/plain'}), 
         res.end(this.shared.text_to_show);     
      this.next();
    };
    
    function surprise(name) {
     var shared=this.shared; var req=shared.req; // you can use it with some shortcut varibales 
     if(!app.libs.fs)app.libs.fs=require('fs'); // dependency injection, here just for the sake of loading something
     shared.text_to_show='Surprise ' + name ;
     
     var self=this; // save the this for later usage.
     setTimeout(function() {
      self.next();
     } , Math.ceil(Math.random()*5)*1000 ) ;
    };
        
    console.log('Server running at http://127.0.0.1:8124/');

## methods:

###  function flow(shared,steps[,debug])
calls one step function after an other.

###  function paralel(shared,steps,callback[,debug])
calls all the steps functions and when all done it calls the callback function.
    process.nextTick(function (){ afunction.call(thisobject,arguments_if_any);});




##thanks to:
Stagas - for help in enhancing examples in this readme.
Creationix - i used his concept for this library.


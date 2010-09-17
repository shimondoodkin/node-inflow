# Node-Inflow
A next generation async control-flow library,
with a shared object for called functions
and debugging made easy.
  
Designed with user in mind
and debugging in mind.

## Why use it
* No more complicated closures
* The shared object simplifies everything with async calls.
* Functions can have argunets
* With this library I could reinvented the way I use an http server
* It simplified my  application structure
* No need to pass req, res as seperate arguments, just one simple shared object.
* I used to store temporary variables of the request in the req object but now i store them in the shared object.
* Now I can use a common library object that contains useful function that can be called asychroniusly.

## How to install
Simply download it:
    git clone https://shimondoodkin@github.com/shimondoodkin/node-inflow.git

##How to use it
    var inflow = require('node-inflow'); // require it
    inflow.flow(shared_object,[function,nextfunction,[otherfunction,[function_argument]])
    inflow.paralel(shared_object,[function,nextfunction,[otherfunction,[function_argument]],done_function);

## Idea
Your application is composed from small parts
To allow integration between all the parts.
Each part must have a standard structure.
Each function is a part composed from:
* a function it self 
* and a next() call as a return value.

## Anatomy of a standard function
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


## Example:
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

## Methods:

###  function flow(shared,steps[,debug])
calls one step function after an other.

###  function paralel(shared,steps,callback[,debug])
calls all the steps functions and when all done it calls the callback function.
    process.nextTick(function (){ afunction.call(thisobject,arguments_if_any);});




##thanks to:

Creationix - I used his concept for this library.

Stagas - For help in enhancing examples in this readme.



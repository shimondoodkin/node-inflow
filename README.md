# Node-Inflow
A next generation async control-flow library, with a shared object for called functions and debugging made easy.

Designed with user in mind and debugging in mind.

## Why use it

No more complicated closures

* The shared object simplifies everything with async calls.

Functions can have arguments

* Now I can use a common library object that contains useful function that can be called asynchronously.
* It simplified my application structure

With this library I could reinvented the way I use an http server

* No need to pass req, res as separate arguments, just one simple shared object.
* I used to store temporary variables of the request in the req object but now i store them in the shared object.


## How to install
Simply download it:
    git clone https://shimondoodkin@github.com/shimondoodkin/node-inflow.git

## How to use it
    var inflow = require('node-inflow'); // require it
    inflow.flow(shared_object,[afunction,nextfunction,[otherfunction,[function_argument]])
    inflow.parallel(shared_object,[afunction,nextfunction,[otherfunction,[function_argument]],done_function);

We usually call function from an object,
for example in a website we have several pages (objects).
pages can share functions between them. for example:

    inflow.flow(shared,
    [
     [app.pages.index.checklogin,[{login_reqired:false}]],
     app.pages.loaduserdata,
     app.common.rander
    ])
    
## Available inside a function:

    function part(argument1,...)
    {
     this.next(return_value); // a function to call at the end of the part;
     this.shared // a shared object between all the calls in a flow
     this.shared.libs // idea how to do dependency injection (a shared object that holds all the libraries)
     
     //and also:
     this.shared.app // also you can give access to other global shared objects
     this.steps; // array of all function (it is possible to push to it a new next step)
     this.flow; // inflow.flow shortcut
     this.parallel; // inflow.parallel shortcut
     this.args //arguments of previously called next(arg1,arg2) function in sequential flow
     this.results //arguments of all called next(arg1,arg2) functions in parallel
     
     //also you can do:
     this(); or this.next(); //those are the same.
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
      with(this.shared) // you can use it with a with statement   
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

### function flow(shared,steps[,debug])

calls each step functions one after an other.

also available inside the called function:

    this.args //arguments of previusly called next function

(advanced staff:) you may push a next step into the end of steps array:

    this.steps.push(some_function);
    this.steps.push([some_function,[arg1,arg2]]); // with arguments

###function parallel(shared,steps,callback[,debug])

calls all the steps functions and when all done it calls the callback function.

    process.nextTick(function (){ afunction.call(thisobject,arguments_if_any);});
    
also available inside the callback function:

    this.results // array of all next arguments

calls all the steps functions and when all done it calls the callback function.

    process.nextTick(function (){ afunction.call(thisobject,arguments_if_any);});
    
also available inside the callback function:

    this.results // array of all next arguments

###function each(shared,items,each_function,callback [,debug])

each_function: (as in Array.forEach callback)

    inflow.each(
    shared,
    items,
    function (value,key,array){;this();},
    callback 
    [,debug]);
  
example:

    app.inflow.each(shared,[
     {phone:'111111111234',name:'Simon'},
     {phone:'222222221234',name:'Avi'}
    ],function (val){
     shared.res.write(val.phone+" - "+val.name+"\r\n");
     this();
    },function (){
     shared.res.end('done');
    });

output:

    111111111234 - Simon
    222222221234 - Avi
    done

##Thanks to:

Creationix - I used his concept for this library.

Stagas - For help in enhancing examples in this readme.

## The Idea

The intended day to day usage is as described above in How to use.
Unintentionly it is generalized into fubjs thing:

Your application is composed from small parts To allow integration between all the parts.
Each part must have a standard structure.

Each function is a part composed from: 

 a function it self and

 a next() call as a return value.

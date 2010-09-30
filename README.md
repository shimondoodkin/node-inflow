# Node-Inflow
A next generation async control-flow library, with a shared object for called functions and debugging made easy.

Designed with user in mind and debugging in mind.

## Why use it

The problem is that you have to carray the Request and Response,
all the way, through the callbcacks and non-callbacks...
just to be able to do Response.write() and Response.end() at the end.
all the other simple functions dons't need request and response. 

in a large program you could loose the response variable somewhere,
while doing the folowing in every single small or large sync or async function call:

    function (error,data,req,res)
    {
     (function (error,data,req,ras) 
     {
      (function (error,data,req,res)
      {
       res.end('finally done');
      })(error,data,req,res);
     })(error,data,req,res);
    }
    // see if you can spot a typo in the code above.


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
    git clone https://github.com/shimondoodkin/node-inflow.git

## How to use it
    var inflow = require('node-inflow'); // require it
    inflow.flow(shared_object,[afunction,nextfunction,[otherfunction,[function_argument]])
    inflow.parallel(shared_object,[afunction,nextfunction,[otherfunction,[function_argument]],done_function);
    inflow.each(shared_object,array_or_object,foreach_function(key,value,array),done_function);

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
     
     //and also:
     this.shared.lib // idea how to do dependency injection (a shared object that holds all the libraries)
     this.shared.app // also you can give access to other global shared objects
     
     this.steps;  // array of all function (it is possible to push to it a new next step)
     
     this.flow; // inflow.flow shortcut
     this.parallel; // inflow.parallel shortcut
     this.each; // inflow.each shortcut
     this.while; // inflow.each shortcut
     
     this.args //arguments of previously called next(arg1,arg2) function in sequential flow
     this.results //arguments of all called next(arg1,arg2) functions in parallel
     
     this.key   //availible in a for_each_function, in inflow.each
     this.value //
     this.items //
     
     return this.continue() //availible in a while_function, in inflow.while, this.continue=this.next
     return this.break()    //availible in a while_function, in inflow.while, call the callback and finish the loop.
     
     //also you can do:
     this(); or this.next(); //those are the same.
    };
    
## Example:
  
    var http = require('http');
    var app={lib:{}};
    var app.lib.inflow = require('node-inflow');
    var inflow = app.lib.inflow.flow; // optional
    var inparallel = app.lib.inflow.parallel; // optional
    
    http.createServer(function (req, res)  {
     var shared = { 
                          'req':req, 
                          'res':res, 
                          'app':app, 
                          'lib':app.lib
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
      {
         res.writeHead(200, {'Content-Type': 'text/plain'}); 
         res.end(this.shared.text_to_show);
      }
      this.next();
    };
        
    function surprise(name) {
     //i prefer to define what i will use:

     var shared=this.shared,
         req=shared.req,
         app=shared.app;
     
     shared.text_to_show='Surprise ' + name ;

     var self=this; // save the "this" for later usage.
     setTimeout(function() {
      self.next();
     } , Math.ceil(Math.random()*5)*1000 ) ;
     
     // dependency injection example: // (it is here just for demonstartion)
     //
     //var lib=shared.lib;
     //if(!lib.fs)lib.fs=require('fs'); 
     //fs.stat('/tmp/myfile',...);
    };
    
    console.log('Server running at http://127.0.0.1:8124/');

## Methods:

### function flow(shared,steps [,debug])

calls each step functions one after an other.

the steps variable can contain an array.
each item in this array can be a function.
to add arguments to a function.
an item can contain an array as folows: [a_function, array_of_arrguments] .

also available inside the called function:

    this.args //arguments of previusly called next function

(advanced staff:) you may push a next step into the end of steps array:

    this.steps.push(some_function);
    this.steps.push([some_function,[arg1,arg2]]); // with arguments

###function parallel(shared,steps[,callback] [,debug])

calls all the steps functions and when all done it calls the callback function.

    process.nextTick(function (){ afunction.call(thisobject,arguments_if_any);});
    
also available inside the callback function:

    this.results // array of all next arguments

calls all the steps functions and when all done it calls the callback function.

    process.nextTick(function (){ afunction.call(thisobject,arguments_if_any);});
    
also available inside the callback function:

    this.results // array of all next arguments

###function each(shared,items,each_function[,callback] [,debug])

 a for each function, it can have an object as input for items

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

/*
 it seems to me that the shared object in forEach and in while is use less.
 tell me what you think.
*/

### function while(shared,loop_function[,callback] [,debug])
async while with a shared object,
the way you use this while is this, this while is basicaly while(true) and, you break and it with a break statment.
you can define the position of while condition, where you want it to be: at the begining or at the end. there you put a break statment.
you should **use return**, when you call this.continue() or this.break() , otherwise it might **recurse back** to the function.

additionaly in while you have:
    this.break()=call_the_Callback,
and
    this.continue()=this.next();



Async While - while with break at the begining:  

    inflow.while({},function(){  
     if(!( while_condition )) return this.break();
     
     // code here
     if(break_condition    ) return this.break();
     if(continue_condition ) return this.continue(); // this.continue=this.next, must use **return**, to exit the function;
     // code here
 
     this.next();
    },
    function(){
     console.log('// after while code here');
    });
   
Async Do-While - while with break at the end:
  
    inflow.while({},function(){
     // code here
     if(!( while_condition )) return this.break();
     this.next();
    },
    function(){
     console.log('// after while code here');
    });
   
While example inside a callback:
    var n=0;
    inflow.while({},function(){
     if(!( n<100 )) return self.break();
     console.log('// code here');
     n++;
     var self=this;
     setTimeout(
     function(){
       console.log('// inner code here');
       self.next();
     },1000);
    
    },
    function(){
     console.log('// after while code here');
    });

**bonus:** DIY toy Async While:

    function callback()
    {
     console.log('done');
    }
    var i=1;
    function whileloop(){
     if(!(i<10)) return callback(); 
     // code here
     console.log("foo ");
     i++;
     return process.nextTick(function(){whileloop();});
    }

## How do we use node-inflow:

a controllers in our program are objects with functions and a main function.
node-inflow enabels us to seperate the main function to simple steps.

    var page={
     load_user:function () { // task 1
      //
      var shared=this.shared,app=shared.app,req=shared.req;
      shared.user=app.models.getone({id:req.parsedurl.query.id});//{name:'someone',...}
      this();
     }
     set_name:function () { // task 2
      //
      var shared=this.shared;
      shared.name=(shared.user.name||"")+' is awsome'
      this();
     }
     
     mytempalte:app.templates.load('views/atemplate.html'), // some template
     
     main:function (shared){ // main function
      var page=shared.page;
      var common=shared.app.pages.common;
      shared.view=page.my_template;
      app.inflow.flow( shared, [page.load_user, page.set_name, common.render] ); // step though the tasks
     }
     
    }
    
    // * our main functions not yet called by node-inflow, node-inflow is fresh, i'll convert to it later

reference functions:

    page.my_template=function (vars,callback)  // app.templates.load('views/atemplate.html')
    {
      echo='hello '+vars.name;
      if(callback)callback(echo);else return echo;
    },
     
    //a simplified function like the function that calls main. (just for reference)
    app.route = function ()
    {
     // if route matches:
     //{
     shared.page=matched_page;
     matched_page.main.call(matched_page,shared,app);
     //}
    }
       
    common.render = function () {
     var shared = this.shared;
     var page = shared.page;
     var res = shared.res;
     shared.header = (shared.header ? shared.header : {'Content-Type': 'text/html'});
     shared.view.call(page, shared, function (echo) {
      res.writeHead(200, shared.header);
      res.write(echo);
      res.end();
     });
    };


* also i have used inflow.each to implement sending message to a list.

    
    
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

 a next() , call next() as a return value.

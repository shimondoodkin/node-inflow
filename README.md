#Node-inflow

Node-inflow is a utility module which provides essential async control-flow functions for working with asynchronous JavaScript.


The new idea here is to use a shared object for called functions. The debugging made easy. Also I tried to use known function names for the known functionalities.

It is designed with user in mind and with experience.

* [How to install](#install)
* Methods
  * [flow](#flow) * featured function *
  * [parallel](#parallel)
  * [each](#each) * featured function *
  * [while](#while)
  * [if](#if)
  * [recursion](#recursion) * featured example *
* [Short examples for all functions](#short)
* [Notes](#notes)

<a name="install" />

## How to install
Simply download it:
    git clone https://github.com/shimondoodkin/node-inflow.git

## Methods:

<a name="flow" />

#### serial([shared], steps [,interval] [,debug])

__Alias:__  Step 

__Alias:__  step

__Alias:__  seq 

__Alias:__  flow

Sequential async execution of functions.

 * Description of arguments:
   * shared    - It is an object that is shared between all function as this.shared, It is optional
   * steps      - It is an array of functions to call one after another
   * callback  - A function to call after all functions in steps are finished (each called this.next())  It is optional. *Is not developed yet
   * interval    - It is a number, repeat the sequence after this setTimeout()  It is optional. * It is not developed yet
   * debug     - A boolean to show traces of calls to this.next() function in console.log, It is optional.

 * Examples:

       var inflow = require('node-inflow');
example1:
       inflow.flow([
         function(){console.log("1");this.next();},
         function(){console.log("2");this.next();}
       ]);
example2:
       var shared={req:req,res:res};
       inflow.flow(
        shared,
        [
         function(){this.shared.myvar=1;this.next();}
         ,
         function()
         {
          var shared=this.shared;
          var res=shared.res;
          res.writeHeaders([{'content-type':'text/html;charset=utf-8'}]);
          res.end(shared.myvar);
          this.next();
         }
       ]);
example3:
       inflow.flow([
         function(){console.log("1");this.next();},
         function(){console.log("2");this.next();}
       ],true); // with debug info in the console
 
 * More info:
   * [[Arguments of a callback as an array structure]]
   * [["this" of a called function]]
   * More about: [[method flow]]
   * More examples:
     * [[How to use it with a library of functions]]
     * [[Example Application]]
     * [[How do we use node-inflow]]

<a name="parallel" />

#### parallel([shared],steps [,chunksize] [,callback] [,debug])

Parallel async execution of functions.

 * Description of arguments:
   * shared      - It is an object that is shared between all function as this.shared, it is optional
   * steps        - It is an array of functions to call in parallel
   * chunksize -  It is a number, it limits the maximum amount of functions executed in one time.  It is optional. * It is not developed yet
   * callback    - A function to call after all functions in steps are finished (each called this.next())
   * debug       - A boolean to show traces of calls to this.next() function in console.log, It is optional.

         inflow.parallel(shared,
         [
          function(){  console.log("wait 1000"); setTimeout(this.next,1000); },
          function(){  console.log("wait 1500"); setTimeout(this.next,1500); }
         ] ,
         function(){  console.log("both function waited during the same period of time"); }
         );

* More about: [[parallel]]

<a name="each" />

#### each([shared,]items,each_function [,callback] [,debug])

__Alias:__ forEach

__Alias:__ foreach

__Alias:__ map

It is an Async forEach implementation. It calls the each_function once for each item in items.



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

 * Description of arguments:
   * shared            - It is an object that is shared between all function as this.shared, It is optional
   * items              - It is an array or object of items to iterate through
   * each_function  - function(value,key,items){ codehere; this.next();} A function to be executed for each item.
   * callback          - A function to call when done doing for-each.
   * debug             - A boolean to show traces of calls to this.next() function in console.log, It is optional.
* More about [[each]]

<a name="while" />

#### while(shared, loop_function [,callback] [,debug])

In while you have:
    this.break()=call_the_Callback,
    this.continue()=this.next();

Example:
  
    inflow.while({},function(){
     // code here
     if(!( while_condition )) return this.break();
     this.next();
    },
    function(){
     console.log('// after while code here');
    });
  * More about [[while]]


<a name="if" />

#### if(condition,iftrue,iffalse)

The if function is a conditional function call function.
If the condition function is used then call in the condition function this.next(true/false);
The iftrue function or iffalse function is executed with the same shared object as the if function was called.

 * Description of arguments:
   * condition  - A boolean or a an async function.
   * iftrue  - A function to call if the result is true
   * iffalse - A function to call if the result is false

      inflow.flow(shared,
      [
       function(){  console.log("wait 1000"); setTimeout(this.next,1000); },
       inflow.if(
           function(){ this.next(Math.random()>0.5); },
           function(){  console.log("wait 1000"); setTimeout(this.next,1000); }
           ,
           function(){  console.log("wait 1500"); setTimeout(this.next,1500); }
       )
      ] ,
      function(){  console.log("random choice of period of time with async if"); }
      );


<a name="recursion" />

**Recursion **

To do async recursion you do not need async control flow library it is already async ready.
But you have to hold state, You do it by adding a shared object at the end of arguments.
When calling the recursive function it is easy to copy the the name of the function and the arguments as is from function definition line to the place of calling the callback.

    function print_file_contents_n_times(filename_arg1,times_to_read,callback,shared)
    {
     if(!shared)shared={i:times_to_read};
     if(shared.i>0)
     {
      fs.readFile(filename, "binary", function(err, file) {  
         shared.i--;
         print_file_contents_n_times(filename_arg1,times_to_read,shared);
      }
     }
     else
     {
      callback();
     }
    }

<a name="short" />

**Short examples for all functions:**

    var inflow = require('node-inflow'); // require it
    inflow.flow(shared_object,[myfunction1,myfunction2,[myfunction3,[myfunction3_arg1,myfunction3_arg2]])
    inflow.parallel(shared_object,[myfunction1,myfunction2,[myfunction3,[myfunction3_arg1,myfunction3_arg2]],done_function);
    inflow.each(shared_object,array_or_object,foreach_function(value,key,array),done_function);
    inflow.while(shared,loop_function,done_function)


<a name="notes" />

**Notes**

* [[About node-inflow]]
* [[Why use this async flow library]]


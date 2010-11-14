
// common debug problems i had with other steps libraries:
// 1 next callback did not called.
// 2 next callback called too mutch / too soon / callback split /  double call to same next(), so the final function called when the work is not done yet. 

// see cool reference http://github.com/caolan/async/blob/master/test/test-async.js

var report_uncalled_callbeck_after=0; //doe not works yet 1500 ;// ms , set to 0 to disable

function debug_trace(message) // i usualy remember to turn debug variable off, it wastes cpu on excaptions
{
 try{ throw (new Error('Trace: node-inflow,'+message)); }
 catch(e){var stack=e.stack;}
 return stack;
 //console.log(stack);
}


var self=this;

function add_shortcuts(next)
{
 // aliases for next
 next.next=next;
 next.continue=next; 
 next.return=next; 

 next.flow=self.flow;
  //aliases
  next.seq=self.flow;
  next.step=self.flow;
  next.Step=self.flow;
  next.serial=self.flow;
 next.parallel=self.parallel;
 next.each=self.each;
 //aliases
  next.foreach=self.each;
  next.forEach=self.each;
 next.while=self.while;
 next.if=self.if;
}

function callfunc(func_t,args,next)
{
 if(func_t)
 {
  next.args=args;
  if(typeof func_t==='object' && func_t instanceof  Array)
   func_t[0].apply(next, func_t[1]);
  else if(args && typeof args==='object' && args!==null && args.length>0)
   func_t.apply(next,args);
  else
   func_t.call(next);
 }
}

// one simple function 
function flow(shared,steps,debug,   currentstep,args,called)
{
 if(arguments.length==2) // shared,steps  or steps,debug , lets test it and find out witch one is it
 {
  if(typeof steps=='boolean')
  {
   debug=steps;
   steps=shared;
   shared={};
  }
  else
  {
   // shared=shared
   // steps=steps
   debug = false;
  }
 }
 if(arguments.length==1) // steps 
 {
  steps=shared;
  shared={};
  debug = false;
 }
 
 if(!steps)steps=[];
 
 if(!currentstep) currentstep=0;
 if(debug){ if(steps.timeout) clearTimeout(steps.timeout); if(!called) called=[]; }
 if(currentstep>=steps.length)
 {
   return;
 }
 if(debug)  console.log(debug_trace(currentstep));

 var next = function(){
                       flow(shared,steps,debug,currentstep+1,arguments,called);
                       if(debug) {
                        if(called[currentstep]) console.log(debug_trace(' called more then once '));
                        called[currentstep]=true;
                        if(report_uncalled_callbeck_after!=0)
                        {
                         var text=debug_trace('callback did not called at step: '+currentstep);
                         steps.timeout=setTimeout(function () {console.log(text);}, report_uncalled_callbeck_after );
                        }
                       }
                      };
 add_shortcuts(next);
 next.shared=shared;
 next.steps=steps;
 next.step=currentstep;
 callfunc(steps[currentstep],args,next);

} this.flow=flow;

function funcif(condition,iftrue,iffalse)
{
 if(typeof condition=='boolean')
 {
  return condition?iftrue:iffalse;
 }
 else
 {
  return function ()
  {
   var saved_next=this;
   var saved_args=arguments;
  
   var next=function(result)
   {
    if(result)
    {
     callfunc(iftrue,saved_args,saved_next);
    }
    else
    {
     callfunc(iffalse,saved_args,saved_next);
    }
   };
   add_shortcuts(next);
   next.shared=saved_next.shared;
   callfunc(condition,null,next);
  }// end returned function
 }
}this.if=funcif;

function is_argfunction(f)
{
 if(f===null) return true;
 if(f===undefined) return true;
 if(typeof f=='function') return true;
 if(typeof f=='object' && f instanceof Array && f.length>0 &&
  (
   typeof f[0]=='function' &&
   (
    f.length==1
    ||
    f.length==2 &&
    (
     f[1]===undefined
     ||
     f[1]===null
     ||
     typeof f[1]=='object' && f[1] instanceof Array
    )
   )
  )
 ) return true;
 return false; 
}this.is_argfunction=is_argfunction;

function parallel(shared,steps,callback,debug,   currentstep,args)
{
 if(arguments.length==3) // shared,steps,callback,  or steps,callback,debug, , lets test it and find out witch one is it
 {
  if(typeof callback==='boolean') // test for steps,callback,debug,
  {
   debug=callback;
   callback=steps;
   steps=shared;
   shared={};
  }
 }
 if(arguments.length==2) // shared[any object],steps[object or array],  // correct 1
                        //  steps[object or array],callback[array or function],  // correct2
                        //  steps[object or array],debug[boolean] - by misstake
 {
  if(typeof steps==='boolean') //misstake
  {
   debug=steps;
   steps=shared;
   shared={};
  }
  else if((typeof shared==='object' && !(shared instanceof Array)) && (typeof steps==='object' && (steps instanceof Array) )) // correct 1 paritialy
  {
   //shared=shared;
   //steps=steps;
  }
  else if( (typeof shared==='object' && (shared instanceof Array) && is_argfunction(steps) )) // correct 2 paritialy
  {
   steps=shared;
   callback=steps;
   shared={};
  }
  else
  {
   // error
   steps=shared;
   callback=steps;
  }
  steps=shared;
  shared={};
 }
 if(arguments.length==1) // steps 
 {
  steps=shared;
  shared={};
 }
 
 var callback_count=0;
 var status=[];
 var results=[];
 var timeout=false;
 function gonext(i,result)
 {
  
  if(i!==false)
  {
   if(status[i])
   {
    if(debug)
    {
     console.log(debug_trace(' called more then once '));
     return;
    } 
   }
   callback_count++; 
   status[i]=true;
   results[i]=result;
  }

  if( callback_count == steps.length  )
  {
   var next= function(result){ }; // this inside gonext so this does nothing
   add_shortcuts(next);
   next.shared=shared;
   next.steps=steps;
   next.step=i;
   next.results=results;
   if(callback)
   {
    if(typeof callback==='object' && callback instanceof  Array)
     callback[0].apply(next, callback[1]);
    else
     callback.call(next,results);
   }
   if(timeout)clearTimeout(timeout);//of debug
  }
 }
 if(!steps)
 {
  steps=[];
  gonext(false,[]);
 }
 else if(steps.length==0)
 {
  gonext(false,[]);
 }
 else
 {
 for(var i=0;i<steps.length;i++)
 {
  var next= function(result){ gonext(i,result); };
  add_shortcuts(next);
  next.shared=shared;
  next.steps=steps;
  next.step=i;
  next.args=[];

  if(typeof steps[currentstep]==='object' && steps[currentstep] instanceof  Array)
  {
   var afunction=steps[i];
   process.nextTick(function (){
    afunction[0].apply( next,afunction[1] );
   });
  }
  else
  {
   var afunction=steps[i];
   process.nextTick(function (){
    afunction.call( next );
   });
  }
 } 
 }
 if(debug)
 {
  if(report_uncalled_callbeck_after!=0)
  {
   var text=debug_trace(' parallel callback call status: '+status.join(','));
   timeout=setTimeout(function () {consle.log(text)}, report_uncalled_callbeck_after );
  }
 }
} this.parallel=parallel;

function each(shared,steps,each_function,callback,debug,   currentstep,args,
  //results,
  keys,called,timer)
{
 if(arguments.length==2) // could be just : steps,each_function
 {
  each_function=steps;
  steps=shared;
  shared={};
 }
 
 if(arguments.length==3) // steps,each_function,callback,  or shared,steps,each_function, steps,each_function,debug, lets test it and find out witch one is it
 {
  if(typeof each_function=='boolean') // test for steps,callback,debug,
  {
   debug=each_function;
   each_function=steps;
   steps=shared;
   shared={};
  }
  else if(typeof each_function=='function') // shared,steps,each_function,
  {
   //each_function=each_function;
   //steps=steps;
   //shared=shared;
  }
  else if(typeof steps=='function') // shared,steps,each_function,
  {
   each_function=steps;
   steps=shared;
   shared={};
  }
  else if(typeof steps=='object' && steps instanceof Array && (!is_argfunction(steps)) ) // shared,steps!function,each_function,
  {
   //is_argfunction(each_function) // probably = true
   //each_function=each_function;
   //steps=steps;
   //shared=shared;
  }
  else if(typeof steps=='object' && steps instanceof Array && (!is_argfunction(steps)) ) // shared,steps!function,each_function,
  { 
   //is_argfunction(each_function) // probably = true
   //each_function=each_function;
   //steps=steps;
   //shared=shared;
  }
  else
  {
   //shared,steps,each_function,
  }
  
  
 }
 
 if(!steps)steps=[];
 //console.log(require('sys').inspect(steps));
 if(keys===undefined)
 {
  if(typeof steps[currentstep]==='object' && steps[currentstep] instanceof  Array)
  {
   keys=false;
  }
  else
  {
   keys=[];
   for(key in steps)
    if(steps.hasOwnProperty(key))
     keys.push(key);
  }
 }


 if(arguments.length==4){ debug = false;}
 
 if(!currentstep) currentstep=0;
 //if(!results) results=[];
 if(debug){ if(!timer)timer={}; if(!called) called=[]; }
 
 if(currentstep>=(keys?keys.length:steps.length))
 {
  process.nextTick(function()
  {
   if(debug)  console.log(debug_trace("CALLBACK")); 
   
   var next= function(result){ }; // does nothing, its a last one
   add_shortcuts(next);
   next.shared=shared;
   next.steps=steps;
   next.step=currentstep;
   //next.results=results;
   callfunc(callback,args,next);
  });
  return;
 }
 
 var key=keys?keys[currentstep]:currentstep;
 
 if(debug)  console.log(debug_trace(key));


  var next = function(){
  
    
                        var key=keys?keys[currentstep]:currentstep;
                        if(debug)if(timer.timeout) clearTimeout(timer.timeout); 
                        //results[key]=arguments;// generally unrequired could be done with clousure
                        each(shared,steps,each_function,callback,debug,   currentstep+1,arguments,
                        //results,
                        keys,called,timer);
                        if(debug) {
                         if(called[currentstep]) console.log(debug_trace(' called more then once '));
                         called[currentstep]=true;
                         if(report_uncalled_callbeck_after!=0)
                         {
                          var text=debug_trace('callback did not called at step: '+currentstep);
                          timer.timeout=setTimeout(function () {console.log(text)}, report_uncalled_callbeck_after );
                         }
                        }
                       };
  add_shortcuts(next);
  next.shared=shared;
  next.steps=steps;
  next.step=currentstep;
  next.args=args;

  next.keys=keys;
  next.key=key;
  next.value=steps[key];  
  if(typeof each_function==='object' && each_function instanceof  Array)
   each_function[0].apply(next, callback[1]);
  else
   each_function.call(next,next.value,key,steps);

} this.each=each;

//
// verbose example with continue and break:
//
// inflow.while(function(){
//  if(whilecondition)
//  {
//   // code here
//   this.continue();return; // this.continue=this.next, must use **return**, to exit function;
//   // more code here
//   this.next();return;
//  }   
//  else
//  {
//   this.break();return; // this is a break, it calles the callback
//  }
// },
// function(){
//  // after loop code here
// });
//

//
// inflow.while(function()
//  {
//   if(whilecondition)
//   {
//    // code here
//    this.next();return;
//   }
//   else {this.break()return;};
//  },function(){
//  // after loop code here
// });
//

function loopwhile(shared,loop_function,callback,debug,  args,timer,currentstep,firstcalltrace)
{
 if(debug){ if(!timer)timer={}; }
 if(!currentstep) currentstep=0; // debug
 if(debug)  console.log(debug_trace(currentstep));
 if(report_uncalled_callbeck_after!=0)
  if(debug&&!firstcalltrace)  firstcalltrace=debug_trace("while - First call trace");
 if(!firstcalltrace) currentstep=true; // debug
 var next = function(){
                        if(debug)if(timer.timeout) clearTimeout(timer.timeout); 
                        //results[key]=arguments;// generally unrequired could be done with clousure
                        process.nextTick(function(){ // if forgot to do return so do only one, also if there ar too many loops so it won't crush;
                        loopwhile(shared,loop_function,callback,debug,  arguments
                        ,timer,currentstep++);
                        });
                        if(debug) {
                         if(report_uncalled_callbeck_after!=0)
                         {
                          var text=firstcalltrace+"\r\n"+debug_trace('callback did not called at step: '+currentstep);
                          timer.timeout=setTimeout(function () {console.log(text)}, report_uncalled_callbeck_after );
                         }
                        }
                       };
  add_shortcuts(next);
  next.shared=shared;
  next.step=currentstep;
  next.args=args;
  //next.continue=next; // just for code visibility  so you can type "continue" ...
    next.break=function(){
     if(debug)  console.log(debug_trace("CALLBACK")); 
     var args=arguments;
     var next= function(result){ }; // does nothing, its a last one
     next.args=args;
     add_shortcuts(next);
     next.shared=shared;
     next.step=currentstep;
     callfunc(callback,args,next);
   };
  
  callfunc(loop_function,args,next);
  
}this.while=loopwhile;

// short DIY version
//
// function whileloop(){
//  if(!(while condition)) return callback(); 
//  // code here  
//  return process.nextTick(function(){whileloop();});
// }



/*

function callflow(newthis,shared,steps,currentstep)
{
 if(!currentstep) currentstep=0;
 if(currentstep>=steps.length) return;
 if(typeof steps[currentstep]==='object' && steps[currentstep] instanceof  Array)
 {
  var next= function(){ callflow(newthis,shared,steps,currentstep+1);};
  next.next=next;
  next.shared=shared;
  next.steps=steps;
  steps[currentstep][0].call( newthis ,next, steps[currentstep][1],steps );
 }
 else
 {
  var next= function(){ callflow(newthis,shared,steps,currentstep+1);};
  next.next=next;
  next.shared=shared;
  next.steps=steps;
  steps[currentstep].call( newthis ,next, {} ,steps );
 }
} this.callflow=callflow;


function callparallel(newthis,shared,steps,callback)
{
 var callbackcount=0;
 var status=[];
 var results=[];
 function gonext(i,result)
 {
  callback_count++;
  status[i]=true;
  results[i]=result;
  if( callback_count == steps.length )
   callback(results);
 }
 for(var i=0;i<steps.length;i++)
 {
  var next= function(){ gonext(i,arguments); };
  next.next=next;
  next.shared=shared;
  next.steps=steps  ;
  next.status=status;
  if(typeof steps[currentstep]==='object' && steps[currentstep] instanceof  Array)
  {
   process.nextTick(function (){
    steps[i][0].call( newthis, next, steps[i][1] );
   });
  }
  else
  {
   process.nextTick(function (){
    steps[i].call( newthi/home/rakia/www/nodejs-mongodb-app/deps/node-inflows, next , {} );
   });
  }
 }
} this.callparallel=callparallel;

*/

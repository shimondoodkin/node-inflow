
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
// one simple function 
function flow(shared,steps,debug,   currentstep,args,called)
{
 if(arguments.length==2) debug = false;
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
 next.next=next;
 next.shared=shared;
 next.steps=steps;
 next.step=currentstep;
 next.flow=self.flow;
 next.parallel=self.parallel;
 next.each=self.each;
 next.while=self.while;
 next.args=args;
 
 if(typeof steps[currentstep]==='object' && steps[currentstep] instanceof  Array)
 {
  steps[currentstep][0].apply( next,steps[currentstep][1]);
 }
 else
 {
  if(typeof args==='object' && args instanceof  Array)
   steps[currentstep].apply( next , args);
  else
   steps[currentstep].call( next );
 }
 
} this.flow=flow;


// other unfinished perfectionism:

function parallel(shared,steps,callback,debug,   currentstep,args)
{
 var callbackcount=0;
 var status=[];
 var results=[];
 var timeout=false;
 function gonext(i,result)
 {
  if(status[i])
  {
   if(debug)
    console.log(debug_trace(' called more then once '));
  }
  else
   return;

  callback_count++;
  status[i]=true;
  results[i]=result;
  if( callback_count == steps.length )
  {
   var next= function(result){ }; // this inside gonext so this does nothing
   next.next=next;
   next.shared=shared;
   next.steps=steps;
   next.step=i;
   next.flow=self.flow;
   next.parallel=self.parallel;
   next.each=self.each;
   next.results=results;
   next.while=self.while;
   if(typeof callback==='object' && callback instanceof  Array)
    callback[0].apply(next, callback[1]);
   else
    callback.call(next,results);

   if(timeout)clearTimeout(timeout);//of debug
  }
 }
 for(var i=0;i<steps.length;i++)
 {
  var next= function(result){ gonext(i,result); };
  next.next=next;
  next.shared=shared;
  next.steps=steps;
  next.step=i;
  next.flow=self.flow;
  next.parallel=self.parallel;
  next.each=self.each;
  next.while=self.while;
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
 //console.log(require('sys').inspect(steps));
 if(typeof keys==='undefined')
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
   process.nextTick(function(){
   if(debug)  console.log(debug_trace("CALLBACK")); 
   
   var next= function(result){ }; // does nothing, its a last one
   next.next=next;
   next.shared=shared;
   next.steps=steps;
   next.step=currentstep;
   next.flow=self.flow;
   next.parallel=self.parallel;   
   next.each=self.each;
   next.while=self.while;
   next.args=args;
   //next.results=results;
   if(typeof callback==='object' && callback instanceof  Array)
    callback[0].apply(next, callback[1]);
   else
    callback.call(next);
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
  next.next=next;
  next.shared=shared;
  next.steps=steps;
  next.step=currentstep;
  next.flow=self.flow;
  next.parallel=self.parallel;
  next.each=self.each;
  next.while=self.while;
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
  next.next=next;
  next.shared=shared;
  next.step=currentstep;
  next.flow=self.flow;
  next.parallel=self.parallel;
  next.each=self.each;
  next.while=self.while;
  next.args=args;
  next.continue=next; // just for code visibility  so you can type "continue" ...
  next.break=function(){
   if(debug)  console.log(debug_trace("CALLBACK")); 
   
   var next= function(result){ }; // does nothing, its a last one
   next.next=next;
   next.shared=shared;
   next.step=currentstep;
   next.flow=self.flow;
   next.parallel=self.parallel;   
   next.each=self.each;
   next.while=self.while;
                        
   if(typeof callback==='object' && callback instanceof  Array)
    callback[0].apply(next, callback[1]);
   else if(callback)
    callback.call(next);
  };
  
  if(typeof loop_function==='object' && loop_function instanceof  Array)
   loop_function[0].apply(next, callback[1]);
  else
   loop_function.call(next);
  
}this.while=loopwhile;

// short DIY version
//
// function whileloop(){
//  if(!(while condition)) return callback(); 
//  // code here  
//  return process.nextTick(function(){whileloop();});
// }


// function 

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


// common debug problems i had with other steps libraries:
// 1 next callback did not called.
// 2 next callback called too mutch / too soon / callback split /  double call to same next(), so the final function called when the work is not done yet. 

var report_uncalled_callbeck_after= 1500 ;// ms , set to 0 to disable

function debug_trace(message)
{
 try{ throw (new Error('Trace: node-inflow,'+message)); }
 catch(e){var stack=e.stack;}
 console.log(stack);
}
var self=this;              
// one simple function 
function flow(shared,steps,debug,currentstep,args)
{
 if(arguments.length==2) debug = false;
 if(!currentstep) currentstep=0;
 if(debug){ if(steps.timeout) clearTimeout(steps.timeout);  }
 if(currentstep>=steps.length)
 {
   return;
 }
 if(debug)  debug_trace(currentstep);

 if(typeof steps[currentstep]==='object' && steps[currentstep] instanceof  Array)
 {
  var next= function(){ flow(shared,steps,debug,currentstep+1,arguments);
                        if(debug) {
                         if(this.called) debug_trace(' called more then once ');
                         this.called=true;
                         if(report_uncalled_callbeck_after!=0)
                          steps.timeout=setTimeout(function () {debug_trace('callback did not called at step: '+currentstep);}, report_uncalled_callbeck_after );
                        }
                      };
  next.next=next;
  next.shared=shared;
  next.steps=steps;
  next.step=currentstep;
  next.flow=self.flow;
  next.paralel=self.paralel;
  next.args=args;
  steps[currentstep][0].apply( next,steps[currentstep][1]);
 }
 else
 {
  var next= function(){ flow(shared,steps,debug,currentstep+1,arguments);
                        if(debug) {
                         if(this.called) debug_trace(' called more then once ');
                         this.called=true;
                         if(report_uncalled_callbeck_after!=0)
                          steps.timeout=setTimeout(function () {debug_trace('callback did not called at step: '+currentstep);}, report_uncalled_callbeck_after );
                        }
                      };
  next.next=next;
  next.shared=shared;
  next.steps=steps;
  next.step=currentstep;
  next.flow=self.flow;
  next.paralel=self.paralel;
  next.args=args;
  if(typeof args==='object' && args instanceof  Array)
   steps[currentstep].apply( next , args);
  else
   steps[currentstep].call( next );
 }

} this.flow=flow;


// other unfinished perfectionism:

function paralel(shared,steps,callback,debug)
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
    debug_trace(' called more then once ');
  }
  else
   return;

  callback_count++;
  status[i]=true;
  results[i]=result;
  if( callback_count == steps.length )
  {
   var next= function(result){ }; // does nothing
   next.next=next;
   next.shared=shared;
   next.steps=steps;
   next.step=i;
   next.flow=self.flow;
   next.paralel=self.paralel;
   next.results=results;
   if(typeof steps[currentstep]==='object' && steps[currentstep] instanceof  Array)
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
  next.paralel=self.paralel;
  next.args=[];

  if(typeof steps[currentstep]==='object' && steps[currentstep] instanceof  Array)
  {
   process.nextTick(function (){
    steps[i][0].apply( next,steps[i][1] );
   });
  }
  else
  {
   process.nextTick(function (){
    steps[i].call( next );
   });
  }
 } 
 if(debug)
 {
  if(report_uncalled_callbeck_after!=0)
   timeout=setTimeout(function () {debug_trace(' paralel callback call status: '+status.join(','));}, report_uncalled_callbeck_after );
 }
} this.paralel=paralel;

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


function callparalel(newthis,shared,steps,callback)
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
    steps[i].call( newthis, next , {} );
   });
  }
 }
} this.callparalel=callparalel;

*/

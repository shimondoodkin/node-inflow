
// common debug problems i had with other steps libraries:
// 1 next callback did not called.
// 2 next callback called too mutch / too soon / callback split /  double call to same next(), so the final function called when the work is not done yet. 

var report_uncalled_callbeck_after= 1500 ;// ms
/*
function callback_timeout_error()
{
 try{ throw (new Error('Trace: node-inflow, callback did not called at step '+currentstep)); }
 catch(e){var stack=e.stack;}
 console.log(stack);
}
   */                     
// one simple function 
function flow(shared,steps,currentstep)
{
 var timeout=false;//timeout is for debugging:
 if(!currentstep) currentstep=0;
 if(currentstep>=steps.length)
 {
   if(timeout) clearTimeout(timeout);
   return;
 }
 
 if(typeof steps[currentstep]==='object' && steps[currentstep] instanceof  Array)
 {
  var next= function(){ flow(shared,steps,currentstep+1);
                        //some code for debugging:
    //                    if(report_uncalled_callbeck_after!=0)
  //                       timeout=setTimeout(callback_timeout_error, report_uncalled_callbeck_after );
                      };
  next.next=next;
  next.shared=shared;
  next.steps=steps;
  next.step=currentstep;
  steps[currentstep][0].apply( next,steps[currentstep][1]);
 }
 else
 {
  var next= function(){ flow(shared,steps,currentstep+1);};
  next.next=next;
  next.shared=shared;
  next.steps=steps;
  next.step=currentstep;
  steps[currentstep].call( next );
 }

} this.flow=flow;




// other perfectionism:


function paralel(shared,steps,callback)
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
  var next= function(){ gonext(i,result); };
  next.next=next;
  next.shared=shared;
  next.steps=steps;
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
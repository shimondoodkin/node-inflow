// to test specific case comment with /* */ the other ones
 
var inflow = require('./index');
var sys = require('sys');

var undef;

var i=0;
function foo()
{
 i++;console.log(i+' foo, shared='+sys.inspect(this.shared).split("\n").join('')+', args='+sys.inspect(this.args).split("\n").join(''));
 this.next(i+' foo ok');
}

function bar()
{
 i++;console.log(i+' bar, shared='+sys.inspect(this.shared).split("\n").join('')+', args='+sys.inspect(this.args).split("\n").join(''));
 this.next(i+' bar ok');
}

function each_function(value,key,array){
 i++;console.log(i+' each,value=\''+value+'\',key=\''+key+'\', shared='+sys.inspect(this.shared).split("\n").join('')+', args='+sys.inspect(this.args).split("\n").join(''));
 this.next(i+' each ok');
}

function should_not_called_each_function(value,key,array){
 i++;console.log(i+' THIS SHOULD NOT CALLED each,value=\''+value+'\',key=\''+key+'\', shared='+sys.inspect(this.shared).split("\n").join('')+', args='+sys.inspect(this.args).split("\n").join(''));
 this.next(i+' THIS SHOULD NOT CALLED each ok');
}


function done_callback(value,callback){
 i++;console.log(i+' done "'+(value?value:'')+'", shared='+sys.inspect(this.shared).split("\n").join('')+', args='+sys.inspect(this.args).split("\n").join(''));
 if(callback)callback();
 this.next(i+' done "'+(value?value:'')+'" ok');
}

function get_while_function()
{
 var n=0;
 return (
 function while_function(){
  //console.log('before condition - while');
  if(!(n<10)) return this.break();
  i++;console.log(i+' while, shared='+sys.inspect(this.shared).split("\n").join('')+', args='+sys.inspect(this.args).split("\n").join(''));
 
  n++;
  if(n==5)
  {  
   console.log('n='+n+' continue...');
   return this.continue();
  }
  
  console.log('whiling '+n);
 
  this.next(i+' while ok');
 });
}

var shared={};

var tests=[

function (){
console.log('\n // flow\n');

console.log('\n flow:\n');
inflow.flow(shared,[foo,bar,[done_callback,['flow (array)',this]]]);

}
,
function (){

console.log('\n flow (empty):\n');
inflow.flow(shared,[]);
this();
}
,
function (){
console.log('\n // parallel\n');

console.log('\n parallel:\n');
inflow.parallel(shared,[foo,bar],[done_callback,['parallel',this]]);

}
,
function (){

console.log('\n parallel (empty):\n');
inflow.parallel(shared,[],[done_callback,['parallel',this]]);

}
,
function (){
console.log('\n // each\n');

console.log('\n each (array):\n');
inflow.each(shared,['foo (array)','bar (array)'],each_function,[done_callback,['each (array)',this]]);

}
,
function (){

console.log('\n each (array):\n');
inflow.each(shared,{'foo':'foo (object)','bar':'bar (object)'},each_function,[done_callback,['each (object)',this]]);

}
,
function (){

console.log('\n each (empty array):\n');
inflow.each(shared,[],should_not_called_each_function,[done_callback,['each (empty array)',this]]);

}
,
function (){

console.log('\n each (empty object):\n');
inflow.each(shared,{},should_not_called_each_function,[done_callback,['each (empty object)',this]]);

}
,
function (){

console.log('\n // while\n');

console.log('\n while:\n');
inflow.while(shared,get_while_function(),[done_callback,['while',this]]);

}
,
function (){
console.log('\n // undefined input\n');


console.log('\n flow (undefined):\n');
inflow.flow(shared,undef);

setTimeout(this,100);

}
,
function (){

console.log('\n parallel  (undefined):\n');
inflow.parallel(shared,undef,this);

}
,
function (){

console.log('\n each  (undefined):\n');
inflow.each(shared,undef,each_function,this);

}
,
function (){
console.log('\n ///no callback\n');

console.log('\n no callback-parallel:\n');
inflow.parallel(shared,[foo,bar]);

setTimeout(this,100);
}
,

function (){

console.log('\n no callback-each (array):\n');
inflow.each(shared,['foo (array)','bar (array)'],each_function);

setTimeout(this,100);
}

,

function (){

console.log('\n no callback-while:\n');

inflow.while(shared,get_while_function());
setTimeout(this,100);
}
,
inflow.if(true ,function (){console.log('\n if true  1\n');this();},function (){console.log('\n err if true  1\n');this();})
,
inflow.if(false,function (){console.log('\n err if false 1\n');this();},function (){console.log('\n if false 1\n');this();})
,
inflow.if(function (){this(true) },function (){console.log('\n if true  2\n');this();},function (){console.log('\n err if true  2\n');this();})
,
inflow.if(function (){this(false)},function (){console.log('\n err if false 2\n');this();},function (){console.log('\n if false 2\n');this();})

];


inflow.flow(shared,tests);

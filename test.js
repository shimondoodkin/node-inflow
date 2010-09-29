// to test specific case comment with /* */ the other ones 
var inflow = require('./index');
var sys = require('sys');

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


function done_callback(value){
 i++;console.log(i+' done "'+(value?value:'')+'", shared='+sys.inspect(this.shared).split("\n").join('')+', args='+sys.inspect(this.args).split("\n").join(''));
 this.next(i+' done "'+(value?value:'')+'" ok');
}

var n=0
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
}

var shared={};


console.log('\n flow:\n');
inflow.flow(shared,[foo,bar,[done_callback,['flow (array)']]]);

console.log('\n parallel:\n');
inflow.parallel(shared,[foo,bar],[done_callback,['parallel']]);

console.log('\n each (array):\n');
inflow.each(shared,['foo (array)','bar (array)'],each_function,[done_callback,['each (array)']]);

console.log('\n each (array):\n');
inflow.each(shared,{'foo':'foo (object)','bar':'bar (object)'},each_function,[done_callback,['each (object)']]);

console.log('\n each (empty array):\n');
inflow.each(shared,[],should_not_called_each_function,[done_callback,['each (empty array)']]);

console.log('\n each (empty object):\n');
inflow.each(shared,{},should_not_called_each_function,[done_callback,['each (empty object)']]);


console.log('\n while:\n');
inflow.while(shared,while_function,[done_callback,['while']]);






#Node-inflow

Node-inflow is a utility module which provides essential async control-flow functions for working with asynchronous JavaScript.


The new idea here is to use a shared object for called functions. The debugging made easy. Also I tried to use known function names for the known functionalities.

It is designed with user in mind and with experience.

see documentation in project wiki:

https://github.com/shimondoodkin/node-inflow/wiki


Examples:

    var inflow = require('node-inflow');
    inflow.flow([
      function(){console.log("1");this.next();},
      function(){console.log("2");this.next();}
    ]);
    
    var items=[
               {phone:'111111111234',name:'Simon'},
               {phone:'222222221234',name:'Avi'}
              ];
              
    inflow.each(items,function (val){
     console.log(val.phone+" - "+val.name+"\r\n");
     this.next();
    },
    function (){
     console.log('done');
    });
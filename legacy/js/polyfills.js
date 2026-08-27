// Polyfills for Safari 9 (iOS 9.3.5)
(function(){
  // Object.entries
  if(!Object.entries){
    Object.entries=function(obj){
      var r=[];
      for(var k in obj){if(Object.prototype.hasOwnProperty.call(obj,k))r.push([k,obj[k]]);}
      return r;
    };
  }
  // Object.values
  if(!Object.values){
    Object.values=function(obj){
      var r=[];
      for(var k in obj){if(Object.prototype.hasOwnProperty.call(obj,k))r.push(obj[k]);}
      return r;
    };
  }
  // String.prototype.padStart
  if(!String.prototype.padStart){
    String.prototype.padStart=function(len,fill){
      var s=String(this);fill=fill||' ';
      while(s.length<len)s=fill+s;
      return s;
    };
  }
  // String.prototype.padEnd
  if(!String.prototype.padEnd){
    String.prototype.padEnd=function(len,fill){
      var s=String(this);fill=fill||' ';
      while(s.length<len)s=s+fill;
      return s;
    };
  }
})();

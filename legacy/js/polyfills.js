// Polyfills for Safari 9 (iOS 9.3.5)
// Loaded before ALL other scripts
(function(){
  // ── URLSearchParams ──
  if(!window.URLSearchParams){
    window.URLSearchParams=function(qs){
      this._params={};
      if(qs){
        var pairs=qs.replace(/^\?/,'').split('&');
        for(var i=0;i<pairs.length;i++){
          var pair=pairs[i].split('=');
          if(pair[0])this._params[decodeURIComponent(pair[0])]=decodeURIComponent(pair[1]||'');
        }
      }
    };
    window.URLSearchParams.prototype.get=function(k){return this._params[k]||null;};
    window.URLSearchParams.prototype.has=function(k){return k in this._params;};
  }

  // ── Object.entries ──
  if(!Object.entries){
    Object.entries=function(obj){
      var r=[];
      for(var k in obj){if(Object.prototype.hasOwnProperty.call(obj,k))r.push([k,obj[k]]);}
      return r;
    };
  }

  // ── Object.values ──
  if(!Object.values){
    Object.values=function(obj){
      var r=[];
      for(var k in obj){if(Object.prototype.hasOwnProperty.call(obj,k))r.push(obj[k]);}
      return r;
    };
  }

  // ── Object.assign ──
  if(!Object.assign){
    Object.assign=function(t){
      for(var i=1;i<arguments.length;i++){
        var s=arguments[i];if(s)for(var k in s)if(Object.prototype.hasOwnProperty.call(s,k))t[k]=s[k];
      }
      return t;
    };
  }

  // ── Array.from ──
  if(!Array.from){
    Array.from=function(o){
      var r=[];for(var i=0;i<o.length;i++)r.push(o[i]);return r;
    };
  }

  // ── Array.prototype.find ──
  if(!Array.prototype.find){
    Array.prototype.find=function(fn){
      for(var i=0;i<this.length;i++){if(fn(this[i],i,this))return this[i];}
      return undefined;
    };
  }

  // ── Array.prototype.findIndex ──
  if(!Array.prototype.findIndex){
    Array.prototype.findIndex=function(fn){
      for(var i=0;i<this.length;i++){if(fn(this[i],i,this))return i;}
      return -1;
    };
  }

  // ── Array.prototype.includes ──
  if(!Array.prototype.includes){
    Array.prototype.includes=function(v){
      return this.indexOf(v)!==-1;
    };
  }

  // ── String.prototype.padStart ──
  if(!String.prototype.padStart){
    String.prototype.padStart=function(len,fill){
      var s=String(this);fill=fill||' ';
      while(s.length<len)s=fill+s;
      return s;
    };
  }

  // ── String.prototype.padEnd ──
  if(!String.prototype.padEnd){
    String.prototype.padEnd=function(len,fill){
      var s=String(this);fill=fill||' ';
      while(s.length<len)s=s+fill;
      return s;
    };
  }

  // ── Element.prototype.closest ──
  if(!Element.prototype.closest){
    Element.prototype.closest=function(sel){
      var el=this;
      while(el&&el!==document){
        if(el.matches(sel))return el;
        el=el.parentNode;
      }
      return null;
    };
  }

  // ── Element.prototype.matches ──
  if(!Element.prototype.matches){
    Element.prototype.matches=
      Element.prototype.msMatchesSelector||
      Element.prototype.webkitMatchesSelector;
  }

  // ── String.prototype.trim ──
  if(!String.prototype.trim){
    String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,'');};
  }

  // ── Number.isNaN ──
  if(!Number.isNaN){
    Number.isNaN=function(v){return v!==v;};
  }
})();

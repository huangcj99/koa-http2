const json = function(str){
  if(str === undefined){
    str = null;
  }
  return JSON.stringify(str);
};

module.exports = json;

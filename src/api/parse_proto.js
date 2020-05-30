// 解析主体内容 v0.3
var parseProtoBody = (input) => {
  // 过滤头文件
  input = headerFilter(input);
  var content = input.split('\n');
  var body = "";
  for(var line in content) {
    var lineText = content[line];
    // 解析 跳过首行注释 以及 空白行
    if (!checkAnnotate(lineText)) {
      if (!checkWhiteLine(lineText)) {
        body += lineText;
        body += "\n";
      }
    }
  }
  return body;
}

// 解析版本号
var parseProtoVersion = (input) => {
  const reg = /syntax[\s]*=[\s]*["|']proto3["|']/;
  var res = input.search(reg);
  if (res == -1) {
    return 2;
  } else {
    return 3;
  }
}

// 检查是否全注释  true:全行注释
var checkAnnotate = (input) => {
  const reg = /[\s]*\/\//;
  var res = input.search(reg);
  if (res==0) {
    return true;
  } else {
    return false;
  }
}

// 检查是否空白行  true:全空行
var checkWhiteLine = (input) => {
  const reg = /[\S]+/;
  var res = input.search(reg);
  if (res == -1) {
    return true;
  } else {
    return false;
  }
}

var headerFilter = (input) => {
  // filter Multi-line comments 放在最前！
  reg = /\/\*[\s\S]*?\*\//g
  input = input.replace(reg,"");

  // filter syntax
  var reg;
  reg = /syntax[\s\n\r]*=[\s\n\r]*["|'][\s\n\r]*[\S]+[\s\n\r]*["|'][\s\n\r]*;/g
  input = input.replace(reg,"");
  
  // filter option  放在package前
  reg = /option[\s\n\r]*[\S]+[\s\n\r]*=[\s\n\r]*[\S]+[\s\n\r]*;/g
  input = input.replace(reg,"");

  // filter package
  reg = /package[\s\n\r]+[\S]+;/g
  input = input.replace(reg,"");

  // filter import
  reg = /import[\s\n\r]+["|'][\s\n\r]*google\/protobuf\/[\S]+[\s\n\r]*["|']+[\s\n\r]*;/g
  var googleProto = input.match(reg);

  reg = /import[\s\n\r]+[\S]+[\s\n\r]*;/g
  input = input.replace(reg,"");

  var res = "";

  for (let item in googleProto) {
    res += googleProto[item];
    res += "\n";
  }
  res += input;

  return res;
}

// v0.1 方法
var oldparseProtoBody = (schema) => {
  // [\S]+[\s]+[\S]+[\s]*{([\s\S]*) todo : 可以分版本匹配，根据内容的特性来
  const reg = /[\S]+[\s]+[\S]+[\s]*{([\s\S]*)/;
  var res = schema.match(reg);
  return res[0];
  //return schema;
}

export default {
  parseProtoBody,
  parseProtoVersion,
  oldparseProtoBody
}


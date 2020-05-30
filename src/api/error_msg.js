// 请求错误
var httpError = (code) => {
    switch(code) {
    case 500:
        return "Compiler fail";
    case 501:
        return "generate Java fail";
    case 502:
        return "server fail";
    case 510:
        return "输入参数不足";
    case 511:
        return "服务端读取proto文件失败";
    case 512:
        return "proto版本错误:未知版本";  
    case 513:
        return "proto版本错误:指定多个版本";
    case 514:
        return "<packed>选项为布尔变量"; 
    case 515:
        return "属性中出现错误选项:proto2支持<default>和<packed>;proto3只支持<packed>;且<packed>仅用于repeated primitive fields";
    case 516:
        return "属性中出现错误修饰词:proto2支持<required>,<optional>和<repeated>,必须显式声明;proto3支持<singular>和<repeated>,默认为<singular>";
    case 517:
        return "读取pb数据失败";
    case 518:
        return "proto中可获得的wire types为:<type 0>,<type 1>,<type 2>,<type 5>;<type 3>和<type 4>已经废弃";
    case 519:
        return "解析pb数据时发生错误,不应该发生的错误";
    case 520:
        return "proto2中,required修饰的属性必填";
    case 521:
        return "默认值与类型不符";
    case 522:
        return "自定义类型不能设置默认值";
    default:
        return "未知错误，错误码"+code;
    }
}
  
  
export default {
    httpError
}
  
  
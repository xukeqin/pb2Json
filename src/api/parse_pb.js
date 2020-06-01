var mainParse = (data) => {
    console.log(data.length);
    console.log(data);
    // 数据长度
    var pbLength = data.length;
    var jsonRes = [];
    var oneMsg = messageParse(0, pbLength, data);
    jsonRes.push(oneMsg);
    console.log(jsonRes);
    return jsonRes;
}


// 解析主体内容 v0.3
var messageParse = (begin, end, data) => {
    console.log(begin);
    console.log(end);
    // 数据长度
    var i = begin;
    var oneMsg = {};  //每条消息
    var count = 0;
    while(i<end) {
        // temp
        count++;
        if (count>100) {
            console.log("陷入死循环, i="+i);
            return oneMsg;
        }
        // temp over
        // type = 2
        if ((data[i]&0b111) == 2) {
            var value;
            var field = data[i]>>3;
            // check repeated
            if (data[i+data[i+1]+2]!=null && data[i+data[i+1]+2] == data[i]) {
                value = [];
                var tempField = data[i];
                while (data[i] == tempField) {
                    value.push(messageParse(i+2, i+2+data[i+1], data));
                    i = i+data[i+1]+2;
                }
            } else if (data[i+2]!=null && data[i+2]<32) {
                value = messageParse(i+2, i+2+data[i+1], data);
            } else {
                value = parseType2_String(i+2, i+2+data[i+1], data);
            }
            oneMsg[field] = value;
            i = i+2+data[i+1];
        }
        // type = 0
        else if ((data[i]&0b111) == 0) {
            var value;
            // 判断字节
            var pbLength = 1;
            for (var p=i+1; (data[p]>>7)==1;p++) {
                pbLength ++;
            }
            value = parseType0(i+1, i+1+pbLength,data);
            var field = data[i]>>3;
            oneMsg[field] = value;
            i = i+1+pbLength;
        }
        // float
        else if ((data[i]&0b111) == 1) {
            var field =  data[i]>>3;
            var sign = data[i+8]>>7;
            var index = ((data[i+8]&0b01111111)<<4)+(data[i+3]>>4)-1023;
            var base = 1;
            var base_1 = (data[i+7]&0b00001111)/16;
            var base_2 = data[i+6]/16/256;
            var base_3 = data[i+5]/16/256/256;
            var base_4 = data[i+4]/16/256/256/256;
            var base_5 = data[i+3]/16/256/256/256/256;
            var base_6 = data[i+2]/16/256/256/256/256/256;
            var base_7 = data[i+1]/16/256/256/256/256/256/256;
            base = base + base_1 + base_2 + base_3 + base_4 + base_5 + base_6 + base_7;
            var value = base*Math.pow(2,index)*(1-sign*2);
            oneMsg[field] = value;
            i = i + 9;
        }
        // double
        else if ((data[i]&0b111) == 5) {
            var field =  data[i]>>3;
            var sign = data[i+4]>>7;
            var index = ((data[i+4]&0b01111111)<<1)+(data[i+3]>>7)-127;
            var base = 1;
            var base_1 = (data[i+3]&0b01111111)/128;
            var base_2 = data[i+2]/128/256;
            var base_3 = data[i+1]/128/256/256;
            base = base + base_1 + base_2 + base_3;
            var value = base*Math.pow(2,index)*(1-sign*2);
            oneMsg[field] = value;
            i = i + 5;
        }
    }
    return oneMsg;
}

// [begin,end)
// type = varint
var parseType0 = (begin, end, data) => {
    var count = 1;
    var value = 0;
    for (var p=begin; p<end; p++) {
        data[p] = data[p]&0b01111111;
        value = value + count*data[p];
        count = count*128;
    }
    return value;
}

// [begin,end)
// type2 = string
var parseType2_String = (begin, end, data) => {
    var count = 0;
    var p = begin;
    var res = "";
    while (p<end) {
        count++;
        if (count>100) {
            console.log("陷入死循环, p="+p);
            break;
        }
        res += String.fromCharCode(data[p]);
        p = p + 1;
    }
    return res;
}

export default {
    mainParse
}



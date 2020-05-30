<template>
  <div id="app">
    <el-container>
      <el-header>
        <span>proto2Json 转换平台</span>
      </el-header>
      <el-main>
        <el-row :gutter="24">
          <el-col :span="8">
            <el-upload
              drag
              action=""
              multiple
              ref="protoSchemaUpload"
              :on-change="startParsingSchema"
              :on-remove = "removeFile"
              :auto-upload="false">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将proto schema文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
            <el-upload
              drag
              action=""
              multiple
              ref="protoDataUpload"
              :limit="1"
              :on-change="startParsingData"
              :on-exceed="exceedLimit"
              :auto-upload="false">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将二进制文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
        </el-col>
        <el-col :span="8"><div class="print-box"><pre ref="preUploadBox">{{combineInput}}</pre></div></el-col>
        <el-col :span="8"><div class="print-box"><pre><json-viewer :expand-depth=4 :value="responseText"></json-viewer></pre></div></el-col>
      </el-row>
      <div>
        <el-button type="primary" :disabled="javaParseButton" @click="postParsing('java')">Java解析</el-button>
        <el-button type="success" :disabled="pythonParseButton" @click="postParsing('python')">Python解析</el-button>
        <el-button type="warning" :disabled="noProtoParseButton" @click="noProtoParse">无协议解析</el-button>
      </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Vue from 'vue'
import messages from './proto/webapi_pb'
import axios from 'axios'
import parseProto from './api/parse_proto'
import errorMsg from './api/error_msg'
import parsePb from './api/parse_pb'

export default {
  data() {
    return {
      javaParseButton:false,
      pythonParseButton:false,
      noProtoParseButton:false,
      responseText:{"result":"wait for input"},
      protoContextArray:new Array(),
      protoVersion:0,
      combineInput:"",
      protoInput:null
    }
  },
  methods: {
    // 解析Schema数据
    startParsingSchema (file,fileList) {
      var self = this;
      // 校验文件的后缀是否符合
      if (!this.checkSchema(file,fileList)) {
        var index = fileList.indexOf(file);
        console.log(index);
        if (index > -1) {
          fileList.splice(index, 1);
        }
        return false;
      };
      const reader = new FileReader()
      reader.readAsText(file.raw);
      reader.onload = function () {
        var fileObj = new Object();
        fileObj.name = file.name;
        fileObj.uid = file.uid;

        var fileVersion = parseProto.parseProtoVersion(this.result);
        if (self.protoVersion!=0 && fileVersion!=self.protoVersion) {
          self.$message.error("不允许同时上传版本不一致的proto");
          return false;
        }
        self.protoVersion = fileVersion;

        fileObj.body = parseProto.parseProtoBody(this.result);
        self.protoContextArray.push(fileObj);
        
        self.flashInput();
        self.$message({ message: '解析成功',type: 'success'});
      }
    },

    // 删除文件
    removeFile (file,fileList) {
      for (var fileIndex in this.protoContextArray) {
        if (this.protoContextArray[fileIndex].uid == file.uid) {
          if (fileIndex > -1) {
            this.protoContextArray.splice(fileIndex, 1);
          }
        }
      }
      this.flashInput();
      // 全部删除，重置version
      if (this.protoContextArray.length == 0) {
        this.protoVersion = 0;
      }
      this.$message({ message: '删除成功',type: 'success'});
    },

    // 解析Data数据
    startParsingData (file,fileList) {
      var self = this;
      if (!this.checkData(file)) {
        this.$refs.protoDataUpload.clearFiles();
        return false;
      };
      const reader = new FileReader()
      reader.readAsArrayBuffer(file.raw);
      reader.onload = function () {
        console.log(this.result);
        self.protoInput = new Uint8Array(this.result);
        self.$message({ message: '二进制文件读取成功',type: 'success'});
      }
    },

    // Schema 文件校验
    checkSchema(file,fileList) {
      const reg = /.proto/;
      var isProto = reg.test(file.name);
      var isLt2M = file.size / 1024 / 1024 < 2;

      if (!isProto) {
        this.$message.error('只允许上传.proto文件');
        return false;
      }
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 2MB!');
        return false;
      }
      
      return true;
    },

    // Data 文件校验
    checkData(file) {
      var isLt2M = file.size / 1024 / 1024 < 10;
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 10MB!');
      }
      return isLt2M;
    },

    // 超过上传文件数量限制
    exceedLimit(file,fileList) {
      this.$message.error('超过上传文件数量限制');
    },

    // 请求
    postParsing(method) {
      if (this.protoContextArray.length == 0 || this.protoInput == null) {
        this.$message.error('请上传完整的文件');
        return;
      }
      this.responseText = {"result":"loading..."};
      var reqData = new messages.InfoRequest();
      var self = this;
      reqData.setData(this.protoInput);
      reqData.setSchema(this.combineInput);
      var bytes = reqData.serializeBinary();
      axios.defaults.responseType = 'arraybuffer';
      var url = "";
      if (method=='python') {
        url = "http://121.36.7.183:8080/getJsonPython";
      }
      if (method=='java') {
        url = "http://121.36.7.183:8080/getJson";
      }
      if (url=="") {
        self.$message.error("未知错误10002");
        return;
      }
      axios.post(url, bytes, {
        headers: {
          'Content-Type': 'application/x-protobuf'
        },
        params: {
          'version': this.protoVersion
        }
      }).then(function (response) {
        var repData = messages.InfoResponse.deserializeBinary(response.data);
        var statCode = repData.getCode();
        if (statCode!=200) {
          self.checkResult(statCode);
          return;
        }
        var res = repData.getData();
        self.responseText = JSON.parse(unescape(res));
      }).catch(function (error) {
        self.$message.error("未知错误10003");
        console.log(error);
      });
    },
    // todo 变成可配置json的格式
    checkResult(code) {
      var reason = errorMsg.httpError(code);
      this.$message.error("转换失败，请查看详情");
      this.flashResult('{"error message":"'+reason+'"}');
    },
    flashInput() {
      var printData = "";
      for (let fileObj in this.protoContextArray) {
        printData += this.protoContextArray[fileObj].body;
      }
      this.combineInput = printData;
    },
    flashResult(data) {
      this.responseText = JSON.parse(data);
    },
    noProtoParse() {
      var res = parsePb.mainParse(this.protoInput);
      this.responseText = res;
    }
  }
} 
</script>

<style>
@import  "./css/style.css";
</style>

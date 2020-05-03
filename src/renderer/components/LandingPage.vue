<template>
  <el-container style="height: 100%;width: 100%; border: 1px solid #eee">
    <el-header style="border-bottom: 1px solid #eee;height:120px;margin-bottom:5px;overflow:auto;">
      <el-row :gutter="20">
        <el-col :span="23">
          <el-table :data="tableData" style="width: 100%" size="mini">
            <el-table-column label="zk" width="180">
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.zkName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" @click="refresh(scope.$index, scope.row)">
                  <i class="el-icon-refresh-left"></i>
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.$index, scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <el-col :span="1">
          <el-dropdown trigger="click" size="mini">
            <i class="el-icon-setting" style="margin: 8px"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <span @click="dialogVisible = true">新增zk</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-aside width="200px" style="background-color: rgb(238, 241, 246);overflow:auto;">
        <div style="width:400px;">
          <el-tree :data="data" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
        </div>
      </el-aside>
      <el-container>
        <el-main style="margin-top:0px;">
          <el-row :gutter="20">
            <el-col :span="24">
              <div class="grid-content bg-purple">
                <p>node：</p>
                <p>{{ node }}</p>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <div class="grid-content bg-purple" style="height:400px;">
                <p>value：</p>
                <p>{{ value }}</p>
              </div>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>

    <el-dialog title="新增zk" :visible.sync="dialogVisible" width="50%">
      <el-form
        :model="dynamicValidateForm"
        ref="dynamicValidateForm"
        label-width="auto"
        class="demo-dynamic"
        size="mini"
      >
        <el-form-item
          prop="ip"
          label="ip"
          :rules="[
      { required: true, message: '请输入ip', trigger: 'blur' }
    ]"
        >
          <el-input v-model="dynamicValidateForm.ip"></el-input>
        </el-form-item>
        <el-form-item
          prop="port"
          label="port"
          :rules="[
      { required: true, message: '请输入端口号', trigger: 'blur' }
    ]"
        >
          <el-input v-model="dynamicValidateForm.port"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('dynamicValidateForm')">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-container>
</template>

<script>
import zk from "../common/js/zookeeper.js";
export default {
  mounted() {
    console.log("mounted....");
    zk.connectZK(ret => {
      //console.log("this.data length is "+this.data.length)
      if (this.data.length > 0) {
        var flag = 0;
        this.data.forEach((element, index) => {
          //console.log("element.zkName and ret.zkName is "+element.zkName+' '+ret.zkName)
          if (element.zkName == ret.zkName) {
            flag = 1;
            //console.log("splice ", ret);
            this.data.splice(index, 1);
            //console.log("lin", this.data);
            if (this.data.length == 0) {
              this.data = new Array();
              //console.log("lin2", this.data);
            }
            //console.log('ret is :',ret);
            this.data.push(ret);
            this.data = JSON.parse(JSON.stringify(this.data));
          }
        });
        if(flag == 0){
          this.data.push(ret);
          this.data = JSON.parse(JSON.stringify(this.data));
        }
      } else {
        this.data.push(ret);
        this.data = JSON.parse(JSON.stringify(this.data));
      }
    });
    //初始化表格内容
    var zks = localStorage.getItem("zkNames");
    if (zks != null && "" != zks) {
      zks.split("$").forEach(element => {
        if (element != null && "" != element) {
          var newData = { zkName: element };
          console.log("添加表格行");
          this.tableData.push(newData);
        }
      });
    }
  },
  data() {
    return {
      data: [],
      defaultProps: {
        children: "children",
        label: "label",
        path: "path",
        zkName: "zkName"
      },
      dialogVisible: false,
      node: "",
      value: "",
      tableData: [],
      dynamicValidateForm: {
        ip: "127.0.0.1",
        port: "2181"
      }
    };
  },
  methods: {
    handleNodeClick(data) {
      console.log('点击node节点获取信息:' + data);
      //console.log(data.path);
      zk.getNodeData(data.zkName, data.path, ret => {
        this.node = data.path;
        this.value = ret;
      });
    },
    addZK() {
      console.log("add zk,show setting popup");
    },
    refresh(index, row) {
      //console.log('handleEdit:',index, row);
      zk.connectZKByName(row.zkName, ret => {
        //console.log('refresh:',ret)
        if (this.data.length > 0) {
          var flag = 0;
          this.data.forEach((element, index) => {
            if (element.zkName == ret.zkName) {
              flag = 1;
              this.data.splice(index, 1);
              //console.log("splice: ", this.data);
              if (this.data == null || this.data.length == 0) {
                this.data = new Array();
                //console.log("splice2: ", this.data);
              }
              this.data.push(ret);
              this.data = JSON.parse(JSON.stringify(this.data));
            }
          });
        } else {
          this.data.push(ret);
          this.data = JSON.parse(JSON.stringify(this.data));
        }
      });
    },
    handleDelete(index, row) {
      console.log(index, row);
      var zkNames = localStorage.getItem("zkNames");
      localStorage.setItem("zkNames", zkNames.replace(row.zkName, ""));
      this.tableData.splice(index, 1);
      this.data.forEach((element, index) => {
        if (element.label == row.zkName) {
          this.data.splice(index, 1);
          return;
        }
      });
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          //alert("submit!");
          var zkNames = localStorage.getItem("zkNames");
          var zkName =
            this.dynamicValidateForm.ip + ":" + this.dynamicValidateForm.port;
          if (zkNames == null || zkNames == "") {
            zkNames = zkName;
          } else {
            if (zkNames.indexOf(zkName) == -1) {
              zkNames = zkNames + "$" + zkName;
            } else {
              return false;
            }
          }
          localStorage.setItem("zkNames", zkNames);
          this.dialogVisible = false;
          var newTableData = { zkName: zkName };
          this.tableData.push(newTableData);
          console.log("新配置zk");
          zk.connectZKByName(zkName, ret => {
            if (this.data.length > 0) {
              var flag = 0;
              this.data.forEach((element, index) => {
                if (element.zkName == ret.zkName) {
                  flag = 1;
                  this.data.splice(index, 1);
                  if(this.data.length == 0){
                    this.data = new Array();
                  }
                  this.data.push(ret);
                  this.data = JSON.parse(JSON.stringify(this.data));
                }
              });
              if(flag == 0){
                this.data.push(ret);
                this.data = JSON.parse(JSON.stringify(this.data));
              }
            } else {
              this.data.push(ret);
              this.data = JSON.parse(JSON.stringify(this.data));
            }
            console.log("新配置zk后 data is: ",JSON.stringify(this.data));
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
  }
};
</script>

<style>
.el-row {
  margin-bottom: 10px;
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
/* .el-table td, .el-table th{
  padding: 0 0;
} */
</style>
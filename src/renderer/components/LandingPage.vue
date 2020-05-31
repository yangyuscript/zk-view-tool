<template>
  <el-container style="height: 100%;width: 100%; border: 1px solid #eee;">
    <el-header style="border-bottom: 1px solid #eee;height:120px;margin-bottom:5px;overflow:auto;">
      <el-row :gutter="20">
        <el-col :span="23">
          <el-table :data="tableData" style="width: 100%" size="mini" v-loading="loading">
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
                  icon="el-icon-delete"
                  @click="handleDelete(scope.$index, scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <el-col :span="1">
          <el-dropdown trigger="click" size="mini">
            <i class="el-icon-setting" style="margin: 8px"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="dialogVisible = true" style="width:100%;height:100%;"><span>新增zk</span></div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="dialogVisible2 = true" style="width:100%;height:100%;"><span>加载模式</span></div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-header>
    <el-container style="height:420px;overflow:hidden;">
      <el-aside width="200px" style="background-color: rgb(238, 241, 246);overflow:auto;">
        <div style="width:400px;">
          <el-tree
            :data="data"
            :props="defaultProps"
            @node-click="handleNodeClick"
            ref="tree"
            node-key="path"
          ></el-tree>
        </div>
      </el-aside>
      <el-container>
        <el-main style='padding: 0 22px;'>
          <el-row :gutter="20">
            <el-col :span="24">
              <div class="myp" style="width:740px;">
                <p>
                  <span style="color:grey;">node path：</span>
                  {{ node }}
                </p>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <span style="color:grey;">node value：</span>
              <textarea v-model="value" style="width:740px;height:260px;"></textarea>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="2" :offset="17">
              <el-button type="danger" size="mini" :loading="saveLoding" @click="setData()">保存</el-button>
            </el-col>
            <el-col :span="2">
              <el-button type="danger" size="mini" :loading="deleteLoding" @click="deleteNode()">删除</el-button>
            </el-col>
            <el-col :span="2">
              <el-button
                type="danger"
                size="mini"
                :loading="createLoding"
                @click="clickCreateNodeBtn()"
              >创建</el-button>
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
          <el-button type="danger" @click="submitForm('dynamicValidateForm')">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="加载模式" :visible.sync="dialogVisible2" width="50%">
      <el-radio v-model="loadMode" label="1">懒加载</el-radio>
      <el-radio v-model="loadMode" label="2">饿加载</el-radio>
      <el-button type="danger" size="small" @click="changeLoadMode()">提交</el-button>
    </el-dialog>

    <el-dialog title="创建新节点" :visible.sync="dialogVisible3" width="50%">
      <el-form
        :model="dynamicValidateForm2"
        ref="dynamicValidateForm2"
        label-width="auto"
        class="demo-dynamic"
        size="mini"
      >
        <p>当前zk：{{currZK}}</p>
        <p>当前path：{{currPath}}</p>
        <el-form-item
          prop="nodePath"
          label="nodeName"
          :rules="[
      { required: true, message: '请输入节点名', trigger: 'blur' }
    ]"
        >
          <el-input v-model="dynamicValidateForm2.nodePath"></el-input>
        </el-form-item>
        <el-form-item
          prop="nodeValue"
          label="nodeValue"
          :rules="[
      { required: false, message: '请输入节点值', trigger: 'blur' }
    ]"
        >
          <el-input v-model="dynamicValidateForm2.nodeValue"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="submitForm2('dynamicValidateForm2')">提交</el-button>
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
    this.init();
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
      dialogVisible2: false,
      dialogVisible3: false,
      node: "",
      value: "",
      tableData: [],
      dynamicValidateForm: {
        ip: "127.0.0.1",
        port: "2181"
      },
      dynamicValidateForm2: {
        nodePath: "newChild",
        nodeValue: "new child value"
      },
      loadMode: "1",
      loading: true,
      saveLoding: false,
      deleteLoding: false,
      createLoding: false,
      currZK: "",
      currPath: ""
    };
  },
  methods: {
    clickCreateNodeBtn() {
      this.dialogVisible3 = true;
      var currNode = this.$refs.tree.getCurrentNode();
      this.currZK = currNode.zkName;
      this.currPath = currNode.path;
    },
    setData() {
      console.log(
        "set data",
        this.node,
        this.value,
        this.$refs.tree.getCurrentNode()
      );
      var currNode = this.$refs.tree.getCurrentNode();
      if (currNode != undefined) {
        this.saveLoding = true;
        zk.operateZKNode(
          "setData",
          currNode.zkName,
          currNode.path,
          this.value,
          ret => {
            if (ret == 1) {
              console.log("set data success");
              this.$message({
                message: "设置节点value成功",
                type: "success"
              });
            }
            this.saveLoding = false;
          }
        );
      }
    },
    deleteNode() {
      console.log(
        "delete node",
        this.node,
        this.value,
        this.$refs.tree.getCurrentNode()
      );
      var currNode = this.$refs.tree.getCurrentNode();
      if (currNode != undefined) {
        this.deleteLoding = true;
        zk.operateZKNode(
          "deleteNode",
          currNode.zkName,
          currNode.path,
          null,
          ret => {
            if (ret == 1) {
              console.log("delete node success");
              this.node = "";
              this.value = "";
              this.$refs.tree.remove(currNode);
              this.$message({
                message: "删除节点成功",
                type: "success"
              });
            }
            this.deleteLoding = false;
          }
        );
      }
    },
    handleNodeClick(node) {
      console.log("点击node节点获取信息:", node);
      //console.log(node.path);
      zk.getNodeData(node.zkName, node.path, ret => {
        console.log("点击节点获取值", ret);
        console.log("存在子节点", ret.get("childrenArray"));
        this.node = node.path;
        this.value = ret.get("data");
        console.log(ret.get("childrenArray"));
        var childrenArray = ret.get("childrenArray");
        if (childrenArray != null && childrenArray.length > 0) {
          console.log("存在子节点", childrenArray);
          if (node.children.length == 0) {
            node.children = childrenArray;
            //this.data = JSON.parse(JSON.stringify(this.data));
          }
        }
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
                  if (this.data.length == 0) {
                    this.data = new Array();
                  }
                  this.data.push(ret);
                  this.data = JSON.parse(JSON.stringify(this.data));
                }
              });
              if (flag == 0) {
                this.data.push(ret);
                this.data = JSON.parse(JSON.stringify(this.data));
              }
            } else {
              this.data.push(ret);
              this.data = JSON.parse(JSON.stringify(this.data));
            }
            console.log("新配置zk后 data is: ", JSON.stringify(this.data));
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    submitForm2(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          console.log(
            "create node",
            this.dynamicValidateForm2.nodePath,
            this.dynamicValidateForm2.nodeValue,
            this.$refs.tree.getCurrentNode()
          );
          var currNode = this.$refs.tree.getCurrentNode();
          if (currNode != undefined) {
            this.createLoding = true;
            zk.operateZKNode(
              "createNode",
              currNode.zkName,
              (currNode.path == "/" ? currNode.path : currNode.path + "/") +
                this.dynamicValidateForm2.nodePath,
              this.dynamicValidateForm2.nodeValue,
              ret => {
                this.dialogVisible3 = false;
                if (ret == 1) {
                  console.log("create data success");
                  this.$message({
                    message: "创建节点成功",
                    type: "success"
                  });
                  this.$refs.tree.append(
                    {
                      label: this.dynamicValidateForm2.nodePath,
                      children: [],
                      path:
                        currNode.path +
                        "/" +
                        this.dynamicValidateForm2.nodePath,
                      zkName: currNode.zkName
                    },
                    currNode
                  );
                }
                this.createLoding = false;
              }
            );
          }
        }
      });
    },
    changeLoadMode() {
      console.log("更换加载模式");
      localStorage.setItem("loadMode", this.loadMode);
      this.dialogVisible2 = false;
      this.init();
    },
    init() {
      const initLoading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      var connnectNum = 0;
      zk.testZKAccess(ret => {
        connnectNum++;
        console.log("可连接zk数量: ", connnectNum);
      });
      setTimeout(() => {
        if (connnectNum == 0) {
          initLoading.close();
        }
      }, 2000);
      var realNum = 0;
      zk.connectZK(ret => {
        //console.log("this.data length is "+this.data.length)
        if (this.data.length > 0) {
          var flag = 0;
          this.data.forEach((element, index) => {
            console.log("element.zkName and ret.zkName is "+element.zkName+' '+ret.zkName)
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
          if (flag == 0) {
            this.data.push(ret);
            this.data = JSON.parse(JSON.stringify(this.data));
          }
        } else {
          this.data.push(ret);
          this.data = JSON.parse(JSON.stringify(this.data));
        }
        //this.data.push(ret);
        //this.data = JSON.parse(JSON.stringify(this.data));
        realNum++;
        if (realNum >= connnectNum) {
          initLoading.close();
        }
      });
      //初始化表格内容
      var zks = localStorage.getItem("zkNames");
      if (zks != null && "" != zks) {
        this.tableData = [];
        zks.split("$").forEach(element => {
          if (element != null && "" != element) {
            var newData = { zkName: element };
            console.log("添加表格行");
            this.tableData.push(newData);
          }
        });
        this.loading = false;
      }
      //设置加载模式 默认饿加载
      var loadMode = localStorage.getItem("loadMode");
      if (null == loadMode || loadMode == "") {
        localStorage.setItem("loadMode", "2");
        loadMode = localStorage.getItem("loadMode");
      }
      this.loadMode = loadMode;
      console.log("加载模式为", this.loadMode == "1" ? "懒加载" : "饿加载");
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
.myp {
  display: inline-block;
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
}
/* .el-table td, .el-table th{
  padding: 0 0;
} */
</style>
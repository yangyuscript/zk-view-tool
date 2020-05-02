<template>
  <el-container style="height: 100%;width: 100%; border: 1px solid #eee">
    <el-header style="border-bottom: 1px solid #eee;height:120px;margin-bottom:5px;overflow:auto;">
      <el-row :gutter="20">
        <el-col :span="23">
          <el-table :data="tableData" style="width: 100%" size='mini'>
            <el-table-column label="zk" width="180">
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.date }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
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

    <el-dialog title="新增zk" :visible.sync="dialogVisible" width="50%" :before-close="handleClose">
      <span>host</span>
      <span>port</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import zk from "../common/js/zookeeper.js";
export default {
  mounted() {
    console.log("mounted....");
    zk.connectZK(ret => {
      this.data = new Array();
      this.data.push(ret);
    });
  },
  data() {
    return {
      data: [
        {
          label: "一级 1",
          children: [
            {
              label: "二级 1-1",
              children: [
                {
                  label: "三级 1-1-1"
                }
              ]
            }
          ]
        }
      ],
      defaultProps: {
        children: "children",
        label: "label",
        path: "path"
      },
      dialogVisible: false,
      node: "",
      value: "",
      tableData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        }
      ]
    };
  },
  methods: {
    handleNodeClick(data) {
      console.log(data);
      console.log(data.path);
      zk.getNodeData(data.path, ret => {
        this.node = data.path;
        this.value = ret;
      });
    },
    addZK() {
      console.log("add zk,show setting popup");
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    handleEdit(index, row) {
      console.log(index, row);
    },
    handleDelete(index, row) {
      console.log(index, row);
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
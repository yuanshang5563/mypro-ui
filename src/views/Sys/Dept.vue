<template>
  <div class="container" style="width:99%;margin-top:-25px;">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
			<el-form-item>
				<el-input v-model="filters.deptName" placeholder="机构名称"></el-input>
			</el-form-item>
			<el-form-item>
        <el-button size="mini" type="primary" @click="findTreeData()">{{$t('action.search')}}</el-button>
			</el-form-item>
			<el-form-item>
				<kt-button :label="$t('action.add')" perms="ROLE_CORE_DEPT_ADD_EDIT" type="primary" @click="handleAdd"/>
			</el-form-item>
		</el-form>
	</div>
	<!--表格树内容栏-->
    <el-table :data="tableTreeDdata" stripe size="mini" style="width: 100%;" v-loading="loading" :element-loading-text="$t('action.loading')">
      <el-table-column prop="coreDeptId" header-align="center" align="center" width="80" label="ID"></el-table-column>
      <table-tree-column prop="deptName" header-align="center" treeKey="coreDeptId" parentKey="parentCoreDeptId" width="150" label="机构名称"></table-tree-column>
      <el-table-column prop="deptCode" header-align="center" align="center" label="机构代码"></el-table-column>
      <el-table-column prop="parentDeptName" header-align="center" align="center" width="120" label="上级机构"></el-table-column>
      <el-table-column prop="orderNum" header-align="center" align="center" label="排序"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="220" :label="$t('action.operation')">
        <template slot-scope="scope">
          <kt-button :label="$t('action.edit')" perms="ROLE_CORE_DEPT_ADD_EDIT" @click="handleEdit(scope.row)"/>
          <kt-button :label="$t('action.delete')" perms="ROLE_CORE_DEPT_DEL" type="danger" @click="handleDelete(scope.row)"/>
          <kt-button :label="$t('action.view')" perms="ROLE_CORE_DEPT_EDIT_VIEW" @click="handleView(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增修改界面 -->
    <el-dialog :title="dialogTitle" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="submitForm()" 
        label-width="80px" :size="size" style="text-align:left;">
        <el-form-item label="机构名称" prop="deptName">
          <el-input v-model="dataForm.deptName" :readonly="viewFlag"></el-input>
        </el-form-item>
        <el-form-item label="机构代码" prop="deptCode">
          <el-input v-model="dataForm.deptCode" :readonly="viewFlag"></el-input>
        </el-form-item>        
        <el-form-item label="上级机构" prop="parentDeptName">
            <popup-tree-input :data="popupTreeData" :props="popupTreeProps" :prop="dataForm.parentDeptName==null?'顶级节点':dataForm.parentDeptName" 
              :nodeKey="''+dataForm.parentCoreDeptId" :currentChangeHandle="handleTreeSelectChange" :disabled="viewFlag">
            </popup-tree-input>
        </el-form-item>
        <el-form-item label="排序编号" prop="orderNum">
          <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="0" label="排序编号" :disabled="viewFlag"></el-input-number>
        </el-form-item>
        <el-form-item label="机构描述" prop="deptDesc">
          <el-input v-model="dataForm.deptDesc" type="textarea" :readonly="viewFlag"></el-input>
        </el-form-item>               
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :size="size"  @click="dialogVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size"  type="primary" @click="submitForm()" v-show="!viewFlag">{{$t('action.comfirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import KtButton from "@/views/Core/KtButton"
import TableTreeColumn from '@/views/Core/TableTreeColumn'
import PopupTreeInput from "@/components/PopupTreeInput"
import FaIconTooltip from "@/components/FaIconTooltip"
import { format } from "@/utils/datetime"
export default {
	components:{
    PopupTreeInput,
    KtButton,
    TableTreeColumn,
    FaIconTooltip
	},
	data() {
		return {
			size: 'small',
			loading: false,
			filters: {
				deptName: ''
      },
      tableTreeDdata: [],
      dialogVisible: false,
      dialogTitle: '',
      viewFlag: false,
      dataForm: {
        coreDeptId: 0,
        deptName: '',
        parentCoreDeptId: null,
        deptCode: '',
        deptDesc:'',
        orderNum:0,
        parentDeptName: ''
      },
      dataRule: {
        deptName: [
          { required: true, message: '机构名称不能为空', trigger: 'blur' }
        ],
        deptCode: [
          { required: true, message: '机构代码不能为空', trigger: 'blur' }
        ],        
        parentDeptName: [
          { required: true, message: '上级机构不能为空', trigger: 'change' }
        ]
      },
      popupTreeData: [],
      popupTreeProps: {
				label: 'deptName',
				children: 'children'
			}
		}
	},
	methods: {
		// 获取数据
    findTreeData: function () {
      this.loading = true
			this.$api.dept.findDeptTree({deptName:this.filters.deptName}).then((res) => {
        this.tableTreeDdata = res.data
        this.popupTreeData = res.data
        this.loading = false
			})
    },
		// 显示新增界面
		handleAdd: function () {
      this.dialogVisible = true
      this.dialogTitle = "新增";
      this.viewFlag = false;      
			this.dataForm = {
        coreDeptId: 0,
        deptName: '',
        parentCoreDeptId: null,
        deptCode: '',
        deptDesc:'',
        orderNum:0,
        parentDeptName: ''
      }
		},
		// 显示编辑界面
		handleEdit: function (row) {
      this.dialogVisible = true
      this.dialogTitle = "编辑";
      this.viewFlag = false;
      let _this = this;
      this.$api.dept.find({coreDeptId:row.coreDeptId}).then(res => {
        Object.assign(_this.dataForm, res.data);
      });     
		},
    // 删除
    handleDelete (row) {
      this.$confirm('确认删除选中记录吗？', '提示', {
				type: 'warning'
      }).then(() => {
        this.$api.dept.del({coreDeptId:row.coreDeptId}).then( res => {
          this.findTreeData()
          this.$message({message: '删除成功', type: 'success'})
        })
      })
    },
 		// 显示查看界面
		handleView: function (row) {
      this.dialogVisible = true
      this.dialogTitle = "查看";
      this.viewFlag = true;
      let _this = this;
      this.$api.dept.find({coreDeptId:row.coreDeptId}).then(res => {
        Object.assign(_this.dataForm, res.data);
      });     
		},   
      // 机构树选中
    handleTreeSelectChange (data, node) {
      this.dataForm.parentCoreDeptId = data.coreDeptId
      this.dataForm.parentDeptName = data.deptName
    },
    // 表单提交
    submitForm () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.editLoading = true
						let params = Object.assign({}, this.dataForm)
						this.$api.dept.saveOrEdit(params).then((res) => {
              this.editLoading = false
              if(res.code == 200) {
								this.$message({ message: '操作成功', type: 'success' })
                this.dialogVisible = false
                this.$refs['dataForm'].resetFields()
							} else {
								this.$message({message: '操作失败, ' + res.msg, type: 'error'})
							}
							this.findTreeData()
						})
					})
				}
      })
    },
		// 时间格式化
    dateFormat: function (row, column, cellValue, index){
      return format(row[column.property])
    }
    
	},
	mounted() {
    this.findTreeData()
	}
}
</script>

<style scoped>

</style>
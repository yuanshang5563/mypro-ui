<template>
  <div class="container" style="width:99%;margin-top:-25px;">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
			<el-form-item>
				<el-input v-model="filters.dictGroupName" placeholder="字典组名称"></el-input>
			</el-form-item>
 			<el-form-item>
				<el-input v-model="filters.dictGroupCode" placeholder="字典组代码"></el-input>
			</el-form-item>     
			<el-form-item>
        <el-button size="mini" type="primary" @click="findTreeData()">{{$t('action.search')}}</el-button>
			</el-form-item>
			<el-form-item>
				<kt-button :label="$t('action.add')" perms="ROLE_CORE_DICTGROUP_ADD_EDIT" type="primary" @click="handleAdd"/>
			</el-form-item>
		</el-form>
	</div>
	<!--表格树内容栏-->
    <el-table :data="tableTreeDdata" stripe size="mini" style="width: 100%;" v-loading="loading" :element-loading-text="$t('action.loading')">
      <el-table-column prop="coreDictGroupId" header-align="center" align="center" width="80" label="ID"></el-table-column>
      <table-tree-column prop="dictGroupName" header-align="center" treeKey="coreDictGroupId" parentKey="parentCoreDictGroupId" width="300" label="字典组名称"></table-tree-column>
      <el-table-column prop="dictGroupCode" header-align="center" align="center" label="字典组代码"></el-table-column>
      <el-table-column prop="parentDictGroupNameName" header-align="center" align="center" width="120" label="上级字典组"></el-table-column>
      <el-table-column prop="orderNum" header-align="center" align="center" label="排序"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="220" :label="$t('action.operation')">
        <template slot-scope="scope">
          <kt-button :label="$t('action.edit')" perms="ROLE_CORE_DICTGROUP_ADD_EDIT" @click="handleEdit(scope.row)"/>
          <kt-button :label="$t('action.delete')" perms="ROLE_CORE_DICTGROUP_DEL" type="danger" @click="handleDelete(scope.row)"/>
          <kt-button :label="$t('action.view')" perms="ROLE_CORE_DICTGROUP_EDIT_VIEW" @click="handleView(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增修改界面 -->
    <el-dialog :title="dialogTitle" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="submitForm()" 
        label-width="100px" :size="size" style="text-align:left;">
        <el-form-item label="字典组名称" prop="dictGroupName">
          <el-input v-model="dataForm.dictGroupName" :readonly="viewFlag"></el-input>
        </el-form-item>
        <el-form-item label="字典组代码" prop="dictGroupCode">
          <el-input v-model="dataForm.dictGroupCode" :readonly="viewFlag"></el-input>
        </el-form-item>        
        <el-form-item label="上级字典组" prop="parentDictGroupNameName">
            <popup-tree-input :data="popupTreeData" :props="popupTreeProps" :prop="dataForm.parentDictGroupNameName==null?'顶级节点':dataForm.parentDictGroupNameName" 
              :nodeKey="''+dataForm.parentCoreDictGroupId" :currentChangeHandle="handleTreeSelectChange" :disabled="viewFlag">
            </popup-tree-input>
        </el-form-item>
        <el-form-item label="字典组描述" prop="dictGroupDesc">
          <el-input v-model="dataForm.dictGroupDesc" type="textarea" :readonly="viewFlag"></el-input>
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
        dictGroupName: '',
        dictGroupCode: ''
      },
      tableTreeDdata: [],
      dialogVisible: false,
      dialogTitle: '',
      viewFlag: false,
      dataForm: {
        coreDictGroupId: 0,
        dictGroupName: '',
        dictGroupCode: '',
        dictGroupDesc: '',
        parentCoreDictGroupId:null,
        parentDictGroupNameName: ''
      },
      dataRule: {
        dictGroupName: [
          { required: true, message: '字典组名称不能为空', trigger: 'blur' }
        ],
        dictGroupCode: [
          { required: true, message: '字典组代码不能为空', trigger: 'blur' }
        ],        
        parentDictGroupNameName: [
          { required: true, message: '上级字典组不能为空', trigger: 'change' }
        ]
      },
      popupTreeData: [],
      popupTreeProps: {
				label: 'dictGroupName',
				children: 'children'
			}
		}
	},
	methods: {
		// 获取数据
    findTreeData: function () {
      this.loading = true
			this.$api.dictGroup.findDictGroupTree({dictGroupName:this.filters.dictGroupName,dictGroupCode:this.filters.dictGroupCode}).then((res) => {
        this.tableTreeDdata = res.data;
        this.popupTreeData = res.data;
        this.loading = false
			})
    },
		// 显示新增界面
		handleAdd: function () {
      this.dialogVisible = true
      this.dialogTitle = "新增";
      this.viewFlag = false;      
			this.dataForm = {
        coreDictGroupId: 0,
        dictGroupName: '',
        dictGroupCode: '',
        dictGroupDesc: '',
        parentCoreDictGroupId:null,
        parentDictGroupNameName: ''
      }
		},
		// 显示编辑界面
		handleEdit: function (row) {
      this.dialogVisible = true
      this.dialogTitle = "编辑";
      this.viewFlag = false;
      let _this = this;
      this.$api.dictGroup.find({coreDictGroupId:row.coreDictGroupId}).then(res => {
        Object.assign(_this.dataForm, res.data);
      });     
		},
    // 删除
    handleDelete (row) {
      this.$confirm('确认删除选中记录吗？', '提示', {
				type: 'warning'
      }).then(() => {
        this.$api.dictGroup.del({coreDictGroupId:row.coreDictGroupId}).then( res => {
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
      this.$api.dictGroup.find({coreDictGroupId:row.coreDictGroupId}).then(res => {
        Object.assign(_this.dataForm, res.data);
      });     
		},   
      // 字典组树选中
    handleTreeSelectChange (data, node) {
      this.dataForm.parentCoreDictGroupId = data.coreDictGroupId
      this.dataForm.parentDictGroupNameName = data.dictGroupName
    },
    // 表单提交
    submitForm () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.editLoading = true
						let params = Object.assign({}, this.dataForm)
						this.$api.dictGroup.saveOrEdit(params).then((res) => {
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
    }
    
	},
	mounted() {
    this.findTreeData()
	}
}
</script>

<style scoped>

</style>
<template>
  <div class="container" style="width:99%;margin-top:-25px;">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
			<el-form-item>
				<el-input v-model="filters.dictCode" placeholder="字典码"></el-input>
			</el-form-item>
			<el-form-item>
				<el-input v-model="filters.dictValue" placeholder="字典值"></el-input>
			</el-form-item>	
			<el-form-item>
				<popup-tree-input 
					:data="groupData" 
					:props="groupTreeProps" 
					:prop="filters.dictGroupName" 
					:nodeKey="''+filters.coreDictGroupId" 
					:currentChangeHandle="filterGroupTreeCurrentChangeHandle" 
					:placeholder="filtersPlaceholder"
					:disabled="viewFlag">
				</popup-tree-input>
			</el-form-item>								
			<el-form-item>
				<kt-button :label="$t('action.search')" perms="ROLE_CORE_DICT_LIST" type="primary" @click="findPage()"/>
			</el-form-item>
			<el-form-item>
				<kt-button :label="$t('action.add')" perms="ROLE_CORE_DICT_ADD_EDIT" type="primary" @click="handleAdd" />
			</el-form-item>
		</el-form>
	</div>
	<!--表格内容栏-->
	<!--表格栏-->
	<el-table :data="pageResult" :highlight-current-row="true"
		v-loading="loading" :element-loading-text="$t('action.loading')" :border="false" :stripe="true"
		:show-overflow-tooltip="true" align="left" size="mini" style="width:100%;" >
	<el-table-column type="index" width="60" label="序号"></el-table-column>
	<el-table-column prop="dictCode" label="字典码" sortable="true"></el-table-column>
	<el-table-column prop="dictValue" label="字典值" sortable="true"></el-table-column>
	<el-table-column :label="$t('action.operation')" width="220" fixed="right" header-align="center" align="center">
		<template slot-scope="scope">
		<kt-button :label="$t('action.edit')" perms="ROLE_CORE_DICT_ADD_EDIT" :size="size" @click="handleEdit(scope.row)" />
		<kt-button :label="$t('action.delete')" perms="ROLE_CORE_DICT_DEL" :size="size" type="danger" @click="handleDelete(scope.row)" />
		<kt-button :label="$t('action.view')" perms="ROLE_CORE_DICT_EDIT_VIEW" :size="size" @click="handleView(scope.row)" />
		</template>
	</el-table-column>
	</el-table>
	<!--分页栏-->
	<div class="toolbar" style="padding:10px;">
	<el-pagination layout="total, prev, pager, next, jumper" @current-change="refreshPageRequest" 
		:current-page="pageRequest.pageNum" :page-size="pageRequest.pageSize" :total="total" style="float:right;">
	</el-pagination>
	</div>
	<!--新增编辑界面-->
	<el-dialog :title="dialogTitle" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
		<el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size" label-position="right">
			<el-form-item label="字典码" prop="dictCode">
				<el-input v-model="dataForm.dictCode" auto-complete="off" :readonly="viewFlag"></el-input>
			</el-form-item>
			<el-form-item label="字典值" prop="dictValue">
				<el-input v-model="dataForm.dictValue" auto-complete="off" :readonly="viewFlag"></el-input>
			</el-form-item>							
			<el-form-item label="字典组" prop="dictGroupName">
				<popup-tree-input 
					:data="groupData" 
					:props="groupTreeProps" 
					:prop="dataForm.dictGroupName" 
					:nodeKey="''+dataForm.coreDictGroupId" 
					:currentChangeHandle="groupTreeCurrentChangeHandle" 
					:disabled="viewFlag">
				</popup-tree-input>
			</el-form-item>			
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
			<el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading" v-show="!viewFlag">{{$t('action.submit')}}</el-button>
		</div>
	</el-dialog>
  </div>
</template>

<script>
import PopupTreeInput from "@/components/PopupTreeInput"
import KtButton from "@/views/Core/KtButton"
import { format,formatDate } from "@/utils/datetime"
export default {
	components:{
		PopupTreeInput,
		KtButton
	},
	data() {				
		return {
			size: 'small',
			filters: {
				dictCode: '',
				dictValue: '',
				coreDictGroupId: null,
				dictGroupName: ''
			},
			filtersPlaceholder:"字典组",
			pageRequest: { pageNum: 1, pageSize: 10 },
			total: 0,
			pageResult: [],
			loading: false, //加载标志
			dialogTitle: "", // 新增, 编辑，查看
			dialogVisible: false, // 新增编辑界面是否显示
			editLoading: false,
			viewFlag: false,//查看标志
			dataFormRules: {
				dictCode: [
					{ required: true, message: '请输入字典码', trigger: 'blur' }
				],
				dictValue: [
					{ required: true, message: '请输入字典值', trigger: 'blur' }
				]
			},
			// 新增编辑界面数据
			dataForm: {
				coreDictId: 0,
				dictCode: '',
				dictValue: '',
				coreDictGroupId: null,
				dictGroupName: ''
			},
			groupData: [],
			groupTreeProps: {
				label: 'dictGroupName',
				children: 'children'
			}
		}
	},
	methods: {
		// 获取分页数据
		findPage: function (data) {
			this.loading = true;
			let param = {pageNum:this.pageRequest.pageNum,pageSize:this.pageRequest.pageSize,dictCode:this.filters.dictCode,dictValue:this.filters.dictValue,coreDictGroupId:this.filters.coreDictGroupId};
			this.$api.dict.findPage(param).then((res) => {
				this.loading = false;
				this.pageResult = res.data.list;
				this.total= res.data.total
			})
		},	
		// 换页刷新
		refreshPageRequest: function (pageNum) {
			this.pageRequest.pageNum = pageNum
			this.findPage()
		},		
		// 删除
		handleDelete: function (row) {
			this.$confirm("确认删除选中记录吗？", "提示", {
				type: "warning"
			}).then(() => {
				this.$api.dict.del({coreDictId:row.coreDictId}).then(res => {
				this.findPage();
				this.$message({ message: "删除成功", type: "success" });
				});
			});				
		},
		// 显示新增界面
		handleAdd: function () {
			this.dialogVisible = true
			this.dialogTitle = "新增"
			this.viewFlag = false;
			this.dataForm = {
				coreDictId: 0,
				dictCode: '',
				dictValue: '',
				coreDictGroupId: null,
				dictGroupName: ''
			}
		},
		// 显示编辑界面
		handleEdit: function (row) {
			this.dialogVisible = true
			this.dialogTitle = "编辑"
			this.viewFlag = false;
			this.$api.dict.find({coreDictId:row.coreDictId}).then(res => {
				Object.assign(this.dataForm, res.data);			
			});	
		},
		// 显示查看界面
		handleView: function (row) {
			this.dialogVisible = true
			this.dialogTitle = "查看"
			this.viewFlag = true;
			this.$api.dict.find({coreDictId:row.coreDictId}).then(res => {
				Object.assign(this.dataForm, res.data);
			});	
		},
		// 编辑
		submitForm: function () {
			this.$refs.dataForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.editLoading = true;
						let params = Object.assign({}, this.dataForm);
						this.$api.dict.saveOrEdit(params).then((res) => {
							if(res.code == 200) {
								this.$message({ message: '操作成功', type: 'success' })
								this.dialogVisible = false;
								this.$refs['dataForm'].resetFields();
							} else {
								this.$message({message: '操作失败, ' + res.msg, type: 'error'})
							}
							this.findPage();
						});
						this.editLoading = false;
					})
				}
			})
		},		
		// 获取字典组列表
		findGroupTree: function () {
			this.$api.dictGroup.findDictGroupTree({}).then((res) => {
				this.groupData = res.data
			})
		},
		// 菜单树选中
      	groupTreeCurrentChangeHandle (data, node) {
        	this.dataForm.coreDictGroupId = data.coreDictGroupId
        	this.dataForm.dictGroupName = data.dictGroupName
		},
		// 搜索菜单树选中
      	filterGroupTreeCurrentChangeHandle (data, node) {
        	this.filters.coreDictGroupId = data.coreDictGroupId
        	this.filters.dictGroupName = data.dictGroupName
		}
	},
	mounted() {
		this.findPage();
		this.findGroupTree()
	}
}
</script>

<style scoped>

</style>
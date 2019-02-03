<template>
  <div class="container" style="width:99%;margin-top:-25px;">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
			<el-form-item>
				<el-input v-model="filters.paramName" placeholder="参数名称"></el-input>
			</el-form-item>	
			<el-form-item>
				<el-select v-model="filters.paramType" clearable placeholder="参数类型">
					<el-option v-for="item in paramTypeList" :key="item.dictCode" :label="item.dictValue" :value="item.dictCode"></el-option>
				</el-select>
			</el-form-item>				
			<el-form-item>
				<el-input v-model="filters.paramCode" placeholder="参数代码"></el-input>
			</el-form-item>				
			<el-form-item>
				<kt-button :label="$t('action.search')" perms="ROLE_CORE_PARAM_LIST" type="primary" @click="findPage()"/>
			</el-form-item>
			<el-form-item>
				<kt-button :label="$t('action.add')" perms="ROLE_CORE_PARAM_ADD_EDIT" type="primary" @click="handleAdd" />
			</el-form-item>
		</el-form>
	</div>
	<!--表格内容栏-->
	<!--表格栏-->
	<el-table :data="pageResult" :highlight-current-row="true"
		v-loading="loading" :element-loading-text="$t('action.loading')" :border="false" :stripe="true"
		:show-overflow-tooltip="true" align="left" size="mini" style="width:100%;" >
	<el-table-column type="index" width="60" label="序号"></el-table-column>
	<el-table-column prop="paramName" label="参数名称" sortable="true"></el-table-column>
	<el-table-column prop="paramType" label="参数类型" sortable="true" :formatter="paramTypeFormat"></el-table-column>
	<el-table-column prop="paramCode" label="参数代码" sortable="true"></el-table-column>
	<el-table-column prop="paramValue" label="参数值" sortable="true"></el-table-column>
	<el-table-column prop="createdTime" label="创建时间" sortable="true" :formatter="dateFormat"></el-table-column>
	<el-table-column prop="modifiedTime" label="修改时间" sortable="true" :formatter="dateFormat"></el-table-column>
	<el-table-column :label="$t('action.operation')" width="220" fixed="right" header-align="center" align="center">
		<template slot-scope="scope">
		<kt-button :label="$t('action.edit')" perms="ROLE_CORE_PARAM_ADD_EDIT" :size="size" @click="handleEdit(scope.row)" />
		<kt-button :label="$t('action.delete')" perms="ROLE_CORE_PARAM_DEL" :size="size" type="danger" @click="handleDelete(scope.row)" />
		<kt-button :label="$t('action.view')" perms="ROLE_CORE_PARAM_EDIT_VIEW" :size="size" @click="handleView(scope.row)" />
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
			<el-form-item label="参数名称" prop="paramName">
				<el-input v-model="dataForm.paramName" auto-complete="off" :readonly="viewFlag"></el-input>
			</el-form-item>
			<el-form-item label="参数类型" prop="paramType">
				<el-select v-model="dataForm.paramType" clearable placeholder="请选择" style="width:100%" :disabled="viewFlag">
					<el-option v-for="item in paramTypeList" :key="item.dictCode" :label="item.dictValue" :value="item.dictCode"></el-option>
				</el-select>
			</el-form-item>								
			<el-form-item label="参数代码" prop="paramCode">
				<el-input v-model="dataForm.paramCode" auto-complete="off" :readonly="viewFlag"></el-input>
			</el-form-item>
			<el-form-item label="参数值" prop="paramValue">
				<el-input v-model="dataForm.paramValue" auto-complete="off" :readonly="viewFlag"></el-input>
			</el-form-item>
			<el-form-item label="参数描述" prop="paramDesc">
				<el-input v-model="dataForm.paramDesc" type="textarea" :readonly="viewFlag"></el-input>
			</el-form-item>						

			<el-form-item label="创建时间" prop="createdTime" v-show="viewFlag">
				<el-date-picker v-model="dataForm.createdTime" type="datetime" auto-complete="off" style="width:100%" :readonly="true"></el-date-picker>
			</el-form-item>
			<el-form-item label="修改时间" prop="modifiedTime" v-show="viewFlag">
				<el-date-picker v-model="dataForm.modifiedTime" type="datetime" auto-complete="off" style="width:100%" :readonly="true"></el-date-picker>
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
import { mapState } from 'vuex'
import PopupTreeInput from "@/components/PopupTreeInput"
import KtButton from "@/views/Core/KtButton"
import { format,formatDate } from "@/utils/datetime"
import { formatParamType } from "@/utils/dictUtil"
export default {
	components:{
		PopupTreeInput,
		KtButton
	},
	data() {				
		return {
			size: 'small',
			filters: {
				paramName: '',
				paramCode: '',
				paramType: ''
			},
			pageRequest: { pageNum: 1, pageSize: 10 },
			total: 0,
			pageResult: [],
			loading: false, //加载标志
			dialogTitle: "", // 新增, 编辑，查看
			dialogVisible: false, // 新增编辑界面是否显示
			editLoading: false,
			viewFlag: false,//查看标志
			dataFormRules: {
				paramName: [
					{ required: true, message: '请输入参数名称', trigger: 'blur' }
				],
				paramType: [
					{ required: true, message: '请选择参数类型', trigger: 'blur' }
				],
				paramCode: [
					{ required: true, message: '请输入参数代码', trigger: 'blur' }
				]
			},
			// 新增编辑界面数据
			dataForm: {
				coreParamId: 0,
				paramName: '',
				paramType: '',
				paramCode: '',
				paramValue: '',
				paramDesc: '',
				createdTime: null,
				modifiedTime: null
			}
		}
	},
	methods: {
		// 获取分页数据
		findPage: function (data) {
			this.loading = true;
			let param = {pageNum:this.pageRequest.pageNum,pageSize:this.pageRequest.pageSize,paramName:this.filters.paramName,paramCode:this.filters.paramCode,paramType:this.filters.paramType};
			this.$api.param.findPage(param).then((res) => {
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
				this.$api.param.del({coreParamId:row.coreParamId}).then(res => {
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
				coreParamId: 0,
				paramName: '',
				paramType: '',
				paramCode: '',
				paramValue: '',
				paramDesc: '',
				createdTime: new Date(),
				modifiedTime: new Date()
			}
		},
		// 显示编辑界面
		handleEdit: function (row) {
			this.dialogVisible = true
			this.dialogTitle = "编辑"
			this.viewFlag = false;
			let _this = this;
			this.$api.param.find({coreParamId:row.coreParamId}).then(res => {
				Object.assign(_this.dataForm, res.data);				
			});	
		},
		// 显示查看界面
		handleView: function (row) {
			this.dialogVisible = true
			this.dialogTitle = "查看"
			this.viewFlag = true;
			let _this = this;
			this.$api.param.find({coreParamId:row.coreParamId}).then(res => {
				Object.assign(_this.dataForm, res.data);
			});	
		},	
		// 编辑
		submitForm: function () {
			this.$refs.dataForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.editLoading = true;
						let params = Object.assign({}, this.dataForm);
						this.$api.param.saveOrEdit(params).then((res) => {
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
		// 时间格式化
      	dateFormat: function (row, column, cellValue, index){
          	return format(row[column.property])
      	},
		// 参数类型格式化
      	paramTypeFormat: function (row, column, cellValue, index){
			let paramTypeList = this.$store.state.dict.paramType;
          	return formatParamType(row,paramTypeList);
      	}
	},
	computed: {
		...mapState({
			paramTypeList: state=>state.dict.paramType,
		})
	},	
	mounted() {
		this.findPage();
	}
}
</script>

<style scoped>

</style>
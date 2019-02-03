<template>
  <div class="container" style="width:99%;margin-top:-25px;">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
			<el-form-item>
				<el-input v-model="filters.userName" placeholder="真实姓名"></el-input>
			</el-form-item>
			<el-form-item>
				<el-input v-model="filters.realName" placeholder="用户名"></el-input>
			</el-form-item>			
			<el-form-item>
				<el-select v-model="filters.sex" clearable placeholder="性别">
					<el-option v-for="item in sexList" :key="item.dictCode" :label="item.dictValue" :value="item.dictCode"></el-option>
				</el-select>
			</el-form-item>		
			<el-form-item>
				<popup-tree-input 
					:data="deptData" 
					:props="deptTreeProps" 
					:prop="filters.deptName" 
					:nodeKey="''+filters.coreDeptId" 
					:currentChangeHandle="filtersDeptTreeCurrentChangeHandle" 
					:placeholder="filtersPlaceholder"
					:disabled="viewFlag">
				</popup-tree-input>				
			</el-form-item>		
			<el-form-item>
				<kt-button :label="$t('action.search')" perms="ROLE_CORE_USER_LIST" type="primary" @click="findPage()"/>
			</el-form-item>
			<el-form-item>
				<kt-button :label="$t('action.add')" perms="ROLE_CORE_USER_ADD_EDIT" type="primary" @click="handleAdd" />
			</el-form-item>
		</el-form>
	</div>
	<!--表格内容栏-->
	<!--表格栏-->
	<el-table :data="pageResult" :highlight-current-row="true" @selection-change="selectionChange"
		v-loading="loading" :element-loading-text="$t('action.loading')" :border="false" :stripe="true"
		:show-overflow-tooltip="true" align="left" size="mini" style="width:100%;" >
	<el-table-column type="index" width="60" label="序号"></el-table-column>
	<el-table-column prop="userName" label="用户名" sortable="true"></el-table-column>
	<el-table-column prop="realName" label="真实姓名" sortable="true"></el-table-column>
	<el-table-column prop="sex" label="性别" sortable="true" :formatter="sexFormat"></el-table-column>
	<el-table-column prop="birthday" label="生日" sortable="true" :formatter="birthdayFormat"></el-table-column>
	<el-table-column prop="mobile" label="手机" sortable="true"></el-table-column>
	<el-table-column prop="email" label="邮箱" sortable="true" width="220"></el-table-column>
	<el-table-column prop="status" label="是否禁用" sortable="true" :formatter="statusFormat"></el-table-column>
	<!--
	<el-table-column prop="createdTime" label="创建时间" sortable="true" :formatter="dateFormat"></el-table-column>
	<el-table-column prop="modifiedTime" label="修改时间" sortable="true" :formatter="dateFormat"></el-table-column>
	-->
	<el-table-column :label="$t('action.operation')" width="320" fixed="right" header-align="center" align="center">
		<template slot-scope="scope">
		<kt-button :label="$t('action.edit')" perms="ROLE_CORE_USER_ADD_EDIT" :size="size" @click="handleEdit(scope.row)" />
		<kt-button :label="$t('action.delete')" perms="ROLE_CORE_USER_DEL" :size="size" type="danger" @click="handleDelete(scope.row)" />
		<kt-button :label="$t('action.view')" perms="ROLE_CORE_USER_EDIT_VIEW" :size="size" @click="handleView(scope.row)" />
		<kt-button :label="$t('action.resetPass')" perms="ROLE_CORE_USER_RESET" :size="size" type="info" @click="handleResetPass(scope.row)" />
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
			<el-form-item label="用户名" prop="userName">
				<el-input v-model="dataForm.userName" auto-complete="off" :readonly="viewFlag"></el-input>
			</el-form-item>
			<el-form-item label="密码" prop="password" v-show="dialogTitle=='新增'">
				<el-input v-model="dataForm.password" type="password" auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="真实姓名" prop="realName">
				<el-input v-model="dataForm.realName" auto-complete="off" :readonly="viewFlag"></el-input>
			</el-form-item>	
			<el-form-item label="性别" prop="sex">
				<el-select v-model="dataForm.sex" clearable placeholder="请选择" style="width:100%" :disabled="viewFlag">
					<el-option v-for="item in sexList" :key="item.dictCode" :label="item.dictValue" :value="item.dictCode"></el-option>
				</el-select>
			</el-form-item>	
			<el-form-item label="生日" prop="birthday">
    			<el-date-picker v-model="dataForm.birthday" type="date" format="yyyy-MM-dd" placeholder="选择日期" style="width:100%" :readonly="viewFlag"></el-date-picker>
			</el-form-item>								
			<el-form-item label="机构" prop="deptName">
				<popup-tree-input 
					:data="deptData" 
					:props="deptTreeProps" 
					:prop="dataForm.deptName" 
					:nodeKey="''+dataForm.coreDeptId" 
					:currentChangeHandle="deptTreeCurrentChangeHandle" 
					:disabled="viewFlag">
				</popup-tree-input>
			</el-form-item>
			<el-form-item label="邮箱" prop="email">
				<el-input v-model="dataForm.email" auto-complete="off" :readonly="viewFlag"></el-input>
			</el-form-item>
			<el-form-item label="手机" prop="mobile">
				<el-input v-model="dataForm.mobile" auto-complete="off" :readonly="viewFlag"></el-input>
			</el-form-item>
			<el-form-item label="是否禁用" prop="status">
				<el-select v-model="dataForm.status" clearable placeholder="请选择" style="width:100%" :disabled="viewFlag">
					<el-option v-for="item in statusList" :key="item.dictCode" :label="item.dictValue" :value="item.dictCode"></el-option>
				</el-select>
			</el-form-item>	
			<el-form-item label="用户描述" prop="comment">
				<el-input v-model="dataForm.comment" type="textarea" :readonly="viewFlag"></el-input>
			</el-form-item>						
			<el-form-item label="角色" prop="userRoles">
				<el-select v-model="dataForm.userRoles" multiple placeholder="请选择" style="width: 100%;" :disabled="viewFlag">
					<el-option v-for="item in roles" :key="item.coreRoleId" :label="item.roleName" :value="item.coreRoleId"></el-option>
				</el-select>
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
	<!--新增编辑界面-->
	<el-dialog title="重置密码" width="40%" :visible.sync="resetDialogVisible" :close-on-click-modal="false">
		<el-form :model="resetDataForm" label-width="80px" :rules="resetDataFormRules" ref="resetDataForm" :size="size" label-position="right">
			<el-form-item label="密码" prop="password">
				<el-input v-model="resetDataForm.password" type="password" auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="确认密码" prop="confirmPassword">
				<el-input v-model="resetDataForm.confirmPassword" type="password" auto-complete="off"></el-input>
			</el-form-item>						
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button :size="size" @click.native="resetDialogVisible = false">{{$t('action.cancel')}}</el-button>
			<el-button :size="size" type="primary" @click.native="submitRestPassForm">{{$t('action.submit')}}</el-button>
		</div>		
	</el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import PopupTreeInput from "@/components/PopupTreeInput"
import KtButton from "@/views/Core/KtButton"
import { format,formatDate } from "@/utils/datetime"
import { isEmail,isMobile } from "@/utils/validate"
import { formatSex,formatCoreUserStatus } from "@/utils/dictUtil"
export default {
	components:{
		PopupTreeInput,
		KtButton
	},
	data() {
		var validateMobile = (rule, value, callback) => {
			if (value === '') {
				callback(new Error('请输入手机'));
			} else if (!isMobile(this.dataForm.mobile)){
				callback(new Error('手机号码格式错误'));
			} else {
				callback();
			}
		};	
		var validateEmail = (rule, value, callback) => {
			if (value === '') {
				callback(new Error('请输入邮箱'));
			} else if (!isEmail(this.dataForm.email)){
				callback(new Error('邮箱格式错误'));
			} else {
				callback();
			}
		};		
		var validateConfirmPass = (rule, value, callback) => {
			if (value === '') {
				callback(new Error('请输入确认密码'));
			} else if (value !== this.resetDataForm.password) {
				callback(new Error('两次输入密码不一致!'));
			} else {
				callback();
			}
		};				
		return {
			size: 'small',
			filters: {
				userName: '',
				sex: '',
				realName: '',
				coreDeptId: null,
				deptName: ''
			},
			filtersPlaceholder:"机构",
			pageRequest: { pageNum: 1, pageSize: 10 },
			total: 0,
			pageResult: [],
			loading: false, //加载标志
			dialogTitle: "", // 新增, 编辑，查看
			dialogVisible: false, // 新增编辑界面是否显示
			editLoading: false,
			viewFlag: false,//查看标志
			dataFormRules: {
				userName: [
					{ required: true, message: '请输入用户名', trigger: 'blur' }
				],
				password: [
					{ required: true, message: '请输入密码', trigger: 'blur' }
				],				
				realName: [
					{ required: true, message: '请输入姓名', trigger: 'blur' }
				],
				sex: [
					{ required: true, message: '请选择性别', trigger: 'blur' }
				],
				deptName: [
					{ required: true, message: '请选择机构', trigger: 'blur' }
				],
				mobile: [
					{ validator: validateMobile, trigger: 'blur' }
				],
				email: [
					{ validator: validateEmail, trigger: 'blur' }
				],				
				status: [
					{ required: true, message: '请选择激活状态', trigger: 'blur' }
				]
			},
			// 新增编辑界面数据
			dataForm: {
				coreUserId: 0,
				userName: '',
				password: '',
				realName: '',
				sex: 'sex.0',
				birthday: null,
				mobile: '',
				email: '',
				comment: '',
				status: '0',
				coreDeptId: null,
				createdTime: null,
				modifiedTime: null,
				deptName: '',
				userRoles: []
			},
			deptData: [],
			deptTreeProps: {
				label: 'deptName',
				children: 'children'
			},
			roles: [],
			resetDialogVisible: false,
			resetDataForm: {
				coreUserId: 0,
				password: '',
				confirmPassword: ''
			},
			resetDataFormRules:{
				password: [
					{ required: true, message: '请输入新密码', trigger: 'blur' }
				],	
				confirmPassword: [
					{ validator: validateConfirmPass, trigger: 'blur' }
				]								
			}
		}
	},
	methods: {
		// 获取分页数据
		findPage: function (data) {
			this.loading = true;
			let param = {pageNum:this.pageRequest.pageNum,pageSize:this.pageRequest.pageSize,userName:this.filters.userName,
			realName:this.filters.realName,sex:this.filters.sex,coreDeptId:this.filters.coreDeptId};
			this.$api.user.findPage(param).then((res) => {
				this.loading = false;
				this.pageResult = res.data.list;
				this.total= res.data.total
				this.findUserRoles()
			})
		},
		// 选择切换
		selectionChange: function (selections) {
			this.selections = selections
		},		
		// 换页刷新
		refreshPageRequest: function (pageNum) {
			this.pageRequest.pageNum = pageNum
			this.findPage()
		},		
		// 加载用户角色信息
		findUserRoles: function () {
			this.$api.role.findAll().then((res) => {
				// 加载角色集合
				this.roles = res.data	
			})
		},
		// 删除
		handleDelete: function (row) {
			this.$confirm("确认删除选中记录吗？", "提示", {
				type: "warning"
			}).then(() => {
				this.$api.user.del({coreUserId:row.coreUserId}).then(res => {
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
				coreUserId: 0,
				userName: '',
				password: '',
				realName: '',
				sex: 'sex.0',
				birthday: null,
				mobile: '',
				email: '',
				comment: '',
				status: '0',
				coreDeptId: null,
				createdTime: new Date(),
				modifiedTime: new Date(),
				deptName: '',
				userRoles: []
			}
		},
		// 显示编辑界面
		handleEdit: function (row) {
			this.dialogVisible = true
			this.dialogTitle = "编辑"
			this.viewFlag = false;
			let _this = this;
			this.$api.user.find({coreUserId:row.coreUserId}).then(res => {
				Object.assign(_this.dataForm, res.data);
				let userRoles = []
				for(let i=0,len=res.data.userRoles.length; i<len; i++) {
					userRoles.push(res.data.userRoles[i].coreRoleId)
				}
				this.dataForm.userRoles = userRoles;				
			});	
		},
		// 显示查看界面
		handleView: function (row) {
			this.dialogVisible = true
			this.dialogTitle = "查看"
			this.viewFlag = true;
			let _this = this;
			this.$api.user.find({coreUserId:row.coreUserId}).then(res => {
				Object.assign(_this.dataForm, res.data);
				let userRoles = []
				for(let i=0,len=res.data.userRoles.length; i<len; i++) {
					userRoles.push(res.data.userRoles[i].coreRoleId)
				}
				this.dataForm.userRoles = userRoles;
			});	
		},
		handleResetPass: function (row) {
			this.resetDialogVisible = true;
			this.resetDataForm.coreUserId=row.coreUserId;
			this.resetDataForm.password='';
			this.resetDataForm.confirmPassword='';
		},	
		// 编辑
		submitForm: function () {
			this.$refs.dataForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.editLoading = true;
						let params = Object.assign({}, this.dataForm);
						let userRoles = [];
						for(let i=0,len=params.userRoles.length; i<len; i++) {
							let userRole = {
								coreUserId: params.coreUserId,
								coreRoleId: params.userRoles[i]
							};
							userRoles.push(userRole);
						}
						//params.birthday=formatDate(params.birthday);
						params.userRoles = userRoles;
						this.$api.user.saveOrEdit(params).then((res) => {
							this.editLoading = false;
							if(res.code == 200) {
								this.$message({ message: '操作成功', type: 'success' })
								this.dialogVisible = false;
								this.$refs['dataForm'].resetFields();
							} else {
								this.$message({message: '操作失败, ' + res.msg, type: 'error'})
							}
							this.findPage();
						});
					})
				}
			})
		},
		submitRestPassForm: function (){
			this.$refs.resetDataForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						let params = Object.assign({}, this.resetDataForm);
						this.$api.user.resetPass(params).then((res) => {
							if(res.code == 200) {
								this.$message({ message: '操作成功', type: 'success' })
								this.resetDialogVisible = false;
								this.$refs['resetDataForm'].resetFields();
							} else {
								this.$message({message: '操作失败, ' + res.msg, type: 'error'})
							}						
						})
					})
				}
			})
		},		
		// 获取部门列表
		findDeptTree: function () {
			this.$api.dept.findDeptTree({}).then((res) => {
				this.deptData = res.data
			})
		},
		// 部门树选中
      	deptTreeCurrentChangeHandle (data, node) {
        	this.dataForm.coreDeptId = data.coreDeptId
        	this.dataForm.deptName = data.deptName
		},
		// 搜索部门树选中
      	filtersDeptTreeCurrentChangeHandle (data, node) {
        	this.filters.coreDeptId = data.coreDeptId
        	this.filters.deptName = data.deptName
		},
		// 时间格式化
      	dateFormat: function (row, column, cellValue, index){
          	return format(row[column.property])
      	},
		// 时间格式化
      	birthdayFormat: function (row, column, cellValue, index){
          	return formatDate(row[column.property])
      	},
		// 性别格式化
      	sexFormat: function (row, column, cellValue, index){
			let sexList = this.$store.state.dict.sex;
          	return formatSex(row,sexList);
      	},
		// 状态格式化
      	statusFormat: function (row, column, cellValue, index){
			let statusList = this.$store.state.dict.coreUserStatus;
          	return formatCoreUserStatus(row,statusList);
      	}
	},
	computed: {
		...mapState({
			sexList: state=>state.dict.sex,
			statusList: state=>state.dict.coreUserStatus
		})
	},	
	mounted() {
		this.findPage();
		this.findDeptTree()
	}
}
</script>

<style scoped>

</style>
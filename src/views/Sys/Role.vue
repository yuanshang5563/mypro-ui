<template>
  <div class="container" style="width:99%;margin-top:-25px;">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
			<el-form-item>
				<el-input v-model="filters.roleName" placeholder="角色名"></el-input>
			</el-form-item>
			<el-form-item>
				<kt-button :label="$t('action.search')" perms="ROLE_CORE_ROLE_LIST" type="primary" @click="findPage()"/>
			</el-form-item>
			<el-form-item>
				<kt-button :label="$t('action.add')" perms="ROLE_CORE_ROLE_ADD_EDIT" type="primary" @click="handleAdd" />
			</el-form-item>
		</el-form>
	</div>
	<!--表格内容栏-->
	<!--表格栏-->
	<el-table :data="pageResult" :highlight-current-row="true" @selection-change="selectionChange" @current-change="handleCurrentChange"
		v-loading="loading" :element-loading-text="$t('action.loading')" :border="false" :stripe="true"
		:show-overflow-tooltip="true" align="left" size="mini" style="width:100%;" >
	<el-table-column type="index" width="60" label="序号"></el-table-column>
	<el-table-column prop="roleName" label="角色名" sortable="true"></el-table-column>
	<el-table-column prop="role" label="角色" sortable="true"></el-table-column>
	<el-table-column prop="createdTime" label="创建时间" sortable="true" :formatter="dateFormat"></el-table-column>
	<el-table-column prop="modifiedTime" label="修改时间" sortable="true" :formatter="dateFormat"></el-table-column>
	<el-table-column :label="$t('action.operation')" width="240" fixed="right" header-align="center" align="center">
		<template slot-scope="scope">
		<kt-button :label="$t('action.edit')" perms="ROLE_CORE_ROLE_ADD_EDIT" :size="size" @click="handleEdit(scope.row)" />
		<kt-button :label="$t('action.delete')" perms="ROLE_CORE_ROLE_DEL" :size="size" type="danger" @click="handleDelete(scope.row)" />
		<kt-button :label="$t('action.view')" perms="ROLE_CORE_ROLE_EDIT_VIEW" :size="size" @click="handleView(scope.row)" />
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
		<el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size">
			<el-form-item label="角色名" prop="roleName">
				<el-input v-model="dataForm.roleName" auto-complete="off" :readonly="viewFlag"></el-input>
			</el-form-item>
			<el-form-item label="角色" prop="role">
				<el-input v-model="dataForm.role" auto-complete="off" :readonly="viewFlag"></el-input>
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
	<!--角色菜单，表格树内容栏-->
	<div class="menu-container">
		<div class="menu-header">
			<span><B>角色菜单授权</B></span>
		</div>
		<el-tree :data="menuData" size="mini" show-checkbox node-key="coreMenuId" :props="defaultProps"
			style="width: 100%;pading-top:20px;" ref="menuTree" :render-content="renderContent"
			v-loading="menuLoading" :element-loading-text="$t('action.loading')" :check-strictly="true"
			@check-change="handleMenuCheckChange">
		</el-tree>
		<div style="float:left;padding-left:24px;padding-top:12px;padding-bottom:4px;">
			<el-checkbox v-model="checkAll" @change="handleCheckAll" :disabled="this.selectRole.coreRoleId == null"><b>全选</b></el-checkbox>
		</div>
		<div style="float:right;padding-right:15px;padding-top:4px;padding-bottom:4px;">
			<el-button size="mini" type="primary" @click="resetSelection"
				:disabled="this.selectRole.coreRoleId == null">{{$t('action.reset')}}</el-button>
			<kt-button :label="$t('action.submit')" perms="ROLE_CORE_ROLE_MENU_SAVE" type="primary" @click="submitAuthForm" 
				:disabled="this.selectRole.coreRoleId == null" :loading="authLoading"/>
		</div>
	</div>
  </div>
</template>

<script>
import KtButton from "@/views/Core/KtButton"
import TableTreeColumn from '@/views/Core/TableTreeColumn'
import { format } from "@/utils/datetime"
export default {
	components:{
		KtButton,
		TableTreeColumn
	},
	data() {
		return {
			size: 'small',
			filters: {
				roleName: ''
			},
			pageRequest: { pageNum: 1, pageSize: 10 },
			total: 0,
			pageResult: [],
			loading: false, //加载标志
			selections: [],  // 列表选中列
			dialogTitle: "", // 新增, 编辑，查看
			dialogVisible: false, // 新增编辑界面是否显示
			editLoading: false,
			viewFlag: false,//查看标志
			dataFormRules: {
				roleName: [
					{ required: true, message: '请输入角色名', trigger: 'blur' }
				],
				role: [
					{ required: true, message: '请输入角色', trigger: 'blur' }
				]				
			},
			// 新增编辑界面数据
			dataForm: {
				coreRoleId: 0,
				roleName: '',
				role: '',
				createdTime: null,
				modifiedTime: null
			},
			selectRole: {},
			menuData: [],
			menuSelections: [],
			menuLoading: false,
			authLoading: false,
			checkAll: false,
			currentRoleMenus: [],
			defaultProps: {
				children: 'children',
				label: 'roleName'
			}
		}
	},
	methods: {
		// 获取分页数据
		findPage: function () {
			this.loading = true;
			let param = {pageNum:this.pageRequest.pageNum,pageSize:this.pageRequest.pageSize,roleName:this.filters.roleName};
			this.$api.role.findPage(param).then((res) => {
				this.loading = false;
				this.pageResult = res.data.list;
				this.total= res.data.total
				this.findTreeData();
			});
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
		// 删除
		handleDelete: function (row) {
			this.$confirm("确认删除选中记录吗？", "提示", {
				type: "warning"
			}).then(() => {
				this.$api.role.del({coreRoleId:row.coreRoleId}).then(res => {
				this.findPage();
				this.$message({ message: "删除成功", type: "success" });
				});
			});			
		},
		// 显示新增界面
		handleAdd: function () {
			this.dialogVisible = true
			this.dialogTitle = "新增";
			this.viewFlag = false;
			this.dataForm = {
				coreRoleId: 0,
				roleName: '',
				role: '',
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
			this.$api.role.find({coreRoleId:row.coreRoleId}).then(res => {
				Object.assign(_this.dataForm, res.data);
			});			
		},
		// 编辑
		submitForm: function () {
			this.$refs.dataForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.editLoading = true
						let params = Object.assign({}, this.dataForm)
						this.$api.role.saveOrEdit(params).then((res) => {
							this.editLoading = false
							if(res.code == 200) {
								this.$message({ message: '操作成功', type: 'success' })
								this.dialogVisible = false
								this.$refs['dataForm'].resetFields()
							} else {
								this.$message({message: '操作失败, ' + res.msg, type: 'error'})
							}
							this.findPage()
						})
					})
				}
			})
		},
		// 显示查看界面
		handleView: function (row) {
			this.dialogVisible = true;
			this.dialogTitle = "查看"
			this.viewFlag = true;
			let _this = this;
			this.$api.role.find({coreRoleId:row.coreRoleId}).then(res => {
				Object.assign(_this.dataForm, res.data);
			});			
		},		
		// 获取数据
		findTreeData: function () {
			this.menuLoading = true
			this.$api.menu.findCoreMenuTree({menuName:''}).then((res) => {
				this.menuData = res.data
				this.menuLoading = false
			})
		},
		// 角色选择改变监听
		handleCurrentChange: function (val) {
			if(val == null) {
				return
			}
			this.selectRole = val
			this.$api.role.findRoleMenus({'coreRoleId':val.coreRoleId}).then((res) => {
				this.currentRoleMenus = res.data
				this.$refs.menuTree.setCheckedNodes(res.data)
			})
		},
		// 树节点选择监听
		handleMenuCheckChange(data, check, subCheck) {
			if(check) {
				// 节点选中时同步选中父节点
				let parentCoreMenuId = data.parentCoreMenuId
				this.$refs.menuTree.setChecked(parentCoreMenuId, true, false)
			} else {
				// 节点取消选中时同步取消选中子节点
				if(data.children != null) {
					data.children.forEach(element => {
						this.$refs.menuTree.setChecked(element.coreMenuId, false, false)
					});
				}
			}
		},
		// 重置选择
		resetSelection() {
			this.checkAll = false
			this.$refs.menuTree.setCheckedNodes(this.currentRoleMenus)
		},
		// 全选操作
		handleCheckAll() {
			if(this.checkAll) {
				let allMenus = []
				this.checkAllMenu(this.menuData, allMenus)
				this.$refs.menuTree.setCheckedNodes(allMenus)
			} else {
				this.$refs.menuTree.setCheckedNodes([])
			}
		},
		// 递归全选
		checkAllMenu(menuData, allMenus) {
			menuData.forEach(menu => {
				allMenus.push(menu)
				if(menu.children) {
					this.checkAllMenu(menu.children, allMenus)
				}
			});
		},
		// 角色菜单授权提交
		submitAuthForm() {
			let coreRoleId = this.selectRole.coreRoleId
			if('superadmin' == this.selectRole.role) {
				this.$message({message: '超级管理员拥有所有菜单权限，不允许修改！', type: 'error'})
				//return
			}
			this.authLoading = true
			let checkedNodes = this.$refs.menuTree.getCheckedNodes(false, true)
			let roleMenus = []
			for(let i=0, len=checkedNodes.length; i<len; i++) {
				let roleMenu = { coreRoleId:coreRoleId, coreMenuId:checkedNodes[i].coreMenuId }
				roleMenus.push(roleMenu)
			}
			this.$api.role.saveRoleMenus(roleMenus).then((res) => {
				if(res.code == 200) {
					this.$message({ message: '操作成功', type: 'success' })
				} else {
					this.$message({message: '操作失败, ' + res.msg, type: 'error'})
				}
				this.authLoading = false
			})
		},
		renderContent(h, { node, data, store }) {
			return (
			<div class="column-container">
				<span style="text-algin:center;margin-right:80px;">{data.menuName}</span>
				<span style="text-algin:center;margin-right:80px;">
					<el-tag type={data.menuType == '0'?'':data.menuType == '1'?'success':'info'} size="small">
						{data.menuType == '0'?'目录':data.menuType == '1'?'菜单':'按钮'}
					</el-tag>
				</span>
				<span style="text-algin:center;margin-right:80px;"> <i class={data.icon}></i></span>
				<span style="text-algin:center;margin-right:80px;">{data.parentmenuName?data.parentmenuName:'顶级菜单'}</span>
				<span style="text-algin:center;margin-right:80px;">{data.menuUrl?data.menuUrl:'\t'}</span>
			</div>);
      	},
		// 时间格式化
      	dateFormat: function (row, column, cellValue, index){
          	return format(row[column.property])
      	}
		
	},
	mounted() {
		this.findPage();
	}
}
</script>
<style scoped>
.menu-container {
	margin-top: 10px;
}
.menu-header {
	padding-left: 8px;
	padding-bottom: 5px;
	text-align: left;
	font-size: 16px;
	color: rgb(20, 89, 121);
	
}
</style>
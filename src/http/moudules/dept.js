import axios from '../axios'

/* 
 * 机构管理模块
 */

// 保存
export const saveOrEdit = (data) => {
    return axios({
        url: '/coreAdmins/sys/coreDept/saveOrEdit',
        method: 'post',
        data
    })
}
// 删除
export const del = (params) => {
    return axios({
        url: '/coreAdmins/sys/coreDept/delete',
        method: 'delete',
        params
    })
}
// 查询机构
export const find = (params) => {
    return axios({
        url: '/coreAdmins/sys/coreDept/find',
        method: 'get',
        params
    })
}
// 查询机构树
export const findDeptTree = (data) => {
    return axios({
        url: '/coreAdmins/sys/coreDept/findTree',
        method: 'post',
        data
    })
}
import axios from '../axios'

/* 
 * 角色管理模块
 */

// 保存
export const saveOrEdit = (data) => {
    return axios({
        url: '/coreAdmins/sys/coreRole/saveOrEdit',
        method: 'post',
        data
    })
}
// 删除
export const del = (params) => {
    return axios({
        url: '/coreAdmins/sys/coreRole/delete',
        method: 'delete',
        params
    })
}
// 分页查询
export const findPage = (data) => {
    return axios({
        url: '/coreAdmins/sys/coreRole/findPage',
        method: 'post',
        data
    })
}
// 查询角色
export const find = (params) => {
    return axios({
        url: '/coreAdmins/sys/coreRole/find',
        method: 'get',
        params
    })
}
// 查询全部
export const findAll = () => {
    return axios({
        url: '/coreAdmins/sys/coreRole/findAll',
        method: 'get'
    })
}
// 查询角色菜单集合
export const findRoleMenus = (params) => {
    return axios({
        url: '/coreAdmins/sys/coreRole/findRoleMenus',
        method: 'get',
        params
    })
}
// 保存角色菜单集合
export const saveRoleMenus = (data) => {
    return axios({
        url: '/coreAdmins/sys/coreRole/saveRoleMenus',
        method: 'post',
        data
    })
}
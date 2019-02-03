import axios from '../axios'

/* 
 * 菜单管理模块
 */

 // 保存
export const saveOrEdit = (data) => {
    return axios({
        url: '/coreAdmins/sys/coreMenu/saveOrEdit',
        method: 'post',
        data
    })
}
// 删除
export const del = (params) => {
    return axios({
        url: '/coreAdmins/sys/coreMenu/delete',
        method: 'delete',
        params
    })
}
// 查找导航菜单树
export const findNavTree = (data) => {
    return axios({
        url: '/coreAdmins/sys/coreMenu/findNavTree',
        method: 'post',
        data
    })
}
// 查找导航菜单树
export const findCoreMenuTree = (data) => {
    return axios({
        url: '/coreAdmins/sys/coreMenu/findCoreMenuTree',
        method: 'post',
        data
    })
}

// 查找导航菜单树
export const find = (params) => {
    return axios({
        url: '/coreAdmins/sys/coreMenu/find',
        method: 'get',
        params
    })
}
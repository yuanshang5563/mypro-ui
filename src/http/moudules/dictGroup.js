import axios from '../axios'

/* 
 * 字典组管理模块
 */

// 保存
export const saveOrEdit = (data) => {
    return axios({
        url: '/coreAdmins/sys/CoreDictionariesGroup/saveOrEdit',
        method: 'post',
        data
    })
}
// 删除
export const del = (params) => {
    return axios({
        url: '/coreAdmins/sys/CoreDictionariesGroup/delete',
        method: 'delete',
        params
    })
}
// 查询字典组
export const find = (params) => {
    return axios({
        url: '/coreAdmins/sys/CoreDictionariesGroup/find',
        method: 'get',
        params
    })
}
// 查询字典组树
export const findDictGroupTree = (data) => {
    return axios({
        url: '/coreAdmins/sys/CoreDictionariesGroup/findTree',
        method: 'post',
        data
    })
}
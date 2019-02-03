import axios from '../axios'

/* 
 * 参数管理模块
 */

// 保存
export const saveOrEdit = (data) => {
    return axios({
        url: '/coreAdmins/sys/coreParameter/saveOrEdit',
        method: 'post',
        data
    })
}
// 删除
export const del = (params) => {
    return axios({
        url: '/coreAdmins/sys/coreParameter/delete',
        method: 'delete',
        params
    })
}
// 分页查询
export const findPage = (data) => {
    return axios({
        url: '/coreAdmins/sys/coreParameter/findPage',
        method: 'post',
        data
    })
}
// 查找
export const find = (params) => {
    return axios({
        url: '/coreAdmins/sys/coreParameter/find',
        method: 'get',
        params
    })
}
import axios from '../axios'

/* 
 * 字典管理模块
 */

// 保存
export const saveOrEdit = (data) => {
    return axios({
        url: '/coreAdmins/sys/coreDictionaries/saveOrEdit',
        method: 'post',
        data
    })
}
// 删除
export const del = (params) => {
    return axios({
        url: '/coreAdmins/sys/coreDictionaries/delete',
        method: 'delete',
        params
    })
}
// 分页查询
export const findPage = (data) => {
    return axios({
        url: '/coreAdmins/sys/coreDictionaries/findPage',
        method: 'post',
        data
    })
}

// 查找
export const find = (params) => {
    return axios({
        url: '/coreAdmins/sys/coreDictionaries/find',
        method: 'get',
        params
    })
}

// 查找字典集合
export const findAllDictInGroup = () => {
    return axios({
        url: '/coreAdmins/sys/coreDictionaries/findAllDictInGroup',
        method: 'get'
    })
}
/**
 * 格式化性别
 * @param {*} row 
 * @param {*} sexList 
 */
export function formatSex (row,sexList) {
    let sexLable = row.sex;
    if(null != sexList && sexList.length > 0){
        for(let i = 0; i < sexList.length; i++){
            if(sexList[i].dictCode == row.sex){
                sexLable = sexList[i].dictValue;
                break;
            }
        }
    }
    return sexLable;
}

/**
 * 格式化用户状态
 * @param {*} row 
 * @param {*} statusList 
 */
export function formatCoreUserStatus (row,statusList) {
    let statusLable = row.status;
    if(null != statusList && statusList.length > 0){
        for(let i = 0; i < statusList.length; i++){
            if(statusList[i].dictCode == row.status){
                statusLable = statusList[i].dictValue;
                break;
            }
        }
    }
    return statusLable;
}

/**
 * 格式化参数类型
 * @param {*} row 
 * @param {*} paramTypeList 
 */
export function formatParamType (row,paramTypeList) {
    let paramTypeLable = row.paramType;
    if(null != paramTypeList && paramTypeList.length > 0){
        for(let i = 0; i < paramTypeList.length; i++){
            if(paramTypeList[i].dictCode == row.paramType){
                paramTypeLable = paramTypeList[i].dictValue;
                break;
            }
        }
    }
    return paramTypeLable;
}
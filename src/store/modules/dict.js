export default {
    state: {
        sex: [],  // 性别集合
        paramType: [],  // 参数类型集合
        coreUserStatus: []  // 参数类型集合
    },
    getters: {
   
    },
    mutations: {
        setDictData(state, dictMap){ 
            state.sex = dictMap.sex;
            state.paramType = dictMap.paramType;
            state.coreUserStatus = dictMap.coreUserStatus;
        }
    },
    actions: {
    }
}
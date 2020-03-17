/**
 * @description 将平级的数据，根据 父级id，整理成 iview中tree的data类似的结构，共tree, cascader使用
 * @param baseArr 平级数据
 * @param parentIdName 父级id的字段名称
 * @param idName  本级id的字段名称
 * @param childrenFn  返回children的内容的方法
 * @param sortName  需排序的字段名
 * @param resultArr 方法中被处理的数组
 * @param isChildren  是否是基础父级数据
 * @param selectedArray  已选中的数组
 * @param selectJudgeName 选中判断所需字段名称
 * @param shouldGetParentNameArr 是否需要设置 父级名称数组
 * @return {Array}
 */
function formatToTreeDataInner ({ baseArr, parentIdName, idName, childrenFn, sortName = '', resultArr = [], isChildren = false, selectedArray = [], selectJudgeName, shouldGetParentNameArr = false }) {
    if (!resultArr.length && !isChildren) {
        const parentBaseArr = []
        baseArr.forEach(item => {
            // parentBaseArr父级数据
            if (item[parentIdName] === '0' || item[parentIdName] === 0 || item[parentIdName] === '') {
                const temp = childrenFn(JSON.parse(JSON.stringify(item)))
                if (selectedArray.length && selectedArray.indexOf(item[selectJudgeName]) !== -1) {
                    temp.selected = true
                }
                parentBaseArr.push(temp)
            }
        })
        if (parentBaseArr.length === baseArr.length) {
            return parentBaseArr
        } else {
            const args = arguments[0]
            args.resultArr = parentBaseArr
            args.isChildren = true
            return formatToTreeDataInner(args)
        }
    } else {
        if (sortName) {
        	// 从小到大排序
            resultArr.sort(function (a, b) {
                return (a[sortName] - b[sortName])
            })
        }
        resultArr.forEach(item => {
            baseArr.forEach(ite => {
                if (item[idName] === ite[parentIdName]) {
                	const temp = childrenFn(ite)
                    if (shouldGetParentNameArr) {
                        if (item.parentNameArr) {
                            temp.parentNameArr = JSON.parse(JSON.stringify(item.parentNameArr))
                            temp.parentNameArr.push(item.title)
                        } else {
                            temp.parentNameArr = [item.title]
                        }
                    }
                    if (selectedArray.length && selectedArray.indexOf(ite[selectJudgeName]) !== -1) {
                        temp.selected = true
                    }
                    item.children.push(temp)
                }
            })
        })
        resultArr.forEach(item => {
        	if (item.children.length) {
                const args = arguments[0]
                args.resultArr = item.children
                args.isChildren = true
                item = formatToTreeDataInner(args)
            } else {
                if (item.selected) {
                    item.checked = true
                }
            }
        })
        return resultArr
    }
}
// 组织树的数据处理
export const getTree = (tree = [], name) => {
    let arr = []
    if (!!tree && tree.length !== 0) {
        tree.forEach(item => {
            let obj = {}
            obj.value = item.id
            obj[name] = item.orgName
            obj.expend = true
            obj.orgType = item.orgType
            obj.areaOrgId = item.areaOrgId
            obj.districtOrgId = item.districtOrgId
            obj.medicalOrgId = item.medicalOrgId
            obj.conjoinedOrgId = item.conjoinedOrgId
            obj.rootOrgId = item.rootOrgId
            if (item.chrildren) {
                obj.children = getTree(item.chrildren, name)
            }
            arr.push(obj)
        })
    }
    return arr
}
/**
 * @description 编辑时，根据id获得 cascader的value数组值
 * @param array
 * @param label
 */
export const getCascaderSelectedValue = (array, label) => {
    let stack = []
    let going = true
    let walker = (array, label) => {
        array.forEach(item => {
            if (!going) return
            stack.push(item['value'])
            if (item['value'] === label) {
                going = false
            } else if (item['children']) {
                walker(item['children'], label)
            } else {
                stack.pop()
            }
        })
        if (going) stack.pop()
    }
    walker(array, label)
    return stack
}

export const handleMenus = (array) => {
    let parentArr = []
    const menusArr = array && array.filter((item) => {
	    return item.permissionType !== 3 && item.url
    })
    menusArr && menusArr.forEach(item => {
        if (item.parentId === '0') {
            parentArr.push({
                ...item,
                children: []
            })
        }
    })
    parentArr.forEach(item => {
        menusArr.forEach(e => {
            if (item.id === e.parentId) {
                item.children.push(e)
            }
        })
    })
    return parentArr
}

/**
 * @description 防抖
 * @param func 被调用的方法
 * @param waitTime 延迟的时间ms
 */
export const debounce = (func, waitTime) => {
    return args => {
        clearTimeout(func.id)
        func.id = setTimeout(function () {
            func(args)
        }, waitTime)
    }
}

export const handleArray = (arr, checked) => {
    arr.forEach(item => {
        item.checked = checked
        if (item.children && item.children.length) {
            handleArray(item.children)
        }
    })
    return arr
}

export const formatToTreeData = formatToTreeDataInner

// 处理 当前页是最后一页，且只有最后一条数据，且pager-1不等于0时，需pager-1再查询
export const handleDeleteRefresh = (searchParams, tableParams, queryFunc, _this) => {
    const currentPage = _this[searchParams].pager
    const maxPage = Math.ceil(_this[tableParams].total / _this[searchParams].limit)
    if (currentPage !== 1 && currentPage === maxPage && _this[tableParams].data.length === 1) {
    	_this[searchParams].pager = currentPage - 1
    }
    _this[queryFunc]()
}

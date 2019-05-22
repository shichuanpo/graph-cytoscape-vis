const isObject = function(item) {
  return Object.prototype.toString.call(item) === '[object Object]'
}
const isArray = function(item) {
  return Object.prototype.toString.call(item) === '[object Array]'
}
const isFunction = function(item) {
  return Object.prototype.toString.call(item) === '[object Function]'
}
const __merge = function(type = 'merge', target, source) {
  if (isObject(target) && isObject(source)) {
    for (let key in source) {
      if (isObject(source[key]) && isObject(target[key])) {
        target[key] = __merge(type, target[key], source[key])
      } else if (isArray(source[key]) && isArray(target[key])) {
        target[key] = __merge(type, target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
  } else if (isArray(target) && isArray(source)) {
    if (type === 'merge') {
      target = Array.from(new Set([...target, ...source])) // 取并集
    } else if (type === 'concat') {
      target = target.concat(source) // 数组合并
    } else if (type === 'findSelector') {
      source.forEach(item => {
        let itemInTarget = target.find(t => t.selector === item.selector)
        if (itemInTarget) {
          itemInTarget = __merge(type, itemInTarget, item)
        } else {
          target.push(item)
        }
      })
    } else {
      target = source
    }
  } else {
    console.error('target or source must be Object or Array')
  }
  return target
}
const _merge = function() {
  let objs = Array.from(arguments)
  if (objs.length < 2) {
    console.error('target or source cannot be null')
  }
  objs[1] = __merge(...objs)
  objs.splice(2, 1)
  if (objs.length > 2) {
    return _merge(...objs)
  } else if (objs.length === 2) {
    return objs[1]
  } else {
    console.error('target or source cannot be null')
  }
}
const merge = function() {
  let objs = Array.from(arguments)
  return _merge('merge', ...objs)
}
const mergeArrayFindSelector = function() {
  let objs = Array.from(arguments)
  return _merge('findSelector', ...objs)
}
const mergeArrayConcat = function() {
  let objs = Array.from(arguments)
  return _merge('concat', ...objs)
}
const mergeArrayReplace = function() {
  let objs = Array.from(arguments)
  return _merge('replace', ...objs)
}
const createId = function(salt, randomLength = 8) {
  return (
    (salt || '') +
    Number(
      Math.random()
        .toString()
        .substr(3, randomLength) + Date.now()
    ).toString(36)
  )
}
export {
  isObject,
  isArray,
  isFunction,
  merge,
  mergeArrayFindSelector,
  mergeArrayConcat,
  mergeArrayReplace,
  createId
}

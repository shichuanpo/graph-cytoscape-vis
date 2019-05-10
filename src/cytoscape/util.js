const isObject = function(item) {
  return Object.prototype.toString.call(item) === '[object Object]'
}
const isArray = function(item) {
  return Object.prototype.toString.call(item) === '[object Array]'
}
const __merge = function(target, source) {
  if (isObject(target) && isObject(source)) {
    for (let key in source) {
      if (isObject(source[key]) && isObject(target[key])) {
        target[key] = __merge(target[key], source[key])
      } else if (isArray(source[key]) && isArray(target[key])) {
        target[key] = target[key].concat(source[key]) // 数组合并
      } else {
        target[key] = source[key]
      }
    }
    return target
  } else {
    console.error('target or source must be Object')
  }
}
const merge = function() {
  let objs = Array.from(arguments)
  if (objs.length < 1) {
    console.error('target or source must be Object')
  }
  objs[0] = __merge(...objs)
  objs.splice(1, 1)
  if (objs.length > 1) {
    return merge(...objs)
  } else if (objs.length === 1) {
    return objs[0]
  } else {
    console.error('target or source must be Object')
  }
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
export { isObject, isArray, merge, createId }

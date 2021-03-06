<template lang="pug">
vue-legend(:data="legendData", :options="options", v-model="legendModel")
</template>
<script>
import { merge, mergeArrayReplace, isObject, isArray, isFunction, colorRgba } from './util'
import { categoryOption } from './config.js'
import vueLegend from '@/components/legend/index.vue'
export default {
  name: 'vueCytoscapeLegend',
  components: { vueLegend },
  props: {
    category: {
      type: [Object, Array],
      default: () => {
        return {}
      }
    },
    options: {
      type: Object,
      default: () => {
        return {}
      }
    },
    data: {
      type: Array,
      default: () => {
        return []
      }
    },
    type: {
      type: String,
      default: 'nodes'
    },
    model: {
      type: Object
    }
  },
  model: {
    prop: 'model',
    event: 'change'
  },
  data () {
    return {
      innerModel: {}
    }
  },
  computed: {
    legendModel: {
      get () {
        return merge({}, this.model || this.innerModel)
      },
      set (value) {
        this.innerModel = value
        this.$emit('change', value)
      }
    },
    legendData () {
      return this.categorys.map(name => {
        const { style, formatter } = this.categoryParams[name]
        const { backgroundColor, backgroundImage, backgroundPosition, backgroundRepeat, backgroundSize, borderColor } = style
        return Object.assign({}, {
          activeTagStyle: { backgroundColor, backgroundImage, backgroundPosition, backgroundRepeat, backgroundSize, borderColor },
          tagStyle: {
            borderStyle: style.borderStyle
          },
          activeTextStyle: { color: style.borderColor || style.backgroundColor },
          formatter
        }, { name })
      })
    },
    categoryParams () {
      let _categoryParams = {}
      if (this.category) {
        
        if (isArray(this.category)) {
          /****
           * 分类配置为 { data: [{ name: '', style: {}, formatter: function () {}, matching: function () {} }] }
           * 其中formatter只用以legend
           */
          this.category.forEach(({ name, style, formatter }, _idx) => {
            let _baseIdx = _idx % categoryOption[this.type].styles.length
            _categoryParams[name] = _categoryParams[name] || {}
            _categoryParams[name].style = merge({}, categoryOption[this.type].styles[_baseIdx], style)
            _categoryParams[name].formatter = formatter
          })
        } else {
          let _styles = this.category.styles
          if (_styles) {
            if (isArray(_styles)) {
              /****
               * 分类配置为 { key: '', styles: [] }
               */
              this.categorys.forEach((name, _idx) => {
                let _optIdx = _idx % _styles.length
                let _baseIdx = _idx % categoryOption[this.type].styles.length
                _categoryParams[name] = _categoryParams[name] || {}
                _categoryParams[name].style = merge({}, categoryOption[this.type].styles[_baseIdx], _styles[_optIdx])
              })
            } else if (isObject(_styles)) {
              /****
               * 分类配置为 { key: '', styles: {} }
               */
              this.categorys.forEach((name, _idx) => {
                let _baseIdx = _idx % categoryOption[this.type].styles.length
                _categoryParams[name] = _categoryParams[name] || {}
                _categoryParams[name].style = merge({}, categoryOption[this.type].styles[_baseIdx], _styles[name] || {})
              })
            }
          }
        }
      }
      return this.getTransStyle(_categoryParams)
    },
    categorys () {
      let _categorys = Array.from(
        new Set((this.data || []).filter(dat => dat.group === this.type).map(dat => this.dataByCategory(dat.data)).filter(g => !!g))
      )
      return _categorys
    },
    categoryBy () {
      if (this.category) {
        if (isArray(this.category)) {
          return this.category
        } else if (isObject(this.category)) {
          return this.category.key
        }
      }
      return null
    }
  },
  methods: {
    /****
     * 目前支持的样式有：背景颜色（透明度），背景图片，边框颜色，边框类型等
     * todo：shape、渐变等
     */
    getTransStyle (params) {
      let _isNodes = this.type === 'nodes'
      Object.keys(params).forEach(key => {
        params[key].style = {
          'backgroundColor': params[key].style['background-color'] ? colorRgba(params[key].style['background-color'], params[key].style['background-opacity'] || 1) : 'none',
          'backgroundImage': params[key].style['background-image'] ? `url(${params[key].style['background-image']})` : 'none',
          'backgroundPosition': 'center',
          'backgroundRepeat': params[key].style['background-repeat'],
          'backgroundSize': `${params[key].style['background-width']} ${params[key].style['background-height']}`,
          // 'borderWidth': _isNodes ? (params[key].style['border-width'] && params[key].style['border-width'] + 'px') || '1px' : (params[key].style['width'] && params[key].style['width'] + 'px') || '1px',
          'borderColor': _isNodes ? params[key].style['border-color'] : params[key].style['line-color'],
          'borderStyle': _isNodes ? params[key].style['border-style'] || 'not specified' : params[key].style['line-style'] || 'not specified'
        }
      })
      return params
    },
    dataByCategory (data) {
      if (isArray(this.categoryBy)) {
        let _category = this.categoryBy.find(category => category.matching && category.matching(data))
        return _category ? (isFunction(_category.name) ? _category.name(data) : _category.name) : undefined
      } else {
        return data[this.categoryBy]
      }
    }
  }
}
</script>

<template lang="pug">
.cytoscapeContainer
  .legend.legendCalc(v-if="legend.show", :style="legend.style", :class="[legend.orient, legend.type]", ref="legend")
    .checkbox(
      v-for="(categoryName, index) in categorys",
      :style="getItemGapStyle()",
      :key="categoryName",
      :ref="categoryName"
    )
      span.tag(:style="legend.tagStyle")
      span.text(:style="legend.textStyle") {{legend.formatter ? legend.formatter(categoryName) : categoryName}}
    .pagination(ref="pagination")
      a.pageButton.triangle_border_left
      span {{currentPage}} / {{checkboxs.length}}
      a.pageButton.triangle_border_right
  .legend(v-if="legend.show", :style="legend.style", :class="[legend.orient, legend.type]")
    .checkboxs(v-for="(_checkboxs, _checkboxsIdx) in checkboxs", v-if="_checkboxsIdx === currentPage - 1 || legend.type !== 'scroll'", :style="{float:checkboxsFloat}")
      .checkbox(
        v-for="(_checkbox, _checkboxIdx) in _checkboxs",
        @click="checkboxChange(getCategoryIndex(_checkboxsIdx, _checkboxIdx))",
        onselectstart="return false;",
        :key="_checkbox+_checkboxIdx+_checkboxIdx",
        :style="getItemGapStyle()"
      )
        span.tag(:style="getTagStyle(_checkboxsIdx, _checkboxIdx)")
          img(:src="imgByCategory[_checkbox]", height="100%", v-if="checkBoxModel[getCategoryIndex(_checkboxsIdx, _checkboxIdx)]")
        span.text(:style="getTextStyle(_checkboxsIdx, _checkboxIdx)", :title="legend.formatter ? legend.formatter(_checkbox) : _checkbox") {{legend.formatter ? legend.formatter(_checkbox) : _checkbox}}
    .pagination(v-if="checkboxs.length > 1 && legend.type === 'scroll'")
      a.pageButton.triangle_border_left(@click="pageChange('sub')", :class="{'disabled': currentPage <= 1}")
      span {{currentPage}} / {{checkboxs.length}}
      a.pageButton.triangle_border_right(@click="pageChange('add')", :class="{'disabled': currentPage >= checkboxs.length}")
  .cytoscape(ref="cytoscapeContainer")
</template>
<script>
import mockdata from '../mock/data';
import Cytoscape from './cytoscape'
import { merge, mergeArrayFindSelector, mergeArrayReplace, isObject, isArray, isFunction } from './util'
import defaultOption from './defaultOption.js'

export default {
  name: 'vue-cytoscape',
  props: {
    options: {
      type: Object,
      default: () => {
        return {}
      }
    },
    data: {
      type: Array,
      default: () => {
        return mockdata
      }
    }
  },
  data () {
    return {
      $cy: null,
      timeStamp: 0,
      checkBoxModel: [],
      filterIds: {},
      defaultColor: '#ccc',
      defaultImage: '#ccc',
      checkboxs: [],
      checkboxsFloat: 'left',
      getCheckboxsNextTick: () => { this.$nextTick(this.getCheckboxs) },
      currentPage: 1
    };
  },
  computed: {
    colors () {
      if (this.options.category && this.options.category.colors) {
        let colors = JSON.parse(JSON.stringify(this.options.category.colors))
        if (isArray(colors)) {
          return merge(colors, defaultOption.colors)
        } else if (isObject(colors)) {
          return colors
        }
      }
      return defaultOption.category && defaultOption.category.colors || {}
    },
    images () {
      if (this.options.category && this.options.category.images) {
        let images = JSON.parse(JSON.stringify(this.options.category.images))
        if (isArray(images)) {
          return merge(images, defaultOption.colors)
        } else if (isObject(images)) {
          return images
        }
      }
      return defaultOption.category && defaultOption.category.images || {}
    },
    categoryBy () {
      return this.options.category && (this.options.category.data || this.options.category.key) || defaultOption.category.key
    },
    legend () {
      let legend = JSON.parse(JSON.stringify(defaultOption.legend || {}))
      return mergeArrayReplace(legend, this.options.legend || {}) || {}
    },
    cytoscapeOptions () {
      let cytoscapeOptions = JSON.parse(JSON.stringify(defaultOption.cytoscape || {}))
      return mergeArrayFindSelector(cytoscapeOptions, {
        style: [{
          selector: 'node',
          style: {
            'content': 'data(name)',
            'shape': 'barrel',
            'background-color': (ele) => {
              let categoryName = this.dataByCategory(ele.data())
              return this.colorByCategory[categoryName] || this.defaultColor
            },
            'background-image': (ele) => {
              let categoryName = this.dataByCategory(ele.data())
              return this.imgByCategory[categoryName] || this.defaultImage
            },
            'background-width': '80%',
            'background-height': '80%',
            'background-repeat': 'no-repeat',
            'background-opacity': 0.6,
            'background-image-opacity': 0.6,
            'z-index-compare': 'manual',
            'z-index': 2
          }
        }]
      }, this.options.cytoscape || {})
    },
    categorys () {
      return Array.from(
        new Set(this.data.filter(dat => dat.group === 'nodes').map(dat => this.dataByCategory(dat.data)).filter(g => !!g))
      )
    },
    colorByCategory () {
      let colorCategory = {}
      if (isArray(this.colors)) {
        this.categorys.forEach((g, idx) => {
          idx = idx % this.colors.length
          colorCategory[g] = this.colors[idx]
        })
      } else if (isObject(this.colors)) {
        colorCategory = this.colors
      }
      if (isArray(this.categoryBy)) {
        this.categoryBy.forEach(({ color, name, matching }) => {
          let _color = color
          if (isFunction(color)) {
            let datas = this.data.map(d => d.data).filter(d => matching && matching(d))
            _color = color(datas)
          }
          colorCategory[name] = _color || colorCategory[name] || this.defaultColor
        })
      }
      return colorCategory
    },
    imgByCategory () {
      let imgCategory = {}
      if (isArray(this.images)) {
        this.categorys.forEach((g, idx) => {
          idx = idx % this.images.length
          imgCategory[g] = this.images[idx]
        })
      } else if (isObject(this.images)) {
        imgCategory = this.images
      }
      if (isArray(this.categoryBy)) {
        this.categoryBy.forEach(({ image, name }) => {
          let _image = image
          if (isFunction(image)) {
            let datas = this.data.map(d => d.data).filter(d => matching && matching(d))
            _image = image(datas)
          }
          imgCategory[name] = _image || imgCategory[name] || this.defaultImage
        })
      }
      return imgCategory
    }
  },
  watch: {
    data: {
      handler (newValue) {
        this.$cy && this.setData(newValue)
      },
      deep: true
    },
    options: {
      handler () {
        this.$cy && this.setOptions()
      },
      deep: true
    },
    categorys: {
      handler (newCategorys) {
        if (newCategorys) {
          this.checkBoxModel = newCategorys.map(() => true)
          this.getCheckboxsNextTick()
        }
      },
      deep: true
    }
  },
  methods: {
    pageChange (type = 'add') {
      if (type === 'add' && this.currentPage < this.checkboxs.length) {
        this.currentPage++
      } else if (type === 'sub' && this.currentPage > 1) {
        this.currentPage--
      }
    },
    getCategoryIndex (idx1, idx2) {
      return this.checkboxs.slice(0, idx1).reduce((result, current) => {
        return result + current.length
      }, 0) + idx2
    },
    getCheckboxs () {
      if (!this.legend.show) return
      const {
        paddingTop,
        paddingLeft,
        paddingBottom,
        paddingRight,
        marginTop,
        marginLeft,
        marginBottom,
        marginRight,
        borderTopWidth,
        borderLeftWidth,
        borderBottomWidth,
        borderRightWidth,
        left,
      } = getComputedStyle(this.$refs.legend, null)
      let padding = {
        top: Number(paddingTop.replace('px', '')),
        left: Number(paddingLeft.replace('px', '')),
        bottom: Number(paddingBottom.replace('px', '')),
        right: Number(paddingRight.replace('px', ''))
      }
      let margin = {
        top: Number(marginTop.replace('px', '')),
        left: Number(marginLeft.replace('px', '')),
        bottom: Number(marginBottom.replace('px', '')),
        right: Number(marginRight.replace('px', ''))
      }
      let border = {
        top: Number(borderTopWidth.replace('px', '')),
        left: Number(borderLeftWidth.replace('px', '')),
        bottom: Number(borderBottomWidth.replace('px', '')),
        right: Number(borderRightWidth.replace('px', ''))
      }
      let allHeight = this.$refs.cytoscapeContainer.clientHeight - (padding.top + padding.bottom + margin.top + margin.bottom + border.top + border.bottom)
      let allWidth = this.$refs.cytoscapeContainer.clientWidth - (padding.left + padding.right + margin.left + margin.right + border.left + border.right)
      let itemsHeight = 0
      let itemsWidth = 0
      let checkboxs = []
      let checkboxsIdx = 0
      this.checkboxsFloat = 'left'
      let paginationWidth = this.$refs.pagination.clientWidth
      let paginationHeight = this.$refs.pagination.clientHeight
      if (this.legend.orient === 'horizontal') {
        if (this.legend.type === 'scroll') {
          let allItemsWidth = this.categorys.reduce((total, category) => {
            return this.$refs[category][0].offsetWidth + (this.legend.itemGap || 0) + total
          }, 0)
          if (allItemsWidth > allWidth) {
            allWidth -= paginationWidth
          }
        }
        this.categorys.forEach((category, idx) => {
          let itemWidth = this.$refs[category][0].offsetWidth + (this.legend.itemGap || 0)
          itemsWidth += itemWidth
          if (itemsWidth > allWidth) {
            itemsWidth = itemWidth
            checkboxsIdx += 1
          }
          checkboxs[checkboxsIdx] = checkboxs[checkboxsIdx] || []
          checkboxs[checkboxsIdx].push(category)
        })
      } else {
        if (Number(left.replace('px', '')) > allWidth / 2) {
          this.checkboxsFloat = 'right'
        }
        if (this.legend.type === 'scroll') {
          let allItemsHeight = this.categorys.reduce((total, category) => {
            return this.$refs[category][0].offsetHeight + (this.legend.itemGap || 0) + total
          }, 0)
          if (allItemsHeight > allHeight) {
            allHeight -= paginationHeight
          }
        }
        this.categorys.forEach((category, idx) => {
          let itemHeight = this.$refs[category][0].offsetHeight + (this.legend.itemGap || 0)
          itemsHeight += itemHeight
          if (itemsHeight > allHeight) {
            itemsHeight = itemHeight
            checkboxsIdx += 1
          }
          checkboxs[checkboxsIdx] = checkboxs[checkboxsIdx] || []
          checkboxs[checkboxsIdx].push(category)
        })
      }
      this.checkboxs = checkboxs
    },
    getTagStyle (idx1, idx2) {
      let model = this.checkBoxModel[this.getCategoryIndex(idx1, idx2)]
      let category = this.checkboxs[idx1][idx2]
      let defaultStyle = Object.assign({}, this.legend.tagStyle, {
        'background': this.colorByCategory[category],
        border: `1px solid ${this.colorByCategory[category]}`
      })
      return Object.assign(defaultStyle, model ? this.legend.activeTagStyle : this.legend.inactiveTagStyle)
    },
    getTextStyle (idx1, idx2) {
      let model = this.checkBoxModel[this.getCategoryIndex(idx1, idx2)]
      let category = this.checkboxs[idx1][idx2]
      let defaultStyle = Object.assign({}, this.legend.textStyle, {
        'color': this.colorByCategory[category]
      })
      return Object.assign(defaultStyle, model ? this.legend.activeTextStyle : this.legend.inactiveTextStyle)
    },
    getItemGapStyle () {
      let styleText = `${this.legend.itemGap || 0}px`
      if (this.legend.type === 'scroll') {
        if (this.legend.orient === 'horizontal') {
          return {
            'margin-right': styleText
          }
        } else if (this.legend.orient === 'vertical') {
          return {
            'margin-bottom': styleText
          }
        }
      }
      return {
        'margin-right': styleText,
        'margin-bottom': styleText
      }
    },
    dataByCategory (data) {
      if (isArray(this.categoryBy)) {
        let _category = this.categoryBy.find(category => category.matching && category.matching(data))
        return _category ? (isFunction(_category.name) ? _category.name(data) : _category.name) : undefined
      } else {
        return data[this.categoryBy]
      }
    },
    checkboxChange (index) {
      let ntime = new Date().getTime()
      if (ntime - this.timeStamp < 200) {
        this.timeStamp = ntime
        clearTimeout(this.timeout)
        let isChecked = this.checkBoxModel[index]
        this.categorys.forEach((categoryName, idx) => {
          if (idx === index) {
            this.$set(this.checkBoxModel, idx, !isChecked)
          } else {
            this.$set(this.checkBoxModel, idx, isChecked)
          }
          if (this.checkBoxModel[idx] && this.filterIds[categoryName]) {
            this.$cy.reset(this.filterIds[categoryName])
            delete this.filterIds[categoryName]
          } else if (!this.checkBoxModel[idx] && !this.filterIds[categoryName]) {
            this.filterIds[categoryName] = this.$cy.filterNodesByFunction(ele => this.dataByCategory(ele.data()) !== categoryName)
          }
        })
      } else {
        this.timeStamp = ntime
        let categoryName = this.categorys[index]
        this.timeout = setTimeout(() => {
          this.$set(this.checkBoxModel, index, !this.checkBoxModel[index])
          if (this.checkBoxModel[index] && this.filterIds[categoryName]) {
            this.$cy.reset(this.filterIds[categoryName])
            delete this.filterIds[categoryName]
          } else {
            this.filterIds[categoryName] = this.$cy.filterNodesByFunction(ele => this.dataByCategory(ele.data()) !== categoryName)
          }
        }, 200)
      }
    },
    setData (data) {
      this.$nextTick(() => {
        this.$cy && this.$cy.data(data)
      })
    },
    setOptions () {
      this.$nextTick(() => {
        this.$cy && this.$cy.setOptions(this.cytoscapeOptions)
      })
    },
    reset (id) {
      this.$cy && this.$cy.reset(id)
    },
    filterEdgesByFunction (func) {
      return this.$cy && this.$cy.filterEdgesByFunction(func)
    },
    filterNodesByFunction (func) {
      return this.$cy && this.$cy.filterNodesByFunction(func)
    },
    getCytoscape () {
      return this.$cy.cytoscape
    },
    createCytoscape () {
      this.$cy && this.$cy.destroy()
      let container = this.$refs.cytoscapeContainer
      this.$cy = new Cytoscape(container, this.data, this.cytoscapeOptions)
    }
  },
  mounted () {
    this.createCytoscape()
    window.addEventListener('resize', this.getCheckboxsNextTick)
  },
  beforeDestroy () {
    this.$cy.destroy()
    window.removeEventListener('resize', this.getCheckboxsNextTick)
  }
};
</script>
<style lang="less" scoped>
.cytoscapeContainer {
  text-align: left;
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  .cytoscape {
    position: relative;
    width: 100%;
    height: 100%;
  }
}
.legendCalc {
  z-index: -1 !important;
  opacity: 0 !important;
}
.legend {
  position: absolute !important;
  clear: both;
  z-index: 1000;
  &.horizontal {
    .checkbox {
      display: inline-block;
      vertical-align: top;
    }
  }
  &.horizontal.scroll {
    overflow: hidden;
    white-space: nowrap;
    .checkboxs {
      float: none !important;
      display: inline-block;
      vertical-align: top;
      font-size: 0;
    }
    .pagination {
      float: right;
    }
  }
  &.vertical {
    display: block;
    &.scroll {
      .checkboxs {
        float: none !important;
      }
      .pagination {
        text-align: center;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
      }
    }
    // writing-mode: vertical-lr;
    // .checkbox {
    //   text-align: left;
    //   writing-mode: horizontal-tb;
    //   float: left;
    //   .text {
    //     width: 80px;
    //     overflow: hidden; /*超出部分隐藏*/
    //     text-overflow: ellipsis; /* 超出部分显示省略号 */
    //     white-space: nowrap; /*规定段落中的文本不进行换行 */
    //   }
    // }
  }
  .checkbox {
    overflow: hidden;
    cursor: pointer;
    white-space: nowrap;
    font-size: 0;
    input {
      display: none;
    }
    img {
      display: block;
      margin: 0 auto;
    }
  }
  .pagination {
    position: relative;
    z-index: 1000;
    height: 17px;
    line-height: 17px;
    font-size: 0;
    white-space: nowrap;
    .pageButton {
      display: inline-block;
      vertical-align: top;
      margin-top: 2px;
      cursor: pointer;
      &.triangle_border_left.disabled {
        border-color: transparent #999 transparent transparent;
        cursor: not-allowed;
      }
      &.triangle_border_right.disabled {
        border-color: transparent transparent transparent #999;
        cursor: not-allowed;
      }
    }
    span {
      font-size: 14px;
      margin: 0 5px;
    }
  }
  i {
    display: block;
    width: 100%;
    height: 100%;
  }
  /*向左*/
  .triangle_border_left {
    width: 0;
    height: 0;
    border-width: 6px 12px 6px 0;
    border-style: solid;
    border-color: transparent rgba(47, 69, 84, 1) transparent transparent;
  }
  /*向右*/
  .triangle_border_right {
    width: 0;
    height: 0;
    border-width: 6px 0 6px 12px;
    border-style: solid;
    border-color: transparent transparent transparent rgba(47, 69, 84, 1);
  }
}
</style>


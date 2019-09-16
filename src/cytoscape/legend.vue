<template lang="pug">
.cytoscape__legend
  .legend.legendCalc(v-if="legend.show", :style="legend.style", :class="[legend.orient, legend.type]", ref="legend")
    .item(
      v-for="(categoryName, index) in categorys",
      :style="getItemGapStyle()",
      :key="categoryName",
      :ref="categoryName"
    )
      span.tag(:style="legend.tagStyle")
      span.text(:style="legend.textStyle") {{legend.formatter ? legend.formatter(categoryName) : categoryName}}
    .pagination(ref="pagination")
      a.pageButton.triangle_border_left
      span {{currentPage}} / {{items.length}}
      a.pageButton.triangle_border_right
  .legend(v-if="legend.show", :style="legend.style", :class="[legend.orient, legend.type]", onselectstart="return false;")
    .itemsbox(:style="legend.orient === 'vertical' ? {height: legendHeight + 'px'} : {width: legendWidth + 'px'}")
      div(:style='getItemScrollStyle()')
        .items(v-for="(_items, _itemsIdx) in items", :style="{float:itemsFloat}", :ref="`items${_itemsIdx}`")
          .item(
            v-for="(_item, _itemIdx) in _items",
            @click="itemChange(_item)",
            :key="_item+_itemIdx+_itemIdx",
            :style="getItemGapStyle()"
          )
            span.tag(:style="getTagStyle(_item)")
              img(:src="imgByCategory[_item]", height="100%", v-if="!legendModel[_item]")
            span.text(:style="getTextStyle(_item)", :title="legend.formatter ? legend.formatter(_item) : _item") {{legend.formatter ? legend.formatter(_item) : _item}}
    .pagination(v-if="items.length > 1 && legend.type === 'scroll'")
      a.pageButton.triangle_border_left(@click="pageChange('sub')", :class="{'disabled': currentPage <= 1}")
      span {{currentPage}} / {{items.length}}
      a.pageButton.triangle_border_right(@click="pageChange('add')", :class="{'disabled': currentPage >= items.length}")
</template>
<script>
import { merge, mergeArrayReplace, isObject, isArray, isFunction } from './util'
import { categoryOption, legendOption } from './defaultOption.js'
export default {
  name: 'vueCytoscapeLegend',
  props: {
    category: {
      type: Object,
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
    }
  },
  data () {
    return {
      legendModel: {},
      timeStamp: 0,
      defaultColor: '#ccc',
      defaultImage: '#ccc',
      legendWidth: 0,
      legendHeight: 0,
      items: [],
      itemsWH: [],
      itemsFloat: 'left',
      currentPage: 1
    }
  },
  computed: {
    colors () {
      if (this.category && this.category.colors) {
        let colors = this.category.colors
        if (isArray(colors)) {
          return merge([], categoryOption.colors, colors || [])
        } else if (isObject(colors)) {
          return colors
        }
      }
      return categoryOption.colors || {}
    },
    images () {
      if (this.category && this.category.images) {
        let images = this.category.images
        if (isArray(images)) {
          return merge([], categoryOption.images, images || [])
        } else if (isObject(images)) {
          return images
        }
      }
      return categoryOption.images || {}
    },
    categoryBy () {
      return this.category && (this.category.data || this.category.key) || categoryOption.key
    },
    legend () {
      return mergeArrayReplace({}, legendOption || {}, this.options || {}) || {}
    },
    categorys () {
      let _categorys = Array.from(
        new Set((this.data || []).filter(dat => dat.group === 'nodes').map(dat => this.dataByCategory(dat.data)).filter(g => !!g))
      )
      return _categorys
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
        this.categoryBy.forEach(({ image, name, matching }) => {
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
    categorys: {
      handler (newCategorys) {
        if (newCategorys) {
          this.getLegendLayout()
          Object.keys(this.legendModel).forEach(key => {
            this.legendModel[key] = null
          })
        }
      },
      deep: true
    }
  },
  methods: {
    pageChange (type = 'add') {
      if (type === 'add' && this.currentPage < this.items.length) {
        this.currentPage++
      } else if (type === 'sub' && this.currentPage > 1) {
        this.currentPage--
      }
    },
    getCategoryIndex (idx1, idx2) {
      return this.items.slice(0, idx1).reduce((result, current) => {
        return result + current.length
      }, 0) + idx2
    },
    async getLegendLayout () {
      if (!this.legend.show || this.$el.clientWidth <= 0 || this.$el.clientHeight <= 0) return
      await this.$nextTick()
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
      } = window.getComputedStyle(this.$refs.legend, null)
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
      this.legendHeight = this.$el.clientHeight - (padding.top + padding.bottom + margin.top + margin.bottom + border.top + border.bottom)
      this.legendWidth = this.$el.clientWidth - (padding.left + padding.right + margin.left + margin.right + border.left + border.right)
      let itemsHeight = 0
      let itemsWidth = 0
      let items = []
      let itemsIdx = 0
      this.itemsFloat = 'left'
      let paginationWidth = this.$refs.pagination.clientWidth
      let paginationHeight = this.$refs.pagination.clientHeight
      if (this.legend.orient === 'horizontal') {
        if (this.legend.type === 'scroll') {
          let allItemsWidth = this.categorys.reduce((total, category) => {
            return this.$refs[category][0].offsetWidth + (this.legend.itemGap || 0) + total
          }, 0)
          if (allItemsWidth > this.legendWidth) {
            this.legendWidth -= paginationWidth
          }
        }
        this.categorys.forEach(category => {
          let itemWidth = this.$refs[category][0].offsetWidth + (this.legend.itemGap || 0)
          itemsWidth += itemWidth
          if (itemsWidth > this.legendWidth) {
            this.itemsWH[itemsIdx] = this.itemsWH[itemsIdx] || {}
            this.itemsWH[itemsIdx].width = itemsWidth - itemWidth
            itemsWidth = itemWidth
            itemsIdx += 1
          }
          items[itemsIdx] = items[itemsIdx] || []
          items[itemsIdx].push(category)
        })
      } else {
        if (Number(left.replace('px', '')) > this.legendWidth / 2) {
          this.itemsFloat = 'right'
        }
        if (this.legend.type === 'scroll') {
          let allItemsHeight = this.categorys.reduce((total, category) => {
            return this.$refs[category][0].offsetHeight + (this.legend.itemGap || 0) + total
          }, 0)
          if (allItemsHeight > this.legendHeight) {
            this.legendHeight -= paginationHeight
          }
        }
        this.categorys.forEach(category => {
          let itemHeight = this.$refs[category][0].offsetHeight + (this.legend.itemGap || 0)
          itemsHeight += itemHeight
          if (itemsHeight > this.legendHeight) {
            this.itemsWH[itemsIdx] = this.itemsWH[itemsIdx] || {}
            this.itemsWH[itemsIdx].height = itemsHeight - itemHeight
            itemsHeight = itemHeight
            itemsIdx += 1
          }
          items[itemsIdx] = items[itemsIdx] || []
          items[itemsIdx].push(category)
        })
      }
      if (items.length <= this.currentPage) {
        this.currentPage = items.length
      }
      this.items = items
    },
    getTagStyle (categoryName) {
      let legendModel = this.legendModel[categoryName]
      let defaultStyle = Object.assign({}, this.legend.tagStyle, {
        'background': this.colorByCategory[categoryName],
        border: `1px solid ${this.colorByCategory[categoryName]}`
      })
      return Object.assign(defaultStyle, legendModel ? this.legend.inactiveTagStyle : this.legend.activeTagStyle)
    },
    getTextStyle (categoryName) {
      let legendModel = this.legendModel[categoryName]
      let defaultStyle = Object.assign({}, this.legend.textStyle, {
        'color': this.colorByCategory[categoryName]
      })
      return Object.assign(defaultStyle, legendModel ? this.legend.inactiveTextStyle : this.legend.activeTextStyle)
    },
    getItemScrollStyle () {
      let style = {}
      if (this.legend.type === 'scroll') {
        if (this.legend.orient === 'horizontal') {
          let left = this.itemsWH.slice(0, this.currentPage - 1).reduce((total, current) => {
            return total + current.width
          }, 0)
          style['margin-left'] = -left + 'px'
          return {
            'margin-left': -left + 'px',
            transition: 'all 0.6s'
          }
        } else if (this.legend.orient === 'vertical') {
          let top = this.itemsWH.slice(0, this.currentPage - 1).reduce((total, current) => {
            return total + current.height
          }, 0)
          style['margin-top'] = -top + 'px'
        }
        if (this.legend.animation) {
          style.transition = `all ${this.legend.animationDurationUpdate}s`
        }
      }
      return style
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
    itemChange (categoryName) {
      let ntime = new Date().getTime()
      if (ntime - this.timeStamp < 200) {
        clearTimeout(this.timeout)
        this.timeStamp = ntime
        this.itemDblClick(categoryName)
      } else {
        this.timeStamp = ntime
        this.timeout = setTimeout(() => {
          this.itemClick(categoryName)
        }, 200)
      }
    },
    itemClick (categoryName) {
      if (this.legendModel[categoryName]) {
        this.$set(this.legendModel, categoryName, null)
      } else {
        this.$set(this.legendModel, categoryName, true)
      }
      this.$emit('change', categoryName, this.legendModel[categoryName])
    },
    itemDblClick (categoryName) {
      let isChecked = !this.legendModel[categoryName]
      this.categorys.forEach(_categoryName => {
        if (_categoryName === categoryName) {
          if (isChecked) {
            this.$set(this.legendModel, _categoryName, true)
          } else {
            this.$set(this.legendModel, _categoryName, null)
          }
        } else {
          if (isChecked && this.legendModel[_categoryName]) {
            this.$set(this.legendModel, _categoryName, null)
          } else if (!isChecked && !this.legendModel[_categoryName]) {
            this.$set(this.legendModel, _categoryName, true)
          }
        }
        this.$emit('change', _categoryName, this.legendModel[_categoryName])
      })
    }
  },
  mounted () {
    window.addEventListener('resize', this.getLegendLayout)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.getLegendLayout)
  }
}
</script>
<style lang="less" scoped>
.cytoscape__legend {
  text-align: left;
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.legend {
  position: absolute;
  clear: both;
  z-index: 1000;
  &.legendCalc {
    position: absolute !important;
    z-index: -1 !important;
    opacity: 0 !important;
  }
  &.horizontal {
    .item {
      display: inline-block;
      vertical-align: top;
    }
  }
  &.horizontal.scroll {
    overflow: hidden;
    white-space: nowrap;
    .items {
      float: none !important;
      display: inline-block;
      vertical-align: top;
      font-size: 0;
    }
    .itemsbox, .pagination {
      display: inline-block;
      vertical-align: middle;
    }
  }
  &.vertical {
    display: block;
    &.scroll {
      .items {
        float: none !important;
      }
      .itemsbox, .pagination {
        display: block;
      }
    }
  }
  .itemsbox{
    font-size: 0;
    overflow: hidden;
  }
  .item {
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
    font-size: 0;
    white-space: nowrap;
    text-align: center;
    .pageButton {
      display: inline-block;
      vertical-align: middle;
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
      vertical-align: middle;
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


<template lang="pug">
.cytoscapeContainer
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
  .legend(v-if="legend.show", :style="legend.style", :class="[legend.orient, legend.type]")
    .itemsbox(:style="legend.orient === 'vertical' ? {height: legendHeight + 'px'} : {width: legendWidth + 'px'}")
      div(:style='getItemScrollStyle()')
        .items(v-for="(_items, _itemsIdx) in items", :style="{float:itemsFloat, opacity: _itemsIdx === currentPage - 1 || legend.type !== 'scroll' ? 1 : 0.3}", :ref="`items${_itemsIdx}`")
          .item(
            v-for="(_item, _itemIdx) in _items",
            @click="itemChange(getCategoryIndex(_itemsIdx, _itemIdx))",
            onselectstart="return false;",
            :key="_item+_itemIdx+_itemIdx",
            :style="getItemGapStyle()"
          )
            span.tag(:style="getTagStyle(_itemsIdx, _itemIdx)")
              img(:src="imgByCategory[_item]", height="100%", v-if="checkBoxModel[getCategoryIndex(_itemsIdx, _itemIdx)]")
            span.text(:style="getTextStyle(_itemsIdx, _itemIdx)", :title="legend.formatter ? legend.formatter(_item) : _item") {{legend.formatter ? legend.formatter(_item) : _item}}
    .pagination(v-if="items.length > 1 && legend.type === 'scroll'")
      a.pageButton.triangle_border_left(@click="pageChange('sub')", :class="{'disabled': currentPage <= 1}")
      span {{currentPage}} / {{items.length}}
      a.pageButton.triangle_border_right(@click="pageChange('add')", :class="{'disabled': currentPage >= items.length}")
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
      legendWidth: 0,
      legendHeight: 0,
      items: [],
      itemsWH: [],
      itemsFloat: 'left',
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
      this.legendHeight = this.$refs.cytoscapeContainer.clientHeight - (padding.top + padding.bottom + margin.top + margin.bottom + border.top + border.bottom)
      this.legendWidth = this.$refs.cytoscapeContainer.clientWidth - (padding.left + padding.right + margin.left + margin.right + border.left + border.right)
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
      this.items = items
    },
    getTagStyle (idx1, idx2) {
      let model = this.checkBoxModel[this.getCategoryIndex(idx1, idx2)]
      let category = this.items[idx1][idx2]
      let defaultStyle = Object.assign({}, this.legend.tagStyle, {
        'background': this.colorByCategory[category],
        border: `1px solid ${this.colorByCategory[category]}`
      })
      return Object.assign(defaultStyle, model ? this.legend.activeTagStyle : this.legend.inactiveTagStyle)
    },
    getTextStyle (idx1, idx2) {
      let model = this.checkBoxModel[this.getCategoryIndex(idx1, idx2)]
      let category = this.items[idx1][idx2]
      let defaultStyle = Object.assign({}, this.legend.textStyle, {
        'color': this.colorByCategory[category]
      })
      return Object.assign(defaultStyle, model ? this.legend.activeTextStyle : this.legend.inactiveTextStyle)
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
    itemChange (index) {
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


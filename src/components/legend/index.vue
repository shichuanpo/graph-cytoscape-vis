<template lang="pug">
.legend__container(v-if="legend.show")
  .legend__container--box.calc(:style="legend.style", :class="[legend.orient, legend.type]", ref="legend")
    .item(
      v-for="_item in dataWithStyle",
      :style="itemStyle",
      :key="_item.name",
      :ref="_item.name"
    )
      span.tag(:style="[_item.tagStyle, legendModel[_item.name] ? _item.activeTagStyle : _item.inactiveTagStyle]")
      span.text(:style="[_item.textStyle, legendModel[_item.name] ? _item.activeTextStyle : _item.inactiveTextStyle]", :title="_item.formatter ? _item.formatter(_item.name) : _item.name") {{_item.formatter ? _item.formatter(_item.name) : _item.name}}
    .pagination(ref="pagination", v-if="items.length > 1 && legend.type === 'scroll'")
      a.pageButton.triangle_border_left
      span {{paginationText}}
      a.pageButton.triangle_border_right
  .legend__container--box(:style="legend.style", :class="[legend.orient, legend.type]", onselectstart="return false;")
    .itemsbox(:style="legend.orient === 'vertical' ? {height: legendHeight + 'px'} : {width: legendWidth + 'px'}")
      div(:style='itemsPaneStyle')
        .items(v-for="(_items, _itemsIdx) in items", :key="`items${_itemsIdx}`", :style="{float:itemsFloat}", :ref="`items${_itemsIdx}`")
          .item(
            v-for="(_item, _itemIdx) in _items",
            @click="itemChange(_item.name)",
            :key="_item.name+_itemsIdx+_itemIdx",
            :style="itemStyle"
          )
            span.tag(:style="[_item.tagStyle, legendModel[_item.name] ? _item.activeTagStyle : _item.inactiveTagStyle]")
            span.text(:style="[_item.textStyle, legendModel[_item.name] ? _item.activeTextStyle : _item.inactiveTextStyle]", :title="_item.formatter ? _item.formatter(_item.name) : _item.name") {{_item.formatter ? _item.formatter(_item.name) : _item.name}}
    .pagination(v-if="items.length > 1 && legend.type === 'scroll'")
      a.pageButton.triangle_border_left(@click="pageChange('sub')", :class="{'disabled': currentPage <= 1}")
      span {{paginationText}}
      a.pageButton.triangle_border_right(@click="pageChange('add')", :class="{'disabled': currentPage >= items.length}")
</template>
<script>
import { merge, isObject } from './util'
import { legendOption, baseColor } from './config.js'
export default {
  name: 'vue-legend',
  props: {
    options: {
      type: Object,
      default: () => {}
    },
    data: {
      type: Array,
      default: () => []
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
      timeStamp: 0,
      defaultColor: '#ddd',
      defaultImage: '#ddd',
      legendWidth: 0,
      legendHeight: 0,
      items: [],
      itemsLength: 0,
      itemsWH: [],
      itemsFloat: 'left',
      currentPage: 1,
      innerModel: {}
    }
  },
  computed: {
    paginationText () {
      return `${this.currentPage} / ${this.itemsLength}`
    },
    /***
     * 图例model，记录每个item点击状态
     */
    legendModel: {
      get () {
        return merge({}, this.model || this.innerModel)
      },
      set (value) {
        this.innerModel = value
        this.$emit('change', value)
      }
    },
    /****
     * 合并图例的配置信息
     */
    legend () {
      return merge({}, legendOption || {}, this.options || {}) || {}
    },
    /****
     * 根据图例配置生成每个item的配置
     * 其中 {
     *  tagStyle,
     *  activeTagStyle,
     *  inactiveTagStyle,
     *  textStyle,
     *  activeTextStyle,
     *  inactiveTextStyle,
     *  formatter 
     * } 可以为item配置
     */
    dataWithStyle () {
      const { tagStyle, activeTagStyle, inactiveTagStyle, textStyle, activeTextStyle, inactiveTextStyle, formatter } = legendOption
      return (this.data || []).map((item, _idx) => {
        const _defaultOption = merge({}, { tagStyle, activeTagStyle, inactiveTagStyle, textStyle, activeTextStyle, inactiveTextStyle, formatter })
        let _color = baseColor[_idx % baseColor.length]
        if (isObject(item)) {
          if (item.name) {
            let _item = merge({}, {
              activeTagStyle: {
                'backgroundColor': _color,
                'borderColor': _color
              },
              activeTextStyle: { color: _color }
            }, item)
            return merge(_defaultOption, _item, this.options || {})
          } else {
            console.error('请给图例添加命名name！')
          }
        } else if (typeof item === 'string') {
          return merge(_defaultOption, {
            activeTagStyle: {
              'backgroundColor': _color,
              'borderColor': _color
            },
            activeTextStyle: { color: _color },
            name: item
          }, this.options || {})
        } else {
          console.error('传参错误，data为对象数组或者字符串数组！')
        }
      })
    },
    /****
     * 单项图例的样式
     */
    itemStyle () {
      let styleText = `${this.legend.itemGap || 0}px`
      if (this.legend.type === 'scroll') {
        if (this.legend.orient === 'horizontal') {
          return {
            'marginRight': styleText
          }
        } else if (this.legend.orient === 'vertical') {
          return {
            'marginBottom': styleText
          }
        }
      }
      return {
        'marginRight': styleText,
        'marginBottom': styleText,
        'cursor': this.legend.disabled ? 'default' : 'pointer'
      }
    },
    /****
     * 分页组图例的样式
     */
    itemsPaneStyle () {
      let style = {}
      if (this.legend.type === 'scroll') {
        if (this.legend.orient === 'horizontal') {
          let left = this.itemsWH.slice(0, this.currentPage - 1).reduce((total, current) => {
            return total + current.width
          }, 0)
          style.marginLeft = -left + 'px'
          return {
            marginLeft: -left + 'px',
            transition: 'all 0.6s'
          }
        } else if (this.legend.orient === 'vertical') {
          let top = this.itemsWH.slice(0, this.currentPage - 1).reduce((total, current) => {
            return total + current.height
          }, 0)
          style.marginTop = -top + 'px'
        }
        if (this.legend.animation) {
          style.transition = `all ${this.legend.animationDurationUpdate}s`
        }
      }
      return style
    }
  },
  watch: {
    dataWithStyle: {
      handler (newVal) {
        if (newVal) {
          this.init()
        }
      },
      deep: true
    },
    paginationText: {
      handler (newVal) {
        if (newVal) {
          this.getLegendLayout()
        }
      },
      deep: true
    }
  },
  methods: {
    init () {
      this.getLegendLayout()
      this.dataWithStyle.forEach(item => {
        this.legendModel[item.name] = this.legendModel[item.name] === undefined ? true : !!this.legendModel[item.name]
      })
    },
    pageChange (type = 'add') {
      if (type === 'add' && this.currentPage < this.items.length) {
        this.currentPage++
      } else if (type === 'sub' && this.currentPage > 1) {
        this.currentPage--
      }
    },
    /****
     * 布局计算
     */
    async getLegendLayout () {
      await this.$nextTick()
      if (!this.legend.show || !this.$refs.legend || this.$el.clientWidth <= 0 || this.$el.clientHeight <= 0) return
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
        left
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
      this.legendHeight = this.$refs.legend.clientHeight - (padding.top + padding.bottom)
      this.legendWidth = this.$refs.legend.clientWidth - (padding.left + padding.right)
      let maxLegendHeight = this.$el.clientHeight - (padding.top + padding.bottom + margin.top + margin.bottom + border.top + border.bottom)
      let maxLegendWidth = this.$el.clientWidth - (padding.left + padding.right + margin.left + margin.right + border.left + border.right)
      let itemsHeight = 0
      let itemsWidth = 0
      let items = []
      let itemsIdx = 0
      this.itemsFloat = 'left'
      let paginationWidth = this.$refs.pagination ? this.$refs.pagination.clientWidth : 0
      let paginationHeight = this.$refs.pagination ? this.$refs.pagination.clientHeight : 0
      if (this.legend.orient === 'horizontal') {
        if (this.legend.type === 'scroll') {
          let allItemsWidth = this.dataWithStyle.reduce((total, item) => {
            return this.$refs[item.name][0].offsetWidth + (this.legend.itemGap || 0) + total
          }, 0)
          if (allItemsWidth > maxLegendWidth) {
            maxLegendWidth -= paginationWidth
          }
        }
        this.dataWithStyle.forEach(item => {
          let itemWidth = this.$refs[item.name][0].offsetWidth + (this.legend.itemGap || 0)
          itemsWidth += itemWidth
          if (itemsWidth > maxLegendWidth) {
            this.itemsWH[itemsIdx] = this.itemsWH[itemsIdx] || {}
            this.itemsWH[itemsIdx].width = itemsWidth - itemWidth
            itemsWidth = itemWidth
            itemsIdx += 1
          }
          items[itemsIdx] = items[itemsIdx] || []
          items[itemsIdx].push(item)
        })
      } else {
        if (Number(left.replace('px', '')) > maxLegendWidth / 2) {
          this.itemsFloat = 'right'
        }
        if (this.legend.type === 'scroll') {
          let allItemsHeight = this.dataWithStyle.reduce((total, item) => {
            return this.$refs[item.name][0].offsetHeight + (this.legend.itemGap || 0) + total
          }, 0)
          if (allItemsHeight > maxLegendHeight) {
            maxLegendHeight -= paginationHeight
          }
        }
        this.dataWithStyle.forEach(item => {
          let itemHeight = this.$refs[item.name][0].offsetHeight + (this.legend.itemGap || 0)
          itemsHeight += itemHeight
          if (itemsHeight > maxLegendHeight) {
            this.itemsWH[itemsIdx] = this.itemsWH[itemsIdx] || {}
            this.itemsWH[itemsIdx].height = itemsHeight - itemHeight
            itemsHeight = itemHeight
            itemsIdx += 1
          }
          items[itemsIdx] = items[itemsIdx] || []
          items[itemsIdx].push(item)
        })
      }
      if (this.legendHeight > maxLegendHeight) {
        this.legendHeight = maxLegendHeight
      }
      if (this.legendWidth > maxLegendWidth) {
        this.legendWidth = maxLegendWidth
      }
      if (items.length <= this.currentPage && items.length > 0) {
        this.currentPage = items.length
      }
      this.items = items
      this.itemsLength = items.length
    },
    itemChange (categoryName) {
      if (this.legend.disabled) return
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
      this.legendModel[categoryName] = !this.legendModel[categoryName]
      this.legendModel = this.legendModel // setter触发
    },
    itemDblClick (categoryName) {
      Object.keys(this.legendModel).forEach(_categoryName => {
        this.legendModel[_categoryName] = _categoryName === categoryName
      })
      this.legendModel = this.legendModel // setter触发
    }
  },
  mounted () {
    this.init()
    window.addEventListener('resize', this.getLegendLayout)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.getLegendLayout)
  }
}
</script>
<style lang="less" scoped>
.legend__container {
  text-align: left;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}
.legend__container--box {
  position: absolute;
  clear: both;
  z-index: 1000;
  &.calc {
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


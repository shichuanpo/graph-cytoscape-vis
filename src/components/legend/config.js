export default {
  show: false,
  type: 'scroll', // plain： 普通图例 / scroll： 滚动图例
  orient: 'vertical', // horizontal: 横向图例 ／ vertical: 纵向图例
  /**
   * 图例容器的样式，标准写法 (position不可改，为absolute)
   * **/
  style: {
    cursor: 'pointer',
    padding: '10px'
  },
  itemGap: 10,
  animation: true, // 翻页是否需要动画
  animationDurationUpdate: 0.8, // 翻页动画时长，单位s
  /**
   * 图例标记的样式
   * **/
  tagStyle: {
    display: 'inline-block',
    verticalAlign: 'middle',
    borderWidth: '1px',
    height: '14px',
    lineHeight: '10px',
    padding: '1px',
    boxSizing: 'border-box',
    width: '25px',
    borderRadius: '3px',
    marginRight: '1px',
    textAlign: 'center'
  },
  /**
   * 图例标记选中的样式，为空的时候自动根据分类配置的颜色
   * **/
  activeTagStyle: {
    backgroundColor: '#c23531'
  },
  /**
   * 图例标记未选中的样式
   * **/
  inactiveTagStyle: {
    backgroundColor: '#ccc'
  },
  /**
   * 图例文字的样式
   * **/
  textStyle: {
    display: 'inline-block',
    verticalAlign: 'middle',
    height: '14px',
    lineHeight: '10px',
    padding: '1px',
    boxSizing: 'border-box',
    fontSize: '12px',
    color: '#333'
  },
  /**
   * 图例文字选中的样式，为空的时候自动根据分类配置的颜色
   * **/
  activeTextStyle: {},
  /**
   * 图例文字未选中的样式
   * **/
  inactiveTextStyle: {
    color: '#ccc'
  },
  formatter: string => string // 格式转换，翻译
}
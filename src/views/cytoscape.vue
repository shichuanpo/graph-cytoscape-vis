<template lang="pug">
  div
   .cytoscape(ref="cytoscape")
   .buttons
      label.checkbox(
        v-for="(gr, index) in groups",
        @click="$cy && checkBoxModel[index] ? $cy.reset('group', gr) : $cy.clusterByProps('group', gr)")
        input(type="checkbox", v-model="checkBoxModel[index]")
        span.color(:style="{background: checkBoxModel[index] ? 'none' : colorByGroup[gr], border: `1px solid ${colorByGroup[gr]}`}")
        span.text {{gr}}
      button(@click="checkBoxModel=[];$cy && $cy.reset()") reset
      //- button(@click="$cy && $cy.remove()") remove
</template>
<script>
import data from '../mock/data';
import Cytoscape from '../cytoscape'
export default {
  name: 'cytoscape',
  data () {
    return {
      $cy: null,
      groups: Array.from(
        new Set(data.map(dat => dat.data.group).filter(g => !!g))
      ),
      checkBoxModel: [],
      colors: [
        '#c23531',
        '#2f4554',
        '#61a0a8',
        '#d48265',
        '#91c7ae',
        '#749f83',
        '#ca8622',
        '#bda29a',
        '#6e7074',
        '#546570',
        '#c4ccd3'
      ]
    };
  },
  computed: {
    colorByGroup () {
      let colorGroup = {}
      this.groups.forEach((g, idx) => {
        idx = idx % this.colors.length
        colorGroup[g] = this.colors[idx]
      })
      return colorGroup
    }
  },
  methods: {},
  mounted () {
    let container = this.$refs.cytoscape
    this.$cy = new Cytoscape(container, data);
    console.log(this.$cy, this.$cy.cytoscape)
  },
};
</script>
<style lang="less" scoped>
.cytoscape {
  text-align: left;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 999;
}
.buttons {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1000;
  .checkbox {
    margin: 0 5px;
    input {
      display: none;
    }
    .color {
      display: inline-block;
      vertical-align: middle;
      width: 25px;
      height: 12px;
      border-radius: 3px;
      margin-right: 3px;
    }
    .text {
      font-size: 12px;
      vertical-align: middle;
    }
  }
}
</style>

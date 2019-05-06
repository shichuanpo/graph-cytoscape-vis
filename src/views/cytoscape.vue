<template lang="pug">
  div
   .cytoscape(ref="cytoscape")
   .buttons
      button(v-for="gr in group", @click="$cy && $cy.clusterByProps('group', gr)") {{gr}}
      button(@click="$cy && $cy.reset()") reset
      button(@click="$cy && $cy.remove()") remove
</template>
<script>
import data from '../mock/data';
import Cytoscape from '../cytoscape'
export default {
  name: 'cytoscape',
  data () {
    return {
      $cy: null,
      group: ['person', 'car', 'house', 'animate', 'company', 'glass']
    };
  },
  methods: {},
  mounted () {
    let container = this.$refs.cytoscape
    this.$cy = new Cytoscape(container, data);
  },
};
</script>
<style lang="less" scoped>
.cytoscape {
  text-align: left;
  position: absolute;
  left: 0;
  top: 100px;
  bottom: 0;
  right: 0;
  z-index: 999;
}
.buttons{
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1000;
}
</style>

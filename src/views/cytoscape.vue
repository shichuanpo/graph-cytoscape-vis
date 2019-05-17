<template lang="pug">
  div
   cytoscape(ref="cytoscape", :options="options", :data="graphData")
   
</template>
<script>
import data from '../mock/data';
import cytoscape from '../cytoscape/index.vue'
import hospital from '../assets/svg/hospital.svg'
import person from '../assets/svg/person.svg'
import computer from '../assets/svg/computer.svg'
import clothes from '../assets/svg/clothes.svg'
export default {
  name: 'cytoscapePage',
  components: { cytoscape },
  data () {
    return {
      options: {
        group: {
          images: {
            hospital,
            clothes,
            computer,
            person
          }
        }
      },
      graphData: []
    };
  },
  mounted () {
    this.graphData = data
  }
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
</style>


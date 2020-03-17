<template>
    <div ref="dom"></div>
</template>

<script>
import echarts from 'echarts'
import { on, off } from '@/libs/tools'
export default {
  name: 'serviceRequests',
  data () {
    return {
      dom: null
    }
  },
  props:{
    value: Array,
    color: Array,
  },
  watch:{
    value(val,oldVal){
      this.initChart()
    }
  },
  methods: {
    resize () {
      this.dom.resize()
    },
    initChart(){
      this.dom = echarts.init(this.$refs.dom)
      let seriesData=[]
      let totalData=0
      this.value.forEach(item => {
        totalData += item.collectNum
        seriesData.push({
          value:item.collectNum,
          name: item.collectName
        })
      })
      const option = {
        title: {
          text: `${totalData}人`,
          x: 'center',
          y: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16
          }
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: "{b}: {c} ({d}%)"
        },
        series: [{
          type: 'pie',
          selectedMode: 'single',
          radius: ['40%', '84%'],
          color: this.color,
          label: {
            normal: {
              position: 'inner',
              formatter: '{d}%',
              textStyle: {
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 14
              }
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: seriesData
        }, 
      ]
    }
     this.dom.setOption(option)
      on(window, 'resize', this.resize)
    }
  },
 
  mounted () {
    this.initChart()
  },
  beforeDestroy () {
    off(window, 'resize', this.resize)
  }
}
</script>

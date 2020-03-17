<template>
  <div ref="dom"></div>
</template>

<script>
import echarts from 'echarts'
import { on, off } from '@/libs/tools'
export default {
  name: 'medicalLine',
   props: {
    value: Array
  },
  data () {
    return {
      dom: null
    }
  },
  methods: {
    resize () {
      this.dom.resize()
    },
    initChart () {
      this.dom = echarts.init(this.$refs.dom)
      let XData = []
      let seriesData = []
      this.value.forEach(item => {
        XData.push((item.diagnoseTime).slice(0, 10))
        seriesData.push(item.jzNum)
      })
      const option = {
        title: {
          text: '每日就诊患者',
          x: 'left'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: 'rgba(255,255,255, 0)'
            }
          }
        },
        grid: {
          top: '19%',
          left: '4%',
          right: '5%',
          bottom: '0%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          axisLine: {
            show: false
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255,255,255,0.2)'
            }
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              color: '#666'
            }
          },
          axisTick: { show: false },
          data: XData
        }],
        yAxis: [{
          type: 'value',
          name: '单位(人次)',
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255,255,255,0.2)'
            }
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              color: '#666'
            }
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(39,110,200,1)'
                },
                {
                  offset: 0.5,
                  color: 'rgba(39,110,200,0.8)'
                },
                {
                  offset: 0.8,
                  color: 'rgba(39,110,200,0.5)'
                },
                {
                  offset: 1,
                  color: 'rgba(39,110,200,0.2)'
                }
                ])
              }
            },
          axisTick: { show: false }
        }],
        series: [{
          name: '就诊患者',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          showSymbol: false,
          lineStyle: {
            normal: {
              width: 1
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(255, 255, 255, 1)'
              }, {
                offset: 1,
                color: 'rgba(255, 255, 255, 0)'
              }], false)
            }
          },
          itemStyle: {
            normal: {
              color: 'rgba(137, 115, 193, 0.6)',
              borderColor: 'rgba(255, 255, 255, 1)',
              borderWidth: 3
            }
          },
          data: seriesData
        }]
      }
      this.dom.setOption(option)
      on(window, 'resize', this.resize)
    }
  },
  watch: {
    value (val, oldVal) {
      this.initChart()
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

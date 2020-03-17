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
      let XData=[]
      let seriesDataTotal=[]
      let seriesDataSuccess=[]
      this.value.forEach(item => {
        XData.push((item.dateEnd).slice(0,10))
        seriesDataTotal.push(item.totalNum)
        seriesDataSuccess.push(item.successNum)
      });
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: 'rgba(255,255,255, 0)'
            }
          }
        },
        legend: {
          selectedMode: false,
          right: '50%',
          top: 12,
          textStyle: {
            color: '#414957',
            fontSize: 12,
          }
        },
        grid: {
          top: '20%',
          left: '1.2%',
          right: '3%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            axisLabel: {
              margin:10,
              textStyle: {
                color: '#666',
              },
            },
            axisLine: {
              show: false,
            },
            axisTick: { show: false,},
            data: XData,
          }
        ],
        yAxis: [{
          name: '单位(人次)',
          type: 'value',
          splitLine: {
            show: true,
            lineStyle: {
              color: '#eee'
            }
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            margin:10,
            textStyle: {
              color: '#666',
            },
          },
          axisTick: { 
            show: false
          }, 
        }
        ],
        series: [
          {
            name: '总随访数',
            type: 'line',
            smooth: true,
            symbol:'circle',
            symbolSize:5,
            showSymbol: false,
            itemStyle: {
              normal: {
                color: 'rgba(0, 133, 255, 1)',
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 5,
              }
            },
            lineStyle:{
              normal:{
                width: 6,
              }
            },
            data: seriesDataTotal,
          },
          {
            name: '随访成功数',
            type: 'line',
            smooth: true,
            symbol:'circle',
            symbolSize:5,
            showSymbol: false,
            itemStyle: {
              normal: {
              color: 'rgba(135, 227, 80,1)',
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 5,
              }
            },
            lineStyle:{
              normal:{
                width: 6,
              }
            },
            data: seriesDataSuccess,
          } 
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

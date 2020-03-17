<template>
	<DatePicker type="datetimerange" :options="shortcutOption" @on-change="handleSelect" v-model="defaultValue"></DatePicker>
</template>

<script>
import { parseTime } from '@/libs/tools.js'
// const todayStart = new Date(new Date().setHours(0, 0, 0, 0))
const todayEnd = new Date(new Date().setHours(23, 59, 59, 59))
export default {
    name: 'dateTimePicker',
    props: {
        timeBegin: {
            type: [String, Date],
            default: ''
        },
        timeEnd: {
            type: [String, Date],
            default: ''
        },
        isDefaultToday: {
            type: Boolean,
            default: false
        }
    },
    data () {
    	return {
    		defaultValue: [],
            shortcutOption: {
                shortcuts: [
                    {
                        text: '最近1周',
                        value () {
                            const end = todayEnd
                            const start = new Date(new Date().setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                            return [start, end]
                        }
                    },
                    {
                        text: '最近1月',
                        value () {
                            const end = todayEnd
                            const start = new Date(new Date().setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                            return [start, end]
                        }
                    },
                    {
                        text: '最近3月',
                        value () {
                            const end = todayEnd
                            const start = new Date(new Date().setHours(0, 0, 0, 0))
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                            return [start, end]
                        }
                    }
                ]
            }
        }
    },
    methods: {
        handleSelect (dateArr) {
            dateArr[1] = dateArr[1].replace('00:00:00', '23:59:59')
            this.$set(this.defaultValue, 1, dateArr[1])
            this.$emit('update:timeBegin', dateArr[0])
            this.$emit('update:timeEnd', dateArr[1])
            this.$emit('chosen')
        }
    },
    mounted () {
    	if (this.timeBegin && this.timeEnd) {
    		this.defaultValue = [this.timeBegin, this.timeEnd]
        } else if (this.isDefaultToday) {
    		// 默认近一个月
    		this.defaultValue = this.shortcutOption.shortcuts[1].value()
            this.defaultValue[0] = parseTime(this.defaultValue[0])
            this.defaultValue[1] = parseTime(this.defaultValue[1])
            this.handleSelect(this.defaultValue)
        }
    }
}
</script>

<style scoped>

</style>

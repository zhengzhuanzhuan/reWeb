<template>
  <keep-alive :exclude="notCacheName">
    <router-view ref="child"/>
  </keep-alive>
</template>
<script>
export default {
  name: 'ParentView',
  data () {
    return {
      cacheChaildName: ''
    }
  },
  computed: {
    notCacheName () {
    	console.log((this.$route.meta && this.$route.meta.notCache) ? this.$route.name : '')
      return (this.$route.meta && this.$route.meta.notCache) ? this.$route.name : ''
    }
  }
}
</script>

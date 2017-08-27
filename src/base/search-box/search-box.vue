<template>
  <div class="search-box">
      <i class="icon-search"></i>
      <input ref="query" class="box" v-model="query" :placeholder="placeholder"/>
      <i @click="clear" v-show="query" class="icon-dismiss"></i>
  </div>
</template>
<script>
import {debounce} from 'common/js/util'

export default {
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  data() {
    return {
      query: ''
    }
  },
  methods: {
    clear() {
      this.query = ''
    },
    setQuery(query) {
      this.query = query
    },
    //滚动前使文本框失去焦点，防止移动端滚动时被键盘档住
    blur() {
      this.$refs.query.blur()
    }
  },
  created() {
    //监听query，当有变化时把其当然事件派发出去，单独写在watcher中也可以
    //debounce为节流，即2秒后再查询
    this.$watch('query', debounce((newQuery) => {
      this.$emit('query', newQuery)
    },200))
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>


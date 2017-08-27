<template>
  <scroll class="listview" :data="data" ref="listview" :listen-scroll="listenScroll" :probe-type="probeType" @scroll="scroll">
    <ul>
        <li v-for="group in data" class="list-group" ref="listGroup">
            <h2 class="list-group-title">{{group.title}}</h2>
            <ul>
                <li @click="selectItem(item)"  v-for="item in group.items" class="list-group-item">
                    <img class="avatar" v-lazy="item.avatar"/>
                    <span class="name">{{item.name}}</span>
                </li>
            </ul>
        </li>
    </ul>
    <!--右侧字母列表-->
    <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove" @touchend.stop>
        <ul>
            <li v-for="(item, index) in shortcutList" class="item" :class="{'current': currentIndex === index}" :data-index="index">{{item}}</li>
        </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
        <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div v-show="!data.length" class="loading-container">
        <loading></loading>
    </div>
  </scroll>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import {getData} from 'common/js/dom'

const TITLE_HEIGHT = 30
const ANCHOR_HEIGHT = 18

export default {
    // 因为在data中会自动添加getter/setter方法用来监听，而我们的touch不需要监听，所以放created里了
    created() {
        this.touch = {}
        this.listenScroll = true
        this.listHeight = []
        this.probeType = 3 //1 会截流,只有在滚动结束的时候派发一个 scroll 事件。2在手指 move 的时候也会实时派发 scroll 事件，不会截流。 3除了手指 move 的时候派发scroll事件，在 swipe（手指迅速滑动一小段距离）的情况下，列表会有一个长距离的滚动动画，这个滚动的动画过程中也会实时派发滚动事件
    },
    data() {
        return {
            scrollY: -1,
            currentIndex: 0,
            diff: -1//每个滚动的title滚动时距离顶部固定的title的距离
        }
    },
    props: {
        data: {
            type: Array,
            default: []
        }
    },
    computed: {
        shortcutList() {
            return this.data.map((group) => {
                return group.title.substr(0, 1)
            })
        },
        fixedTitle() {
            if (this.scrollY > 0) {
                return ''
            }
            return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
        }
    },
    methods: {
        // 点击每项把它派发出去，告诉外部我被点击
        selectItem(item) {
            this.$emit('select', item)
        },
        onShortcutTouchStart(e) {
            // 获取当前DOM上的data-index属性值
            let anchorIndex = getData(e.target, 'index')
            let firstTouch = e.touches[0]
            // 获取刚开始点击时的Y坐标
            this.touch.y1 = firstTouch.pageY
            this.touch.anchorIndex = anchorIndex
            this._scrollTo(anchorIndex)
        },
        onShortcutTouchMove(e) {
            let firstTouch = e.touches[0]
            this.touch.y2 = firstTouch.pageY
            // 滚动距离除以每个字母的高度便可得知滚动到第几个字母了。｜0代表向下取整
            let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
            let anchorIndex = parseInt(this.touch.anchorIndex) + delta
            this._scrollTo(anchorIndex)
        },
        refresh() {
            this.$refs.listview.refresh()
        },
        scroll(pos) {
            this.scrollY = pos.y
        },
        _scrollTo(index) {
            // 点击时的边界值
            if(!index && index !==0) {
                return 
            }
            // 滚动时的边界值
            if(index < 0) {
                index = 0
            }else if(index > this.listHeight.length -2) {
                index = this.listHeight.length -2
            }
            // 点击右侧的字母列表时手动给其计算要滚动的位置
            this.scrollY = -this.listHeight[index]
            // 参数2代码是否缓动滚动，滚动的时间
            this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
        },
        refresh() {
            this.$refs.listview.refresh()
        },
        _calculateHeight() {
            this.listHeight = []
            const list = this.$refs.listGroup
            let height = 0
            this.listHeight.push(height)
            // 获得每个组的高度
            for (let i=0;i<list.length; i++) {
                let item = list[i]
                height += item.clientHeight
                this.listHeight.push(height)
            }
        }
    },
    // 监听data有变化时则重新计算高度
    watch: {
        data() {
            setTimeout(() => {
                this._calculateHeight()
            }, 20)
        },
        scrollY(newY) {
            const listHeight = this.listHeight
            // 当滚动到顶部，newY > 0
            if(newY > 0) {
                this.currentIndex = 0
                return 
            }
            // 在中间部分滚动（）
            for (let i=0;i<listHeight.length-1;i++) {
                let height1 = listHeight[i]
                let height2 = listHeight[i+1]
                // 判断落在哪个区间内
                if(-newY >= height1 && -newY < height2) {
                    this.currentIndex = i
                    this.diff = height2 + newY //上限－滚动距离 
                    return 
                }
            }
            // 当滚动到底部，且-newY大于最后一元素的上限,因为listHeight中每个元素的上限又是上一个元素的下限，所以会多一个，所以减2
            this.currentIndex = listHeight.length -2
        },
        diff(newVal) {
            // 如果正滚动的TITLE上限距顶部距离小于自身的高度时，则要减去自身高度
            let fixedTop = (newVal > 0 && newVal <TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
            if(this.fixedTop === fixedTop) {
                return 
            }
            this.fixedTop = fixedTop
            // 开始偏移
            this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px, 0)`
        }
    },
    components: {
        Scroll,
        Loading
    }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>

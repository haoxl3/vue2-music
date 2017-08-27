<template>
  <div class="slider" ref="slider">
      <div class="slider-group" ref="sliderGroup">
          <slot></slot>
      </div>
      <div class="dots">
          <span class="dot" v-for="(item, index) in dots" :class="{active: currentPageIndex === index}" :key="index"></span>
      </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import {addClass} from 'common/js/dom'

export default {
    name: 'slider',
    props: {
        // 接受传来的参数来定义轮播
        // 是否循环轮播
        loop: {
            type: Boolean,
            default: true
        },
        // 是否自动轮播
        autoPlay: {
            type: Boolean,
            default: true
        },
        // 自动轮播时间间隔
        interval: {
            type: Number,
            default: 4000
        }
    },
    data() {
        return {
            dots: [],
            currentPageIndex: 0
        }
    },
    // 等DOM加载后将执行,最好加上v-if即等有DOM时才会执行mounted
    mounted() {
        // 等20ms后再做操作，也可以用nextTick。之所以是20ms是因为浏览器每隔17ms刷新一次
        setTimeout(() => {
            this._setSliderWidth()
            this._initDots()
            this._initSlider()
            if (this.autoPlay) {
                this._play()
            }
        }, 20)
        // 窗口变时让相应的视口宽度也变
        window.addEventListener('resize', () => {
            if (!this.slider) {
                return
            }
            this._setSliderWidth(true)
            this.slider.refresh()
        })
    },
    activated() {
      if (this.autoPlay) {
        this._play()
      }
    },
    deactivated() {
      clearTimeout(this.timer)
    },
    beforeDestroy() {
      clearTimeout(this.timer)
    },
    methods: {
        // 获得所有图片的总宽度
        _setSliderWidth(isResize) {
            // 获得DOM元素sliderGroup所有的孩子
            this.children = this.$refs.sliderGroup.children
            // 记录所有图片的总宽度
            let width = 0
            // 获得窗口的宽度
            let sliderWidth = this.$refs.slider.clientWidth
            for (let i = 0; i < this.children.length; i++) {
                let child = this.children[i]
                // 给每个图片添加类名（此类名用来浮动等样式）
                addClass(child, 'slider-item')
                // 给每个孩子赋宽度为容器宽度
                child.style.width = sliderWidth + 'px'
                width += sliderWidth
            }
            // 如果需要循环轮播，则还需要首尾各添加图片，所以总宽度要加2个图片宽度
            // 因为窗口宽度变了要重新计算宽度，但不需要再加2，所以要判断下
            if (this.loop && !isResize) {
                width += 2 * sliderWidth
            }
            this.$refs.sliderGroup.style.width = width + 'px'
        },
        // 初始化轮播图的小圆点
        _initDots() {
            this.dots = new Array(this.children.length)
        },
        _initSlider() {
            this.slider = new BScroll(this.$refs.slider, {
                scrollX: true,// 'true' 滚动方向为 X 轴
                scrollY: false,// 'true'滚动方向为 Y 轴
                momentum: false,// true 当快速滑动时是否开启滑动惯性
                snap: true,// false 该属性是给 slider 组件使用的，普通的列表滚动不需要配置
                snapLoop: this.loop,// false 是否可以无缝循环轮播
                snapThreshold: 0.3,// 0.1 用手指滑动时页面可切换的阈值，大于这个阈值可以滑动的下一页
                snapSpeed: 400// 轮播图切换的动画时间
            })
            // 改变currentpageIndex值。当为循环轮播时当运行到最后一个时要将索引值改变
            // 滚动结束时触发
            this.slider.on('scrollEnd', () => {
                let pageIndex = this.slider.getCurrentPage().pageX 
                if (this.loop) {
                    pageIndex -= 1
                }
                this.currentPageIndex = pageIndex
                
                if (this.autoPlay) {
                    clearTimeout(this.timer)
                    this._play()
                }
            })

            this.slider.on('beforeScrollStart', () => {
                if (this.autoPlay) {
                    clearTimeout(this.timer)
                }
            })
        },
        // 自动播放
        _play() {
            let pageIndex = this.currentPageIndex + 1 // 因为头部有2个一样的图片
            if (this.loop) {
                pageIndex += 1
            }
            this.timer = setTimeout(() => {
                this.slider.goToPage(pageIndex, 0, 400)
            }, this.interval)
        }
    }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>

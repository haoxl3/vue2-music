<template>
  <div ref="wrapper">
      <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll'

export default {
    props: {
        // 1会截流,只有在滚动结束的时候派发一个 scroll 事件。
        // 2在手指 move 的时候也会实时派发 scroll 事件，不会截流。 
        // 3除了手指 move 的时候派发scroll事件，在 swipe（手指迅速滑动一小段距离）的情况下，
        // 列表会有一个长距离的滚动动画，这个滚动的动画过程中也会实时派发滚动事件
        probeType: {
            type: Number,
            default: 1
        },
        click: {
            type: Boolean,
            default: true
        },
        data: {
            type: Array,
            default: null
        },
        // 要不要监听滚动事件
        listenScroll: {
            type: Boolean,
            default: false
        },
        // 上拉刷新
        pullup: {
            type: Boolean,
            default: false
        },
        beforeScroll: {
            type: Boolean,
            default: false
        },
        refreshDelay: {
            type: Number,
            default: 20
        }
    },
    mounted() {
        setTimeout(() => {
            this._initScroll()
        }, 20)
    },
    methods: {
        _initScroll() {
            if (!this.$refs.wrapper) {
                return
            }
            this.scroll = new BScroll(this.$refs.wrapper, {
                probeType: this.probeType,
                click: this.click
            })
            // 如果有监听滚动事件，则去派发scroll事件，在外面可拿到 
            if(this.listenScroll) {
                let me = this
                this.scroll.on('scroll', (pos) => {
                    me.$emit('scroll', pos)
                })
            }
            // 如果需要上拉刷新，则监听scrollEnd事件
            if (this.pullup) {
                this.scroll.on('scrollEnd', () => {
                    if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
                    this.$emit('scrollToEnd')
                    }
                })
            }
            //滚动前的回调
            if (this.beforeScroll) {
                this.scroll.on('beforeScrollStart', () => {
                    this.$emit('beforeScroll')
                })
            }
        },
        // 启用 better-scroll，默认开启
        enable() {
            this.scroll && this.scroll.enable()
        },
        // 禁用 better-scroll
        disable() {
            this.scroll && this.scroll.disable()
        },
        // 强制 scroll 重新计算，当 better-scroll 中的元素发生变化的时候调用此方法。
        refresh() {
            this.scroll && this.scroll.refresh()
        },
        scrollTo() {
            this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
        },
        scrollToElement() {
            this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
        }
    },
    // 当data变化时刷新重新计算
    watch: {
        data() {
            setTimeout(() => {
                this.refresh()
            }, this.refreshDelay)
        }
    }
}
</script>


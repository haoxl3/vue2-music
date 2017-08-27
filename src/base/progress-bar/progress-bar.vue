<template>
    <div class="progress-bar" ref="progressBar" @click="progressClick">
        <div class="bar-inner">
            <div class="progress" ref="progress"></div>
            <div class="progress-btn-wrapper" ref="progressBtn" @touchstart.prevent="progressTouchStart" @touchmove.prevent="progressTouchMove" @touchend="progressTouchEnd">
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { prefixStyle } from 'common/js/dom'
const progressBtnWidth = 16
const transform = prefixStyle('transform')

export default {
    props: {
        percent: {
            type: Number,
            default: 0
        }
    },
    created() {
        // 用来挂载一些属性
        this.touch = {}
    },
    methods: {
        progressTouchStart(e) {
            this.touch.initiated = true
            // 手碰触开始位置
            this.touch.startX = e.touches[0].pageX
            // 进度球在进度条上距左边的距离
            this.touch.left = this.$refs.progress.clientWidth
        },
        progressTouchMove(e) {
            // 如果没有先触发touchstart事件，则返回
            if (!this.touch.initiated) {
                return
            }
            const deltaX = e.touches[0].pageX - this.touch.startX
            // 偏移量不能小于0且要小于进度条的宽
            const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
            this._offset(offsetWidth)
        },
        progressTouchEnd(e) {
            this.touch.initiated = false 
            this._triggerPercent()
        },
        progressClick(e) {
            // 返回一个矩形对象。元素左边距离页面左边的距离
            const rect = this.$refs.progressBar.getBoundingClientRect()
            const offsetWidth = e.pageX - rect.left
            this._offset(offsetWidth)
            this._triggerPercent()
        },
        _offset(offsetWidth) {
            this.$refs.progress.style.width = `${offsetWidth}px`
            this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`          
        },
        _triggerPercent() {
            const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
            const percent = this.$refs.progress.clientWidth / barWidth
            // 告诉外界拖动完成，并向外界派发percentChange事件
            this.$emit('percentChange', percent)
        }
    },
    watch: {
        percent(newPercent) {
            // 后一个判断条件是为了让拖动优先。当没有拖动时percent变了进度条才会变，有拖动时按拖动的来计算宽度
            if (newPercent >= 0 && !this.touch.initiated) {
                // 进度条宽度－小球的宽度
                const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
                // 进度条的偏移量＝偏移百分比*总宽度
                const offsetWidth = newPercent * barWidth
                this._offset(offsetWidth)
            }
        }
    }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>

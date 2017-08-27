<template>
<!--子组件scroll向父组件派发scrollToEnd事件-->
  <scroll class="suggest" :data="result" :pullup="pullup" :beforeScroll="beforeScroll" @scrollToEnd="searchMore" @beforeScroll="listScroll" ref="suggest">
      <ul class="suggest-list">
          <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
              <div class="icon">
                  <i :class="getIconCls(item)"></i>
              </div>
              <div class="name">
                  <p class="text" v-html="getDisplayName(item)"></p>
              </div>
          </li>
          <loading v-show="hasMore" title=""></loading>
      </ul>
      <div v-show="!hasMore && !result.length" class="no-result-wrapper">
          <no-result title="抱歉，暂无搜索结果"></no-result>
      </div>
  </scroll>
</template>

<script>
import {search} from 'api/search'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import Singer from 'common/js/singer'
import {mapMutations, mapActions} from 'vuex'
import NoResult from 'base/no-result/no-result'

const TYPE_SINGER = 'singer'
const perpage = 20

export default {
    props: {
        query: {
            type: String,
            default: ''
        },
        showSinger: {
            type: Boolean,
            default: true 
        }
    },
    data() {
        return {
            page: 1,
            result: [],
            beforeScroll: true,//是否触发滚动前事件
            pullup: true,//需要上拉刷新－开关
            hasMore: true
        }
    },
    methods: {
        refresh() {
            this.$refs.suggest.refresh()
        },
        search() {
            this.page = 1
            this.hasMore = true
            this.$refs.suggest.scrollTo(0,0)
            search(this.query, this.page, this.showSinger, perpage).then((res) => {
                if (res.code === ERR_OK) {
                    this.result = this._genResult(res.data)
                    this._checkMore(res.data)
                }
            })
        },
        searchMore() {
            if(!this.hasMore) {
                return
            }
            //如果有更多的，则继续去请求
            this.page++
            search(this.query, this.page, this.showSinger, perpage).then((res) => {
                if (res.code === ERR_OK) {
                    //新请求回来的追加到原来的数组后面
                    this.result = this.result.concat(this._genResult(res.data))
                    this._checkMore(res.data)
                }
            })
        },
        //检查是否有更多
        _checkMore(data) {
            const song = data.song 
            if (!song.list.length || (song.curnum + song.curpage* perpage) >= song.totalnum) {
                this.hasMore = false
            }
        },
        selectItem(item) {
            //跳到歌手页
            if(item.type === TYPE_SINGER) {
                const singer = new Singer({
                    id: item.singermid,
                    name: item.singername
                })
                this.$router.push({
                    path: `/search/${singer.id}`
                })
                //将歌手也传递过去
                this.setSinger(singer)
            } else {
                // vuex中的mapActions中的insertSong方法，添加歌曲
                this.insertSong(item)
            }
            //向外派发一个select事件，可在添加历史记录时使用
            this.$emit('select')
        },
        getIconCls(item) {
            if(item.type === TYPE_SINGER) {
                return 'icon-mine'
            } else {
                return 'icon-music'
            }
        },
        getDisplayName(item) {
            if (item.type === TYPE_SINGER) {
                return item.singername
            } else {
                return `${item.name}-${item.singer}`
            }
        },
        //将数据整合放入数组中
        _genResult(data) {
            let ret = []
            if (data.zhida && data.zhida.singerid) {
                ret.push({...data.zhida,...{type: TYPE_SINGER}})
            }
            if (data.song) {
                ret = ret.concat(this._normalizeSongs(data.song.list))
            }
            return ret
        },
        //将其转为歌曲实例
        _normalizeSongs(list) {
            let ret = []
            list.forEach((musicData) => {
                if (musicData.songid && musicData.albummid) {
                    ret.push(createSong(musicData))
                }
            })
            return ret
        },
        listScroll() {
            //滚动前向search.vue派发listScroll事件
            this.$emit('listScroll')
        },
        //跳到子路由时需要把数据也传过去，所以通过mapMutations来传递
        ...mapMutations({
            setSinger: 'SET_SINGER'
        }),
        ...mapActions([
            'insertSong'
        ])
    },
    watch: {
        query() {
            this.search()
        }
    },
    components: {
        Scroll,
        Loading,
        NoResult
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>


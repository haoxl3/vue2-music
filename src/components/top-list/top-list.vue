<template>
  <transition name="slide">
      <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list'
import {mapGetters} from 'vuex'
import {getMusicList} from 'api/rank'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'

export default {
    computed: {
        title() {
            return this.topList.topTitle
        },
        bgImage() {
            //渲染列表中的第一首歌曲的背景图
            if (this.songs.length) {
            return this.songs[0].image
            }
            return ''
        },
        ...mapGetters([
            'topList'
        ])
    },
    created() {
        this._getMusicList()
    },
    data() {
        return {
            songs: [],
            rank: true
        }
    },
    methods: {
        _getMusicList() {
            //如果在此页面刷新，则上其返回上一个页面
            if (!this.topList.id) {
                this.$router.push('/rank')
                return 
            }
            getMusicList(this.topList.id).then((res) => {
                if (res.code === ERR_OK) {
                    this.songs = this._normalizeSongs(res.songlist)
                }
            })
        },
        //返回song实例的数组
        _normalizeSongs(list) {
            let ret = []
            list.forEach((item) => {
                const musicData = item.data 
                if (musicData.songid && musicData.albumid) {
                    ret.push(createSong(musicData))
                }
            })
            return ret 
        }
    },
    components: {
        MusicList
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>


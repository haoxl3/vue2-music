<template>
    <transition name="slide">
        <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
    </transition>
</template>
<script>
import { mapGetters } from 'vuex'
import { getSingerDetail } from 'api/singer'
import { ERR_OK } from 'api/config'
import {createSong} from 'common/js/song'
import MusicList from 'components/music-list/music-list'
export default {
    data() {
        return {
            songs: []
        }
    },
    computed: {
        // 计算属性中对title及bgImage赋值 
        title() {
            return this.singer.name 
        },
        bgImage() {
            return this.singer.avatar
        },
        ...mapGetters([
            'singer'//getter中的singer
        ])
    },
    created() {
        this._getDetail()
        console.log(this.singer)
    },
    methods: {
        _getDetail() {
            if (!this.singer) {
                //  如果在歌手详情页刷新则让其回到歌手列表页
                this.$router.push('/singer')
                return
            }
            getSingerDetail(this.singer.id).then((res) => {
                if (res.code === ERR_OK) {
                    this.songs = this._normalizeSongs(res.data.list)
                    console.log(this.songs)
                }
            })
        },
        _normalizeSongs(list) {
            let ret = []
            list.forEach((item) => {
                let {musicData} = item 
                if (musicData.songid && musicData.albummid) {
                    // 通过工厂模式来实现实例化
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
<<style lang="stylus">
@import '~common/stylus/variable'

.slide-enter-active, .slide-leave-action{
    transition: all 0.3s;
}
.slide-enter, .slide-leave-to{
    transform: translate3d(100%, 0, 0)
}
</style>


import {mapGetters,mapMutations, mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

// 多个组件可共用mixin.js
// 此方法是监听playlist，当其有变化时scroll插件会重新计算高度，这样页面
// 底部的小播放器便不会挡住其它页面的内容了
export const playlistMixin = {
    computed: {
        ...mapGetters([
            'playlist'
        ]),
    },
    mounted() {
        this.handlePlaylist(this.playlist)
    },
    activated() {
        this.handlePlaylist(this.playlist)
    },
    watch: {
        playlist(newVal) {
            this.handlePlaylist(newVal)
        }
    },
    methods: {
        //当组件调用mixin.js时，组件必须也实现handlePlaylist且会覆盖此处的方法
        handlePlaylist() {
            throw new Error('component must implement handlePlaylist method')
        }
    }
}

export const playerMixin = {
    computed: {
        iconMode() {
            return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop':'icon-random'
        },
        ...mapGetters([
            'sequenceList',
            'playlist',
            'currentSong',
            'mode',
            'favoriteList'//下面要判断歌曲是否在喜欢列表中，所以要取此数据
        ])
    },
    methods: {
        changeMode() {
            const mode = (this.mode + 1) % 3
            // 通过mapMutations中的setPlayMode来改变mode值
            this.setPlayMode(mode)
            // 修改歌曲列表
            let list = null
            if (mode === playMode.random) {
                list = shuffle(this.sequenceList)
            }else{
                list = this.sequenceList
            }
            // 播放模式改变时当前歌曲不要变
            this.resetCurrentIndex(list)
            //记住，只能mutations可改state
            this.setPlaylist(list)
        },
        resetCurrentIndex(list) {
            // findIndex为ES6语法
            let index = list.findIndex((item) => {
                return item.id === this.currentIndex
            })
            this.setCurrentIndex(index)
        },
        getFavoriteIcon(song) {
            if (this.isFavorite(song)) {
                return 'icon-favorite'
            } 
            return 'icon-not-favorite'
        },
        toggleFavorite(song) {//在playlist中调用此方法
            //如果歌曲在收藏里，则删除它；没在的话则添加到收藏里
            if(this.isFavorite(song)) {
                this.deleteFavoriteList(song)
            }else{
                //为mapActions中的方法
                this.saveFavoriteList(song)
            }
        },
        // 判断歌曲是否在收藏里
        isFavorite(song) {
            const index = this.favoriteList.findIndex((item) => {
                return item.id === song.id
            })
            return index > -1
        },
        ...mapMutations({
            setPlayingState: 'SET_PLAYING_STATE',
            setCurrentIndex: 'SET_CURRENT_INDEX',
            setPlayMode: 'SET_PLAY_MODE',
            setPlaylist: 'SET_PLAYLIST'
        }),
        ...mapActions([
            'saveFavoriteList',//为actions.js中的方法
            'deleteFavoriteList'
        ])
    }
}

// 搜索相关的公共方法
export const searchMixin = {  
  data() {
    return {
        query: '',
        refreshDelay: 120
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    addQuery(query) {
      //引用子组件的方法
      this.$refs.searchBox.setQuery(query)
    },
    onQueryChange(query) {
      this.query = query
    },
    //
    blurInput() {
      //父组件search.vue调用子组件search-box.vue中的blur方法
      this.$refs.searchBox.blur()
    },
    //保存搜索到历史记录中
    saveSearch() {
      this.saveSearchHistory(this.query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}
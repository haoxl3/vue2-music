import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache'

const state = {
    singer: {},
    playing: false,
    fullScreen: false,
    playlist: [],
    sequenceList: [],
    mode: playMode.sequence,
    currentIndex: -1,
    disc: {},
    topList: {},
    searchHistory: loadSearch(),//获得本地缓存
    playHistory: loadPlay(),//初始值也从缓存中读
    favoriteList: loadFavorite()//收藏列表
}

export default state

/**1.定义state.js中的值
 * 2.定义mutation-type.js中的方法
 * 3.定义mutation.js方法
 * 4.定义getter.js方法
 * 5.定义action.js方法
 * */ 
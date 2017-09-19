// 如果需要修改多个mutation，一般会把其封装成一个action
import * as types from './mutation-type'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import {saveSearch, clearSearch, deleteSearch, savePlay} from 'common/js/cache'

function findIndex(list, song) {
    // 找到随机播放对应顺序歌曲的索引
    return list.findIndex((item) => {
        return item.id === song.id
    })
}

export const selectPlay = function ({commit, state}, {list,index}) {
    commit(types.SET_SEQUENCE_LIST, list)
    if (state.mode === playMode.random) {
        let randomList = shuffle(list)
        commit(types.SET_PLAYLIST, randomList)
        index = findIndex(randomList, list[index])
    }else{
        commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = function({commit}, {list}){
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function({commit, state}, song) {
    //因为只能在mutation回调中修改state的值，所以此处用slice获得其父本
    let playlist = state.playlist.slice() 
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex

    //记录当前歌曲
    let currentSong = playlist[currentIndex]
    //查找当前列表中是否有待插入的歌曲并返回其索引
    let fpIndex = findIndex(playlist, song)
    //因为要插入歌曲，所以索引要加1
    currentIndex++
    //插入这首歌曲到当前索引位置
    playlist.splice(currentIndex, 0, song)
    //如果已经包含了这首歌，则找到它并删掉
    if(fpIndex > -1) {
        //如果当前插入的序号大于列表中的序号
        if(currentIndex > fpIndex) {
            playlist.splice(fpIndex, 1)
            currentIndex--//因为歌曲长度少了一位
        }else{
            //如果当前插入的序号小于列表中的序号，原歌曲索引已加1了
            playlist.splice(fpIndex+1, 1)
        }
    }

    let currentSIndex = findIndex(sequenceList, currentSong) + 1
    let fsIndex = findIndex(sequenceList, song)
    sequenceList.splice(currentSIndex, 0, song)

    if (fsIndex > -1) {
        if (currentSIndex > fsIndex) {
            sequenceList.splice(fsIndex, 1)
        } else {
            sequenceList.splice(fsIndex+ 1, 1)
        }
    }

    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function({commit}, query) {
    commit(types.SET_SEARCH_HISTORY,saveSearch(query))
}

export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

//删除歌曲
export const deleteSong = function({commit, state}, song) {
    let playlist = state.playlist.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
    let pIndex = findIndex(playlist, song)
    playlist.splice(pIndex, 1)
    let sIndex = findIndex(sequenceList, song)
    sequenceList.splice(sIndex, 1)

    if (currentIndex > pIndex || currentIndex === playlist.length) {
        currentIndex--
    }

    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)

    //如果把歌曲都删完了，需将播放状态置为false
    if (!playlist.length) {
        commit(types.SET_PLAYING_STATE, false)
    }else{
        commit(types.SET_PLAYING_STATE, true)
    }
}

//清空歌曲
export const deleteSongList = function({commit}) {
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_SEQUENCE_LIST, [])
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_PLAYING_STATE, false)
}
//存放歌曲
export const savePlayHistory = function({commit}, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
}
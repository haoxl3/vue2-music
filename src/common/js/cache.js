//一个插件关于存取localstorage，session等
import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 15

const PLAY_KEY = '__paly__'
const PLAY_MAX_LENGTH = 200

function insertArray(arr, val, compare, maxLen) {
    //在arr数组中查找compare，并返回其索引值
    const index = arr.findIndex(compare)
    //因为设置的历史记录最大为15条，所以有重复时要将原来的删除了，新的放数据最
    //前面，如果数组长度超过了15，则删除最后一个记录
    if(index > 0) {
        arr.splice(index, 1)
    }
    arr.unshift(val)
    if(maxLen && arr.length > maxLen) {
        arr.pop()
    }
}

function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

export function saveSearch(query) {
    let searches = storage.get(SEARCH_KEY, [])
    insertArray(searches, query, (item)=>{
        return item === query
    },SEARCH_MAX_LENGTH)
    storage.set(SEARCH_KEY,searches)
    return searches
}

export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

//从本地缓存读取数据做初始值
export function loadSearch() {
    return storage.get(SEARCH_KEY, [])
}

// 写入歌
export function savePlay(song) {
    let songs = storage.get(PLAY_KEY, [])
    insertArray(songs, song, (item) => {
        return item.id === song.id
    }, PLAY_MAX_LENGTH)
    storage.set(PLAY_KEY, songs)
    return songs
}
//读取歌
export function loadPlay() {
    return storage.get(PLAY_KEY, [])
}
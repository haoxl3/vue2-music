import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

// 动态加载模块
const Recommend = (resolve) => {
  import('components/recommend/recommend').then((recommend) => {
    resolve(recommend)
  })
}

const Singer = (resolve) => {
  import('components/singer/singer').then((recommend) => {
    resolve(recommend)
  })
}

const Rank = (resolve) => {
  import('components/rank/rank').then((recommend) => {
    resolve(recommend)
  })
}

const Search = (resolve) => {
  import('components/search/search').then((recommend) => {
    resolve(recommend)
  })
}

const SingerDetail = (resolve) => {
  import('components/singer-detail/singer-detail').then((recommend) => {
    resolve(recommend)
  })
}

const Disc = (resolve) => {
  import('components/disc/disc').then((recommend) => {
    resolve(recommend)
  })
}

const TopList = (resolve) => {
  import('components/top-list/top-list').then((recommend) => {
    resolve(recommend)
  })
}

const UserCenter = (resolve) => {
  import('components/user-center/user-center').then((recommend) => {
    resolve(recommend)
  })
}

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    }, {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: Disc
        }
      ]
    }, {
      path: '/singer',
      component: Singer,
      children: [{
        path: ':id',
        component: SingerDetail
      }]
    }, {
      path: '/rank',
      component: Rank,
      children: [
        {
          path: ':id',
          component: TopList
        }
      ]
    }, {
      path: '/search',
      component: Search,
      children: [{
        path: ':id',
        component: SingerDetail
      }]
    },
    {
      path: '/user',
      component: UserCenter
    }
  ]
})

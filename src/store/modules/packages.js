
import createApi from '@/api'
import { JSDELIVR_API_URL, NPM_API_URL, PACKAGES_PER_PAGE } from '@/constants'

const jsDelivrApi = createApi(JSDELIVR_API_URL)
const npmApi = createApi(NPM_API_URL)

const searchCache = new Map()

const defaultState = {
  list: [],
  total: 0,
  isListLoading: false,
  isPackageLoading: false,
  currentPackage: {}
}

export default {
  namespaced: true,
  state: defaultState,
  mutations: {
    SET_LIST: (state, payload) => {
      state.list = payload
    },
    SET_TOTAL: (state, payload) => {
      state.total = payload
    },
    SET_IS_LIST_LOADING: (state, payload) => {
      state.isListLoading = payload
    },
    SET_PACKAGE_LOADING: (state, payload) => {
      state.isPackageLoading = payload
    },
    SET_CURRENT_PACKAGE: (state, payload) => {
      state.currentPackage = payload
    }
  },
  getters: {
  },
  actions: {
    async search ({ commit }, { text = '', page = 1, reset = false }) {
      if (reset) {
        searchCache.clear()
      }

      const cached = searchCache.get([text, page].join('.'))
      if (cached) {
        commit('SET_LIST', cached)
        return
      }

      const from = (page - 1) * PACKAGES_PER_PAGE
      commit('SET_IS_LIST_LOADING', true)
      const searchResult = await npmApi.get('/-/v1/search', { text, size: PACKAGES_PER_PAGE, from })
      commit('SET_IS_LIST_LOADING', false)
      commit('SET_LIST', searchResult.objects)
      commit('SET_TOTAL', searchResult.total)
      searchCache.set([text, page].join('.'), searchResult.objects)
    },
    async fetchPackage ({ commit }, { name, version }) {
      commit('SET_CURRENT_PACKAGE', {
        name,
        version
      })
      commit('SET_PACKAGE_LOADING', true)
      const promises = [jsDelivrApi.get(`/package/npm/${name}`), jsDelivrApi.get(`/package/npm/${name}@${version}`), jsDelivrApi.get(`/package/npm/${name}/stats`)]
      const result = await Promise.all(promises)
      commit('SET_CURRENT_PACKAGE', {
        name,
        version,
        versionsData: result[0],
        filesData: result[1],
        statsData: result[2]
      })
      commit('SET_PACKAGE_LOADING', false)
    }
  }
}

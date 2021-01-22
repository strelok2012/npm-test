
import createApi from '@/api'
import { JSDELIVR_API_URL, NPM_API_URL, PACKAGES_PER_PAGE } from '@/constants'

const jsDelivrApi = createApi(JSDELIVR_API_URL)
const npmApi = createApi(NPM_API_URL)

const searchCache = new Map()
const packageCache = new Map()

const defaultState = {
  list: [],
  total: 0,
  isListLoading: false,
  isPackageLoading: false,
  currentPackage: {},
  errorText: '',
  showError: false,
  packageDialog: false
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
    },
    SET_ERROR_TEXT: (state, payload) => {
      state.errorText = payload
    },
    SET_SHOW_ERROR: (state, payload) => {
      state.showError = payload
    },
    SET_PACKAGE_DIALOG: (state, payload) => {
      state.packageDialog = payload
    }
  },
  getters: {
  },
  actions: {
    async search ({ commit }, { text = '', page = 1, reset = false }) {
      if (reset) {
        searchCache.clear()
      }

      const searchKey = `${text}@${page}`

      const cached = searchCache.get(searchKey)
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
      searchCache.set(searchKey, searchResult.objects)
    },
    async fetchPackage ({ commit, dispatch }, { name, version }) {
      commit('SET_ERROR_TEXT', '')
      const packageKey = `${name}@${version}`

      const cached = packageCache.get(packageKey)
      if (cached) {
        commit('SET_CURRENT_PACKAGE', cached)
        return
      }

      commit('SET_CURRENT_PACKAGE', {
        name,
        version
      })
      commit('SET_PACKAGE_LOADING', true)
      try {
        const promises = [jsDelivrApi.get(`/package/npm/${name}`), jsDelivrApi.get(`/package/npm/${name}@${version}`), jsDelivrApi.get(`/package/npm/${name}/stats`)]
        const result = await Promise.all(promises)
        const packageData = {
          name,
          version,
          versionsData: result[0],
          filesData: result[1],
          statsData: result[2],
          badge: `https://data.jsdelivr.com/v1/package/npm/${name}/badge`
        }
        commit('SET_CURRENT_PACKAGE', packageData)
        commit('SET_PACKAGE_LOADING', false)
        packageCache.set(packageKey, packageData)
      } catch (e) {
        dispatch('setError', 'Package fetch failed')
      }
    },
    setError ({ commit }, text) {
      if (text && text.length) {
        commit('SET_ERROR_TEXT', text)
        commit('SET_SHOW_ERROR', true)
        commit('SET_PACKAGE_DIALOG', false)
      } else {
        commit('SET_ERROR_TEXT', '')
        commit('SET_SHOW_ERROR', false)
      }
    }
  }
}

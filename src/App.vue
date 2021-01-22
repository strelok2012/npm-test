<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
    </v-app-bar>

    <v-main>
      <v-container>
        <v-form @submit.stop.prevent="handleNewSearch">
          <v-row>
            <v-col cols="6">
              <v-text-field label="Search" hint="Package name or keywords" v-model="searchPattern" clearable persistent-hint></v-text-field>
            </v-col>
            <v-col class="d-flex align-center">
              <v-btn
                class="mx-2"
                fab
                dark
                small
                color="primary"
                type="submit"
              >
                <v-icon dark>
                  mdi-magnify
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
        <v-row class="d-flex justify-center">
          <div class="text-center">
            <v-pagination
              v-model="currentPage"
              v-if="packagesTotal"
              :length="pageCount"
              :disabled="isLoading"
              :total-visible="20"
              circle
            ></v-pagination>
          </div>
        </v-row>
        <v-row>
          <v-data-table
            :headers="headers"
            :items="packages"
            :page.sync="currentPage"
            :server-items-length="packagesTotal"
            :footer-props="{
              'items-per-page-options': [$options.PACKAGES_PER_PAGE]
            }"
            :items-per-page="$options.PACKAGES_PER_PAGE"
            :loading="isLoading"
            item-class="tableClass"
            hide-default-footer
            class="elevation-1 results-table"
            @page-count="pageCount = $event"
            @click:row="handleRowClick"
          >
            <template v-slot:item.author="{ item }">
              {{ item.author ? item.author.name : 'Not Specified' }}
            </template>
            <template v-slot:item.date="{ item }">
              {{ formatDate(new Date(item.date)) }}
            </template>
            <template v-slot:item.keywords="{ item }">
              {{ item.keywords ? item.keywords.join(', ') : '' }}
            </template>
            <template v-slot:item.links="{ item }" @click.stop.prevent="">
              <div @click.stop>
                <a v-if="item.links.npm" :href="item.links.npm" target="_blank">NPM</a>
                <br />
                <a v-if="item.links.homepage" :href="item.links.homepage" target="_blank">Homepage</a>
                <br />
                <a v-if="item.links.repository" :href="item.links.repository" target="_blank">Repository</a>
                <br />
                <a v-if="item.links.bugs" :href="item.links.bugs" target="_blank">Bugs</a>
              </div>
            </template>
          </v-data-table>
        </v-row>
      </v-container>
    </v-main>
    <v-dialog
      v-model="showDialog"
      scrollable
    >
      <PackageDialog :current-package="currentPackage" />
    </v-dialog>
  </v-app>
</template>

<script>
import { PACKAGES_PER_PAGE } from '@/constants'
import { formatDate } from '@/utils'

import PackageDialog from '@/components/PackageDialog.vue'

export default {
  name: 'App',
  components: {
    PackageDialog
  },
  data: () => ({
    queryParamsKeys: {
      currentPage: { parser: parseInt },
      searchPattern: { }
    },
    searchPattern: '',
    headers: [
      { text: 'Name', value: 'name', sortable: false },
      { text: 'Version', value: 'version', sortable: false },
      { text: 'Description', value: 'description', sortable: false },
      { text: 'Author', value: 'author', sortable: false },
      { text: 'Date', value: 'date', sortable: false },
      { text: 'Keywords', value: 'keywords', sortable: false },
      { text: 'Links', value: 'links', sortable: false }
    ],
    currentPage: 1,
    pageCount: 0,
    showDialog: false
  }),
  created () {
    this.getQueryParams()
    if (this.currentPage === 1) {
      this.search()
    }
  },
  methods: {
    getQueryParams () {
      const urlParams = new URLSearchParams(window.location.search)
      const paramKeys = Object.keys(this.queryParamsKeys)
      for (const key of paramKeys) {
        const urlParam = urlParams.get(key)
        if (urlParam) {
          this[key] = this.queryParamsKeys[key].parser ? this.queryParamsKeys[key].parser(urlParam) : urlParam
        }
      }
    },
    setQueryParams () {
      const urlParams = new URLSearchParams()
      const paramKeys = Object.keys(this.queryParamsKeys)
      for (const key of paramKeys) {
        urlParams.set(key, this[key] || '')
      }
      window.history.replaceState({}, '', `${location.pathname}?${urlParams}`)
    },
    search (reset = false) {
      this.setQueryParams()
      this.$store.dispatch('packages/search', { text: this.searchPattern, page: this.currentPage, reset })
    },
    handleNewSearch () {
      this.currentPage = 1
      this.search(true)
    },
    handleRowClick ({ name, version }) {
      this.$store.dispatch('packages/fetchPackage', { name, version })
      this.showDialog = true
    },
    formatDate
  },
  computed: {
    packages () {
      return this.$store.state.packages.list.map(p => ({ ...p.package, tableClass: 'results-table__row' }))
    },
    packagesTotal () {
      return this.$store.state.packages.total
    },
    isLoading () {
      return this.$store.state.packages.isListLoading
    },
    currentPackage () {
      return this.$store.state.packages.currentPackage
    },
    isPackageLoading () {
      return this.$store.state.packages.isPackageLoading
    }
  },
  watch: {
    currentPage (newVal, oldVal) {
      this.search()
    }
  },
  PACKAGES_PER_PAGE
}
</script>

<style>
.v-data-table {
  min-width: 100%;
}

.results-table__row {
  cursor: pointer;
}
</style>

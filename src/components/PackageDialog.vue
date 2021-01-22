<template>
  <v-card>
    <v-card-title>
      <span class="headline">{{ currentPackage.name }} ({{ currentPackage.version }})</span>
    </v-card-title>
    <v-card-text>
      <v-row >
        <v-col cols="3" v-if="currentPackage.filesData" class="files-list">
            <v-treeview
              v-model="tree"
              :items="items"
              activatable
              item-key="name"
              item-children="files"
              open-on-click
            >
              <template v-slot:prepend="{ item, open }">
                <v-icon v-if="item.type === 'directory'">
                  {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                </v-icon>
                <v-icon v-else>
                  {{ files[item.name.split('.').pop()] ? files[item.name.split('.').pop()] : files['txt'] }}
                </v-icon>
              </template>
            </v-treeview>
        </v-col>
        <v-col
          v-else
            cols="3"
          >
            <v-skeleton-loader
              class="mb-6"
              :boilerplate="true"
              type="list-item@5"
            ></v-skeleton-loader>
        </v-col>
        <v-col cols="3" v-if="currentPackage.versionsData">
          <v-list>
            <v-subheader>VERSIONS</v-subheader>
            <v-list-item-group
              class="versions-list"
              color="primary"
            >
              <v-list-item
                v-for="(item, i) in currentPackage.versionsData.versions"
                :key="i"
                :href="`https://www.npmjs.com/package/${currentPackage.name}/v/${item}`"
                target="_blank"
              >
                <v-list-item-content>
                  <v-list-item-title v-text="item"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-col>
        <v-col
          v-else
            cols="3"
          >
            <v-skeleton-loader
              class="mb-6"
              :boilerplate="true"
              type="list-item@5"
            ></v-skeleton-loader>
        </v-col>
        <v-col cols="3" v-if="currentPackage.statsData" class="stats-list">
          <h3>Rank: {{ currentPackage.statsData.rank }}</h3>
          <br />
          <h3>Total downloads: {{ currentPackage.statsData.total }}</h3>
          <br />
          <template v-if="currentPackage.statsData.versions">
            <h3 v-if="currentPackage.statsData.versions[currentPackage.version]">Total downloads ({{ currentPackage.version }}): {{ currentPackage.statsData.versions[currentPackage.version].total }}</h3>
            <br />
            <h3>Downloads by last month ({{ currentPackage.version }}):</h3>
            <h4 v-for="(ds, i) in getDates(currentPackage.statsData.versions[currentPackage.version] ? currentPackage.statsData.versions[currentPackage.version].dates : [])" :key="i">{{ ds.date }}: {{ ds.downloads }}</h4>
          </template>

        </v-col>
        <v-col
          v-else
          cols="3"
        >
            <v-skeleton-loader
              class="mb-6"
              :boilerplate="true"
              type="list-item@5"
            ></v-skeleton-loader>
        </v-col>

        <v-col cols="3" v-if="currentPackage.badge" class="stats-list">
          Badge:<br />
          <kbd><a class="cdn-link" target="_blank" :href="currentPackage.badge">{{ currentPackage.badge }}</a></kbd>
          <br />
          <img :src="currentPackage.badge" />
          <br />
          <template v-if="currentPackage.filesData.default">
            CDN Link:<br />
            <kbd><a class="cdn-link" target="_blank" :href="`https://cdn.jsdelivr.net/npm/${currentPackage.name}@${currentPackage.version}${currentPackage.filesData.default}`">{{ `https://cdn.jsdelivr.net/npm/${currentPackage.name}@${currentPackage.version}${currentPackage.filesData.default}` }}</a></kbd>
          </template>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { formatDate } from '@/utils'

export default {
  props: {
    currentPackage: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      tree: [],
      files: {
        html: 'mdi-language-html5',
        js: 'mdi-nodejs',
        json: 'mdi-code-json',
        md: 'mdi-language-markdown',
        pdf: 'mdi-file-pdf',
        png: 'mdi-file-image',
        txt: 'mdi-file-document-outline',
        xls: 'mdi-file-excel'
      }
    }
  },
  computed: {
    items () {
      return this.currentPackage.filesData.files || []
    }
  },
  methods: {
    getDates (dates) {
      return Object.keys(dates)
        .map(key => ({ date: new Date(key), downloads: dates[key] }))
        .sort((a, b) => b.date - a.date)
        .map(d => ({ ...d, date: formatDate(d.date) }))
    }
  }
}
</script>

<style scoped>
.versions-list {
  max-height: 540px;
  overflow-y: auto;
}

.files-list {
  max-height: 600px;
  overflow-y: auto;
}

.stats-list {
  max-height: 600px;
  overflow-y: auto;
}

.cdn-link {
  color: white;
}
</style>

<template>
  <div class="section shapes">
    <div class="container">
      <TableHeader :title="tableTitle" :infoURL="infoURL"></TableHeader>
    </div>
    <div class="map-container">
      <div class="dynamic-map-container">
        <div class="top-map-bar">
          <div class="right-content">
            <button class="btn flat white"><span>{{ $t('general.howToUse') }}</span><i class="material-icons">help_outline</i></button>
          </div>
        </div>
        <ShapesTable ref="table" :projectId="$route.params.projectId" @focus-shape="displayShape"></ShapesTable>
        <ShapesMap ref="map" :projectId="$route.params.projectId"></ShapesMap>
      </div>
      <router-link :to="{name: 'createShape', params: {projectId: $route.params.projectId}}" class="btn floating">
        <i class="material-icons">add</i>
      </router-link>
    </div>
  </div>
</template>

<script>
import ShapesTable from "@/components/shape/ShapesTable.vue";
import ShapesMap from "@/components/shape/ShapesMap.vue";
import TableHeader from "@/components/vuetable/TableHeader";

export default {
  components: {
    ShapesTable,
    ShapesMap,
    TableHeader
  },
  data() {
    return {
      tableTitle: 'Shapes',
      infoURL: "https://developers.google.com/transit/gtfs/reference#shapestxt",
      activeShape: null
    };
  },
  methods: {
    displayShape(shape) {
      this.$refs.map.displayShape(shape);
    }
  }
};
</script>

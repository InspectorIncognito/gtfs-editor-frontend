<template>
  <div v-bind:style="{ 'background-image': 'url(\'' + createURL() + '\'), url(\'' + require('@/assets/img/bg-empty-map.svg') + '\')' }" :width="width" :height="height" class="envelope-map" ref="mapContainer" @click="enableMapInteraction" @dragstart="enableMapInteraction"></div>
</template>

<script>
  import config from "@/config.js"
  const mapboxgl = require('mapbox-gl');
  mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;

  export default {
    name: "EnvelopeMap",
    props: {
      project: {
        type: Object,
        required: true,
      },
      width: {
        type: Number,
        required: true
      },
      height: {
        type: Number,
        required: true
      },
      enableInteraction: {
        type: Boolean,
        required: false,
        default: true
      }
    },
    data() {
      return {
        map: null,
        mapIsLoading: false
      }
    },
    methods: {
      createURL() {
        let url = '';
        if (this.project.envelope) {
          let mapStyle = 'streets-v11';
          let mapboxAccessToken = process.env.VUE_APP_MAPBOX_TOKEN;
          let geojson = JSON.parse(JSON.stringify(this.project.envelope));
          geojson.properties.stroke = '#7DC242';
          geojson.properties['stroke-width'] = 1;
          geojson.properties.fill = '#7DC242';
          geojson.properties['fill-opacity'] = 0.05;
          geojson = encodeURIComponent(JSON.stringify(geojson)).replace(/\s/g, '');
          url = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/geojson(${geojson})/auto/${this.width}x${this.height}?access_token=${mapboxAccessToken}`;
        }
        return url;
      },
      enableMapInteraction() {
        if (this.enableInteraction && !this.mapIsLoading && this.map===null) {
          this.mapIsLoading = true;
          let center = this.project.envelope?this.project.envelope.geometry.coordinates[0][0]:[0,0];
          this.map = new mapboxgl.Map({
            container: this.$refs.mapContainer,
            center: center,
            zoom: config.map_base_zoom,
            style: 'mapbox://styles/mapbox/streets-v11'
          });
          this.map.on('load', () => {
            this.addLayers();
            this.setCoordinates();
            this.$emit('load');
            this.mapIsLoading = false;
          });
        }
      },
      addLayers() {
        this.map.addSource('envelope-source', {
          'type': 'geojson',
          'data': this.project.envelope,
        });
        this.map.addLayer({
          'id': 'envelope-layer',
          'type': 'fill',
          'source': 'envelope-source',
          'layout': {},
          'paint': {
            'fill-outline-color': 'gray',
            'fill-color': '#7DC242',
            'fill-opacity': 0.05
          }
        });
        this.map.addLayer({
          'id': 'envelope-stroke',
          'type': 'line',
          'source': 'envelope-source',
          'layout': {},
          'paint': {
            'line-color': '#7DC242',
            'line-width': 1
          }
        });
      },
      setCoordinates() {
        let coordinates = this.project.envelope.geometry.coordinates[0];
        if (coordinates.length > 0) {
          var bounds = coordinates.reduce(function (bounds, coord) {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          this.map.fitBounds(bounds, {
            padding: 20,
            animate: false,
          });
        }
      }
    }
  };
</script>

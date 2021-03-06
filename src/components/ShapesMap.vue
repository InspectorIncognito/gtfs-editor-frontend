<template>
  <div id="map" ref="mapContainer" class="map">
  </div>

</template>




<script>
  import shapesAPI from "@/api/shapes.api";
  const mapboxgl = require('mapbox-gl');
  import shapeMapMixin from "@/mixins/shapeMapMixin"
  import envelopeMixin from "@/mixins/envelopeMixin"
  mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;
  import config from "@/config.js"

  export default {
    name: "ShapesMap",
    mixins: [
      shapeMapMixin,
      envelopeMixin,
    ],
    data: function () {
      return {
        geojson: {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': []
          }
        },
        pointsGeojson: {
          type: 'FeatureCollection',
          features: []
        },
      };
    },
    props: {
      project: {
        required: true,
      }
    },
    mounted() {
      this.$nextTick(() => {
        let map = new mapboxgl.Map({
          container: this.$refs.mapContainer,
          style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        });
        this.map = map;
        map.on('load', () => {
          this.envelope(this.map, this.project);
          this.addLayers();
          this.$emit('load');
        })
      });
    },
    methods: {
      addLayers() {
        this.map.addSource('shape', {
          'type': 'geojson',
          'data': this.geojson,
        });
        this.map.addSource('shape-pts', {
          'type': 'geojson',
          'data': this.pointsGeojson,
        });
        this.map.addLayer({
          'id': 'shape-layer',
          'type': 'line',
          'source': 'shape',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': config.shape_line_color,
            'line-width': 2
          }
        });
        this.map.addLayer({
          id: "shape-circle-layer",
          type: "circle",
          source: "shape-pts",
          paint: {
            "circle-radius": [
              'interpolate',
              ['linear'],
              ['zoom'],
            ].concat(config.shape_point_zoom),
            "circle-color": config.shape_point_color,
          }
        });
        this.map.addLayer({
          id: "shape-label-layer",
          type: "symbol",
          source: "shape-pts",
          minzoom: 16,
          layout: {
            "text-field": "{label}",
            "text-anchor": "top",
            "text-offset": [0, 0.5],
            "text-allow-overlap": true,
          }
        });
        let img = require('../assets/img/arrow-small.png')
        this.map.loadImage(img, (err, image) => {
          if (err) {
            console.log(err);
            return;
          }
          this.map.addImage('arrow', image);
          this.map.addLayer({
            'id': 'arrowId',
            'type': 'symbol',
            'source': 'shape',
            'layout': {
              'symbol-placement': 'line',
              'symbol-spacing': 100,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-image': 'arrow',
              'icon-size': 1,
              'visibility': 'visible'
            }
          });
        });
        this.map.on('click', 'shape-circle-layer', (evt) => {
          let feature = evt.features[0];
          if (this.selectingRange) {
            this.range.push(feature.properties.label);
            if (this.range.length === 2) {
              this.$emit("range", {
                start: this.range[0],
                finish: this.range[1],
              })
              this.selectingRange = false;
            }
          }
        })

      },
      beginPointSelection() {
        this.selectingRange = true;
        this.range = [];
      },
      displayShape(shape) {
        shapesAPI.shapesAPI.detail(this.project, shape.id).then(response => {
          let points = response.data.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
          this.pointsGeojson.features = response.data.points.map(point => {
            let coordinates = [
              point.shape_pt_lon,
              point.shape_pt_lat,
            ];
            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates,
              },
              properties: {
                label: point.shape_pt_sequence,
              }
            }
          })
          this.map.getSource('shape-pts').setData(this.pointsGeojson);
          this.setShapeCoordinates(points);
        }).catch(err => console.log(err));
      },
      setShapeCoordinates(points) {
        this.geojson.geometry.coordinates = points;
        this.map.getSource('shape').setData(this.geojson);
        this.map.fitBounds(this.getBounds(points), {
          padding: 50,
        });
      },
    },
  };
</script>

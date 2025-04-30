<template>
  <div ref="map" class="map"></div>
</template>

<script>
import shapesAPI from "@/api/gtfs/shapes.api";
import shapeMapMixin from "@/mixins/shapeMapMixin";
import envelopeMixin from "@/mixins/envelopeMixin";
import config from "@/config";

const mapboxgl = require('mapbox-gl');
const turf = require('@turf/turf');
mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;

export default {
  name: "ShapesMap",
  mixins: [
    shapeMapMixin,
    envelopeMixin,
  ],
  data: function () {
    return {
      ruleSourceName: 'rule-source',
      ruleButtonId: 'rule-button',
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
    projectId: {
      required: true,
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.map = new mapboxgl.Map({
        container: this.$refs.map,
        style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
        logoPosition: 'bottom-left',
      });
      const buttonId = this.ruleButtonId;
        class RulerControl {
        onAdd() {
          this._div = document.createElement('div');
          this._div.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
          this._div.innerHTML = `<button id="` + buttonId + `" class="syncAltSolid"><span class="material-icons">square_foot</span></button>`;
          return this._div;
          }
        }
      this.map.addControl(new RulerControl(), 'top-right');
      this.map.on('load', () => {
        this.envelope(this.map, this.projectId);
        this.addLayers();
        this.addSourceAndLayerForRuler()
        this.$emit('load');
      })
    });
  },
  methods: {
    addSourceAndLayerForRuler() {
      let ruleSource = {
                type: 'FeatureCollection',
                features: []
            };
            let ruleLayer = {
                id: 'rule-layer',
                source: this.ruleSourceName,
                type: 'line',
                layout: {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                paint: {
                    'line-color': '#21B0CF',
                    'line-width': 2
                },
                filter: ['in', '$type', 'LineString']
            };
            let measurePointLayer = {
                id: 'measure-point-layer',
                type: 'circle',
                source: this.ruleSourceName,
                paint: {
                    'circle-radius': 4,
                    'circle-color': '#21B0CF'
                },
                filter: ['in', '$type', 'Point']
            };
            let measurePointLabelLayer = {
                id: 'measure-point-label-layer',
                type: 'symbol',
                source: this.ruleSourceName,
                layout: {
                    'text-field': ['get', 'distance'],
                    'text-offset': [0, 1],
                    'text-size': 14,
                    'text-font': ['Roboto Medium'],
                },
                paint: {
                    'text-color': '#21B0CF',
                    'text-halo-blur': 0,
                    'text-halo-color': '#0d0d0d',
                    'text-halo-width': 1
                },
                filter: ['in', '$type', 'Point']
            };

            let linestring = {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': []
                }
            };

            let ruleClickEvent = (e) => {
                const features = this.map.queryRenderedFeatures(e.point, {layers: ['measure-point-layer']});
                if (ruleSource.features.length > 1) ruleSource.features.pop();

                if (features.length) {
                    const id = features[0].properties.id;
                    ruleSource.features = ruleSource.features.filter(
                        (point) => point.properties.id !== id
                    );
                } else {
                    const point = {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [e.lngLat.lng, e.lngLat.lat]
                        },
                        'properties': {
                            'id': String(new Date().getTime())
                        }
                    };

                    ruleSource.features.push(point);
                }

                if (ruleSource.features.length > 1) {
                    linestring.geometry.coordinates = ruleSource.features.map(
                        (point) => point.geometry.coordinates
                    );

                    let distance = turf.length(linestring);
                    distance = `${distance.toLocaleString()}km`;

                    ruleSource.features[ruleSource.features.length - 1].properties.distance = distance;
                    ruleSource.features.push(linestring);
                }

                this.map.getSource(this.ruleSourceName).setData(ruleSource);
            };

            let ruleMouseMoveEvent = (e) => {
                const features = this.map.queryRenderedFeatures(e.point, {layers: ['measure-point-label-layer', 'measure-point-layer']});
                this.map.getCanvas().style.cursor = features.length ? 'pointer' : 'crosshair';
            };

            let isEnable = false;
            let ruleButton = document.getElementById(this.ruleButtonId);
            ruleButton.addEventListener('click', () => {
                if (isEnable) {
                    // disable rule mode
                    this.map.removeLayer(ruleLayer.id);
                    this.map.removeLayer(measurePointLayer.id);
                    this.map.removeLayer(measurePointLabelLayer.id);
                    this.map.removeSource(this.ruleSourceName)

                    this.map.off('click', ruleClickEvent);
                    this.map.off('mousemove', ruleMouseMoveEvent);
                    this.map.getCanvas().style.cursor = 'grab';
                    ruleButton.classList.remove('active');
                } else {
                    // enable rule mode
                    ruleSource.features = [];
                    this.map.addSource(this.ruleSourceName, {type: 'geojson', data: ruleSource});
                    this.map.addLayer(ruleLayer);
                    this.map.addLayer(measurePointLayer);
                    this.map.addLayer(measurePointLabelLayer);

                    this.map.on('click', ruleClickEvent);
                    this.map.on('mousemove', ruleMouseMoveEvent);
                    ruleButton.classList.add('active');
                }
                isEnable = !isEnable;
            });

    },
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
        id: 'shape-layer',
        type: 'line',
        source: 'shape',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': config.shape_line_color,
          'line-width': 2
        }
      });
      this.map.addLayer({
        id: "shape-circle-layer",
        type: "circle",
        source: "shape-pts",
        paint: {
          "circle-radius":
              ['interpolate', ['linear'], ['zoom'],
                  12, 1.5,
                  14, 3,
                  20, 3,
              ],
          "circle-color": config.shape_point_color,
          "circle-stroke-color": config.shape_point_color,
          "circle-stroke-opacity": 1,
          "circle-stroke-width": 2
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
          "text-offset": [0, 0.6],
          "text-allow-overlap": true,
        }
      });
      let img = require('../../assets/img/double-arrow.png')
      this.map.loadImage(img, (err, image) => {
        if (err) {
          console.log(err);
          return;
        }
        this.map.addImage('double-arrow', image, {sdf: true});
        this.map.addLayer({
          'id': 'arrowId',
          'type': 'symbol',
          'source': 'shape',
          'layout': {
            'symbol-placement': 'line',
            'symbol-spacing': 100,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-image': 'double-arrow',
            'icon-size': 0.4,
            'visibility': 'visible'
          },
          paint: {
            'icon-color': config.shape_line_color,
            'icon-halo-color': "#fff",
            'icon-halo-width': 2
          }
        });
      });
    },
    displayShape(shape) {
      shapesAPI.shapesAPI.detail(this.projectId, shape.id).then(response => {
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

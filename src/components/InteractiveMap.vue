<template>
  <div class="dynamic-map-container">
    <div class="top-map-bar">
      <div class="right-content grid center">
        <input type="search" :placeholder="$t('shape.editor.searchPlaceholder')" v-model="stop.quickSearch"
               @input="filterStops"/>
        <FKSelect v-model="shape.selectedShape" :field="shape.shapeField" :data="{}" :errors="[]"
                  v-on:input="loadShape($event)"></FKSelect>
        <button class="btn flat white"><span>{{ $t('general.howToUse') }}</span><i
            class="material-icons">help_outline</i></button>
      </div>
    </div>
    <div ref='map' class="map">
      <button :disabled="status!==Enums.InteractiveMapStatus.READER" class="btn floating" alt="Create Stop"
              @click="beginCreation"
              v-tooltip="{ placement: 'left', content: $t('stop.helpMessageAddNewStop')}">
        <span class="material-icons">add_location_alt</span>
      </button>
    </div>
    <div class="map-sidebar">
      <div class="side-panel empty" v-if="status===Enums.InteractiveMapStatus.READER">
        <div class="side-header"></div>
        <div class="side-content">
          <div class="empty img">
            <i class="material-icons">add_location_alt</i>
          </div>
          <ol>
            <li><span>Click the bottom right button to add a new stop</span></li>
          </ol>
        </div>
      </div>
      <div class="side-panel edit-data-point"
           v-if="status===Enums.InteractiveMapStatus.EDIT_DATA_POINT || status===Enums.InteractiveMapStatus.MOVING_POINT">
        <div class="side-header">
          <div><h4>Stop details</h4></div>
          <div class="btn-list">
            <button class="btn icon save" alt="Save" @click="saveStop"><span class="material-icons">check</span>
            </button>
            <button class="btn icon" alt="Delete" @click="beginStopDeletion"><span class="material-icons">delete</span>
            </button>
            <button class="btn icon" alt="Cancel" @click="cancelStopEdition"><i class="material-icons">close</i>
            </button>
          </div>
        </div>
        <div class="side-content">
          <stop-form :fields="stopFields" v-model="stop.edition.stop" :errors="stop.edition.errors">
          </stop-form>
        </div>
        <div class="side-footer">
          <p>* Campos requeridos</p>
        </div>
      </div>
      <div class="side-panel adding-new-point" v-if="status===Enums.InteractiveMapStatus.ADDING_NEW_POINT">
        <div class="side-header">
          <div><h4>Adding a new stop</h4></div>
          <div class="btn-list">
            <button class="btn icon" alt="Cancel" @click="cancelStopEdition"><i class="material-icons">close</i>
            </button>
          </div>
        </div>
        <div class="side-content">
          <div class="empty img">
            <i class="material-icons">pin_drop</i>
          </div>
          <ol>
            <li><span>Click on the map to place it</span></li>
          </ol>
        </div>
      </div>
      <div class="side-panel fill-new-data-point" v-if="status===Enums.InteractiveMapStatus.FILL_NEW_DATA_POINT">
        <div class="side-header">
          <div><h4>New stop</h4></div>
          <div class="btn-list">
            <button class="btn icon save" alt="Create" @click="createStop"><span class="material-icons">check</span>
            </button>
            <button class="btn icon" alt="Create" @click="cancelNewStop"><span class="material-icons">close</span>
            </button>
          </div>
        </div>
        <div class="side-content">
          <stop-form :fields="stopFields" :errors="stop.creation.errors" v-model="stop.creation.data">
          </stop-form>
        </div>
        <div class="side-footer">
          <p>* Campos requeridos</p>
        </div>
      </div>
    </div>
    <MessageModal :show="stop.deleteModal.visible" @ok="deleteStop" @cancel="stop.deleteModal.visible = false"
                  @close="stop.deleteModal.visible = false" :showCancelButton="true"
                  :okButtonLabel="$t('general.delete')"
                  :type="Enums.MessageModalType.WARNING">
      <template v-slot:m-title>
        <h2>{{ $t('stop.deleteModalTitle') }}</h2>
      </template>
      <template v-slot:m-content>
          <span>
            {{ stop.deleteModal.message }}
          </span>
      </template>
    </MessageModal>
  </div>
</template>

<script>
import stopsAPI from '@/api/stops.api';
import shapesAPI from '@/api/shapes.api';
import shapeMapMixin from '@/mixins/shapeMapMixin'
import StopForm from '@/components/StopForm.vue';
import FKSelect from '@/components/vuetable/inputs/FKSelect.vue';
import envelopeMixin from '@/mixins/envelopeMixin'
import config from '@/config.js'
import Enums from '@/utils/enums';
import MessageModal from '@/components/modal/MessageModal';
import {debounce} from 'debounce';


const mapboxgl = require('mapbox-gl');
mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN;

export default {
  name: 'InteractiveMap',
  components: {
    MessageModal,
    StopForm,
    FKSelect,
  },
  mixins: [
    envelopeMixin,
    shapeMapMixin,
  ],
  data() {
    return {
      shape: {
        selectedShape: null,
        activeShape: null,
        shapeField: {
          name: 'shape_id',
          title: 'Shape',
          sortField: 'shape',
          foreignKey: true,
          nullable: true,
          id_field: 'shape',
          ajax_params: {
            url: shapesAPI.shapesAPI.getFullBaseURL(this.$route.params.projectId),
          },
          type: Enums.InputType.FK_SELECT
        },
        geojson: {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': []
          }
        },
      },
      stop: {
        quickSearch: null,
        activeStops: {},
        stops: {},
        creation: {
          data: {
            stop_lat: null,
            stop_lon: null,
          },
          errors: {},
          geojson: {
            type: 'FeatureCollection',
            features: [] // We use feature collection to allow either 0 or 1
          }
        },
        deleteModal: {
          visible: false,
          stop: null,
          message: '',
        },
        edition: {
          stop: null,
          errors: {}
        },
        highlightedFeatureGeojson: {
          type: 'FeatureCollection',
          features: []
        }
      },
      tmp: {
        previousEvent: null,
        previousFeature: null
      },
      status: Enums.InteractiveMapStatus.READER,
      map: null,
    }
  },
  props: {
    projectId: {
      required: true,
    },
    stopFields: {
      type: Array,
    },
  },
  mounted() {
    document.addEventListener('keydown', this.escapeKeyPressed);
    this.filterStops = debounce(this.filterStops, 300);
    this.$nextTick(() => {
      stopsAPI.stopsAPI.getAll(this.projectId).then(response => {
        response.data.forEach(el => {
          this.stop.stops[el.id] = el;
        });
        this.map = new mapboxgl.Map({
          container: this.$refs.map,
          style: 'mapbox://styles/mapbox/light-v10',
          zoom: 16
        });
        this.map.on('load', () => {
          this.envelope(this.map, this.projectId);
          this.addSourceAndLayersForStops();
          this.addSourceAndLayersForShape();
          this.addListeners();
          this.$emit('load');
        })
      }).catch((err) => {
        alert('Unable to fetch stops');
        console.log(err);
      });
    });
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.escapeKeyPressed);
  },
  methods: {
    filterStops() {
      let value = this.stop.quickSearch;
      if (value.length < 4) {
        return;
      }
      let normalize = value => value !== null ? value.trim().toLowerCase() : '';

      value = normalize(value);
      let filtered = Object.values(this.stop.stops).filter(stop => {
        let stopCode = normalize(stop.stop_code);
        let stopId = normalize(stop.stop_id);
        let stopName = normalize(stop.stop_name);

        return stopCode.indexOf(value) > -1 || stopId.indexOf(value) > -1 || stopName.indexOf(value) > -1;
      });

      if (filtered.length > 1) {
        let points = filtered.map(stop => [stop.stop_lon, stop.stop_lat]);
        this.map.fitBounds(this.getBounds(points), {
          padding: 50
        });
      } else if (filtered.length === 1) {
        this.map.flyTo({
          center: [filtered[0].stop_lon, filtered[0].stop_lat],
          zoom: 15
        });
      }
    },
    getStopGeojson() {
      console.log('generating stop points...');
      let generateStopGeoJson = stop => {
        let label = stop.stop_id + (stop.stop_code ? ` (${stop.stop_code})` : '');
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [stop.stop_lon, stop.stop_lat]
          },
          properties: {
            stop_id: stop.id,
            label: label,
          },
          id: stop.id,
        }
      };

      let geojson = {
        type: 'FeatureCollection',
        features: []
      };

      geojson.features = Object.values(this.stop.stops).map(generateStopGeoJson);

      return geojson;
    },
    loadShape(shapeId) {
      if (shapeId === null) {
        // select is empty
        this.shape.activeShape = null;
        this.map.setLayoutProperty('shape-layer', 'visibility', 'none');
        this.map.setLayoutProperty('shape-arrow-layer', 'visibility', 'none');
      } else if (this.shape.activeShape === null || this.shape.activeShape.id !== shapeId) {
        shapesAPI.shapesAPI.detail(this.projectId, shapeId).then(response => {
          this.shape.activeShape = response.data;
          this.shape.geojson.geometry.coordinates = this.shape.activeShape.points.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
          this.map.getSource('shape').setData(this.shape.geojson);
          this.map.fitBounds(this.getBounds(this.shape.geojson.geometry.coordinates), {
            padding: 50
          });
          this.map.setLayoutProperty('shape-layer', 'visibility', 'visible');
          this.map.setLayoutProperty('shape-arrow-layer', 'visibility', 'visible');
        });
      }
    },
    beginStopDeletion() {
      this.stop.deleteModal.visible = true;
      this.stop.deleteModal.stop = this.stop.edition.stop;
      this.stop.deleteModal.message = '';
    },
    deleteStop() {
      let stop = this.stop.deleteModal.stop;
      stopsAPI.stopsAPI.remove(this.projectId, stop).then(() => {
        this.stop.deleteModal.visible = false;
        this.stop.deleteModal.stop = null;
        this.stop.deleteModal.message = '';
        delete this.stop.stops[stop.id];
        this.reGenerateStops();
        this.moveToReaderStatus();
        console.log(`stop ${stop.stop_id} removed`);
      }).catch((err) => {
        let data = err.response.data;
        this.stop.deleteModal.message = data.message;
        this.stop.deleteModal.visible = true;
      });
    },
    beginCreation() {
      this.status = this.Enums.InteractiveMapStatus.ADDING_NEW_POINT;
      this.map.getCanvas().style.cursor = 'grabbing';
      // clean error messages
      this.stop.creation.errors = {};

      // when user decides position he makes click on map
      this.map.once('click', this.putNewPointOnMap);
      this.map.on('mousemove', this.creationMouseMove);
    },
    putNewPointOnMap() {
      this.map.off('mousemove', this.creationMouseMove);
      this.status = this.Enums.InteractiveMapStatus.FILL_NEW_DATA_POINT;
      this.map.getCanvas().style.cursor = '';
    },
    creationMouseMove(e) {
      // move feature to cursor position in realtime
      let coords = e.lngLat;
      this.updateCreationCoords(coords);
    },
    createStop() {
      let data = this.stop.creation.data;
      stopsAPI.stopsAPI.create(this.projectId, data).then(response => {
        this.addStop(response.data);
        this.stop.creation.errors = {};
        this.stop.creation.data = {
          stop_lat: null,
          stop_lon: null,
        };
        this.map.setLayoutProperty('layer-creating-icon', 'visibility', 'none')
        this.moveToReaderStatus();
      }).catch((err) => {
        console.log(err.response);
        this.stop.creation.errors = err.response.data;
      });
    },
    cancelNewStop() {
      this.moveToReaderStatus();
    },
    cancelStopEdition() {
      this.moveToReaderStatus();
    },
    moveToReaderStatus() {
      if (this.status === this.Enums.InteractiveMapStatus.ADDING_NEW_POINT ||
          this.status === this.Enums.InteractiveMapStatus.FILL_NEW_DATA_POINT) {
        this.status = this.Enums.InteractiveMapStatus.READER;
        this.map.getCanvas().style.cursor = '';
        this.map.off('click', this.putNewPointOnMap);
        this.map.off('mousemove', this.creationMouseMove);
        this.map.setLayoutProperty('layer-creating-icon', 'visibility', 'none')
      } else if (this.status === this.Enums.InteractiveMapStatus.MOVING_POINT ||
          this.status === this.Enums.InteractiveMapStatus.EDIT_DATA_POINT) {
        this.status = this.Enums.InteractiveMapStatus.READER;
        this.map.off('mouseup', this.editingStopMouseUp);
      }
      Object.keys(this.stop.activeStops).forEach(featureId => {
        this.map.setFeatureState({source: 'stop-source', id: featureId}, {active: false});
      });
      this.stop.activeStops = {};
      this.map.setLayoutProperty('layer-highlighted-stop-label', 'visibility', 'none');
    },
    escapeKeyPressed(e) {
      if (e.keyCode === 27) {
        this.moveToReaderStatus();
      }
    },
    flyToStop(stop) {
      /* it is used by external components to interact with map (put focus on one stop point) */
      this.map.flyTo({
        center: [stop.stop_lon, stop.stop_lat],
        zoom: 16,
      });
    },
    resize() {
      this.map.resize();
    },
    updateStopData(stop) {
      this.stop.stops[stop.id] = stop;
      this.reGenerateStops();
    },
    addStop(data) {
      this.stop.stops[data.id] = data;
      this.reGenerateStops();
    },
    saveStop() {
      stopsAPI.stopsAPI.update(this.projectId, this.stop.edition.stop).then(response => {
        Object.keys(this.stop.activeStops).forEach(featureId => {
          this.map.setFeatureState({source: 'stop-source', id: featureId}, {active: false});
        });
        this.stop.activeStops = {};
        this.stop.stops[response.data.id] = response.data;
        this.reGenerateStops()
        this.status = this.Enums.InteractiveMapStatus.READER;
      }).catch((err) => {
        this.stop.edition.errors = err.response.data;
      });
    },
    reGenerateStops() {
      this.map.getSource('stop-source').setData(this.getStopGeojson());
    },
    addSourceAndLayersForStops() {
      this.map.addSource('stop-source', {
        type: 'geojson',
        data: this.getStopGeojson(),
      });

      this.map.addSource('highlighted-stop-source', {
        type: 'geojson',
        data: this.stop.highlightedFeatureGeojson,
      });

      // We add an icon and text to the geojson
      this.map.addLayer({
        id: 'layer-stops-icon',
        type: 'circle',
        source: 'stop-source',
        layout: {
          visibility: 'visible',
        },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],].concat(config.stop_zoom),
          'circle-color': [
            'case',
            ['boolean', ['feature-state', 'active'], false], config.stop_selected_color,
            ['boolean', ['feature-state', 'hover'], false], config.stop_hover_color,
            config.stop_color,
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'active'], false], config.stop_stroke_selected_color,
            ['boolean', ['feature-state', 'hover'], false], config.stop_stroke_hover_color,
            config.stop_stroke_color,
          ],
          'circle-stroke-opacity': 1,
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'active'], false], 5,
            ['boolean', ['feature-state', 'hover'], false], 5,
            2,
          ],
        }
      });

      let img = require('../assets/img/bg-stop-name.png')
      this.map.loadImage(img, (err, image) => {
        if (err) {
          console.log(err);
          return;
        }
        this.map.addImage('bg-stop-name', image, {sdf: true});
        this.map.addLayer({
          id: 'layer-stops-label',
          type: 'symbol',
          source: 'stop-source',
          minzoom: 14,
          layout: {
            'text-field': '{label}',
            'text-font': ['Roboto Medium', 'Arial Unicode MS Regular'],
            'icon-image': 'bg-stop-name',
            'icon-anchor': 'bottom',
            'text-anchor': 'bottom',
            'text-offset': ['interpolate', ['linear'], ['zoom'],
              12, ['literal', [0, -0.3]],
              14, ['literal', [0, -0.5]],
              20, ['literal', [0, -1.5]],
            ],
            'text-size': 14,
            'icon-text-fit': 'both',
            'icon-text-fit-padding': [4, 6, 0, 6],
            'icon-allow-overlap': false,
            'text-allow-overlap': false,
          },
          paint: {
            'icon-color': [
              'case',
              ['boolean', ['feature-state', 'active'], false], config.stop_label_background_hover_color,
              config.stop_label_background_color,
            ],
            'text-color': config.stop_label_color,
          }
        });
        this.map.addLayer({
          id: 'layer-highlighted-stop-label',
          type: 'symbol',
          source: 'highlighted-stop-source',
          layout: {
            'text-field': '{label}',
            'text-font': ['Roboto Medium', 'Arial Unicode MS Regular'],
            'icon-image': 'bg-stop-name',
            'icon-anchor': 'bottom',
            'text-anchor': 'bottom',
            'text-offset': ['interpolate', ['linear'], ['zoom'],
              12, ['literal', [0, -0.3]],
              14, ['literal', [0, -0.5]],
              20, ['literal', [0, -1.5]],
            ],
            'text-size': 14,
            'icon-text-fit': 'both',
            'icon-text-fit-padding': [4, 6, 0, 6],
            'icon-allow-overlap': true,
            'text-allow-overlap': true,
            'visibility': 'none'
          },
          paint: {
            'icon-color': config.stop_label_background_hover_color,
            'text-color': config.stop_label_color,
          }
        });
      });

      // Icon for new stop
      this.map.addSource('creating', {
        type: 'geojson',
        data: this.stop.creation.geojson,
      })
      this.map.addLayer({
        id: 'layer-creating-icon',
        type: 'circle',
        source: 'creating',
        paint: {
          'circle-radius': 10,
          'circle-color': config.stop_creation_color,
        }
      });
    },
    addSourceAndLayersForShape() {
      this.map.addSource('shape', {
        'type': 'geojson',
        'data': this.shape.geojson,
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
      }, 'layer-stops-icon');
      let img = require('../assets/img/double-arrow.png')
      this.map.loadImage(img, (err, image) => {
        if (err) {
          console.log(err);
          return;
        }
        this.map.addImage('double-arrow', image, {sdf: true});
        this.map.addLayer({
          'id': 'shape-arrow-layer',
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
            'icon-halo-color': '#fff',
            'icon-halo-width': 2,
          }
        }, 'layer-stops-icon');
      });
    },
    addListeners() {
      let map = this.map;
      let canvas = map.getCanvas();
      let self = this;

      this.map.on('click', () => {
        // deactivate stop if user clicks on map
        if (this.status === this.Enums.InteractiveMapStatus.EDIT_DATA_POINT) {
          this.status = this.Enums.InteractiveMapStatus.READER;
          Object.keys(this.stop.activeStops).forEach(featureId => {
            this.map.setFeatureState({source: 'stop-source', id: featureId}, {active: false});
          });
          this.stop.activeStops = {};
        }
      });

      this.map.on('click', 'layer-stops-icon', (evt) => {
        let feature = evt.features[0];
        let id = feature.properties.stop_id;

        if (this.status === this.Enums.InteractiveMapStatus.ADDING_NEW_POINT ||
            this.status === this.Enums.InteractiveMapStatus.FILL_NEW_DATA_POINT) return;

        if (this.stop.edition.stop) {
          // deactivate previous stop selected
          this.map.setFeatureState({source: 'stop-source', id: this.stop.edition.stop.id}, {active: false});
          delete this.stop.activeStops[this.stop.edition.stop.id];
        }
        this.stop.edition.stop = this.stop.stops[id];
        map.setFeatureState({source: 'stop-source', id: feature.id,}, {active: true});
        this.stop.activeStops[feature.id] = feature;
        // clean previous error messages
        this.stop.edition.errors = {};
        this.status = this.Enums.InteractiveMapStatus.EDIT_DATA_POINT;
      });

      let hoveredStops = {};
      this.map.on('mouseenter', 'layer-stops-icon', function (e) {
        if (self.status === self.Enums.InteractiveMapStatus.MOVING_POINT ||
            self.status === self.Enums.InteractiveMapStatus.ADDING_NEW_POINT) return;
        if (self.status === self.Enums.InteractiveMapStatus.EDIT_DATA_POINT &&
            self.stop.edition.stop.id === e.features[0].id) {
          canvas.style.cursor = 'move';
        } else {
          canvas.style.cursor = 'pointer';
          let feature = e.features[0];
          hoveredStops[feature.id] = feature;
          self.stop.highlightedFeatureGeojson.features = [feature];
          map.getSource('highlighted-stop-source').setData(self.stop.highlightedFeatureGeojson);
          map.setLayoutProperty('layer-highlighted-stop-label', 'visibility', 'visible');
          map.setFeatureState({source: 'stop-source', id: feature.id,}, {hover: true});
        }
      });

      this.map.on('mouseleave', 'layer-stops-icon', function () {
        if (self.status === self.Enums.InteractiveMapStatus.MOVING_POINT ||
            self.status === self.Enums.InteractiveMapStatus.ADDING_NEW_POINT) return;
        Object.keys(hoveredStops).forEach(featureId => {
          map.setFeatureState({source: 'stop-source', id: featureId}, {hover: false});
        });
        hoveredStops = {};
        map.setLayoutProperty('layer-highlighted-stop-label', 'visibility', 'none');
        canvas.style.cursor = '';
      });

      this.map.on('mousedown', 'layer-stops-icon', function (evtMouseDown) {
        let activeStop = evtMouseDown.features[0];
        self.tmp.previousEvent = evtMouseDown;
        self.tmp.previousFeature = activeStop;
        if (self.status === self.Enums.InteractiveMapStatus.EDIT_DATA_POINT &&
            self.stop.edition.stop.id === activeStop.id) {
          // Prevent the default map drag behavior.
          evtMouseDown.preventDefault();
          canvas.style.cursor = 'grab';
          self.status = self.Enums.InteractiveMapStatus.MOVING_POINT;
          map.once('mouseup', self.editingStopMouseUp);
        }
      });

      this.map.on('mouseenter', 'layer-creating-icon', () => {
        if (self.status === self.Enums.InteractiveMapStatus.FILL_NEW_DATA_POINT) {
          canvas.style.cursor = 'move';
        }
      });

      this.map.on('mouseleave', 'layer-creating-icon', () => {
        if (self.status === self.Enums.InteractiveMapStatus.FILL_NEW_DATA_POINT) {
          canvas.style.cursor = '';
        }
      });

      this.map.on('mousedown', 'layer-creating-icon', function (evt_down) {
        // Prevent the default map drag behavior.
        evt_down.preventDefault();
        canvas.style.cursor = 'grab';
        map.once('mouseup', () => {
          map.off('mousemove', self.creationMouseMove);
          canvas.style.cursor = '';
        });
        map.on('mousemove', self.creationMouseMove);
      });
    },
    editingStopMouseUp(evtUp) {
      /* executed when user finishes to move editing point */
      this.status = this.Enums.InteractiveMapStatus.EDIT_DATA_POINT;
      let coords = evtUp.lngLat;
      let distance = this.calcDistance(this.tmp.previousEvent, evtUp);
      if (!distance) return;
      this.updateStop(this.tmp.previousFeature, coords);
      this.map.getCanvas().style.cursor = '';
    },
    updateCreationCoords(coords) {
      this.stop.creation.data.stop_lon = coords.lng;
      this.stop.creation.data.stop_lat = coords.lat;
      this.stop.creation.geojson.features = [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat],
        },
      }];
      this.map.getSource('creating').setData(this.stop.creation.geojson);
      this.map.setLayoutProperty('layer-creating-icon', 'visibility', 'visible')
    },
    // Distance in pixels between events
    calcDistance(e1, e2) {
      e1 = e1.point;
      e2 = e2.point;
      let xdif = e1.x - e2.x;
      let ydif = e2.y - e2.y;
      return Math.sqrt(xdif * xdif + ydif * ydif)
    },
    updateStop(stop, coords) {
      this.stop.stops[stop.properties.stop_id].stop_lon = coords.lng;
      this.stop.stops[stop.properties.stop_id].stop_lat = coords.lat;
      this.reGenerateStops();
    },
  },
}
</script>

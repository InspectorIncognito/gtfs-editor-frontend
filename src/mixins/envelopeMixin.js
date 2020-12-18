import projectsAPI from "@/api/projects.api";
const mapboxgl = require('mapbox-gl');

let envelopeMixin = {
  data() {
    return {
      project_data: false,
    }
  },
  methods: {
    envelope(map, project) {
      if (this.project_data) {
        let coordinates = this.project_data.envelope.geometry.coordinates[0];
        if (coordinates.length > 0) {
          var bounds = coordinates.reduce(function (bounds, coord) {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          this.map.fitBounds(bounds, {
            padding: 20,
            animate: false,
          });
        }
      } else {
        projectsAPI.getProjectDetail(project).then(p => {
          let data = p.data;
          this.project_data = data;
          this.envelope(map, project);
        })
      }
    }
  }
}

export default envelopeMixin;
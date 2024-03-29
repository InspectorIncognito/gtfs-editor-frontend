<template>
  <div class="ProjectDashboard container">
    <div class="header">
      <ProjectNameEditor :project="project" @project-name-update="updateProjectName"></ProjectNameEditor>
      <div class="grid v-center">
        <span class="side-info">{{ $t('projectDashboard.lastChange') }}: {{ lastModification }}</span>
        <div class="btn icon flat">
          <i class="material-icons" @click="showMenu=!showMenu">more_vert</i>
          <ProjectMenu v-if="showMenu" placement="upperRight" :project="project"
                       @project-deleted="$router.push({name: 'myprojects'})" @close="showMenu=false"></ProjectMenu>
        </div>
      </div>
    </div>
    <div class="section-content">
      <div class="section-details">
        <div class="card">
          <div class="card-content">
            <div class="header">
              <h2>{{ project.feedinfo ? project.feedinfo.feed_publisher_name : '' }}</h2>
              <button class="btn icon flat" @click="feedInfo.edit=true"><i class="material-icons">edit</i></button>
            </div>
            <div class="grid">
              <div class="box-info">
                <i class="material-icons">language</i>
                <span>{{ project.feedinfo ? project.feedinfo.feed_publisher_url : '' }}</span>
              </div>
              <div class="box-info">
                <i class="material-icons">flag</i>
                <span>{{ project.feedinfo ? project.feedinfo.feed_lang : 'ES' }}</span>
              </div>
            </div>
            <div class="grid-project-info">
              <div class="project-card-map">
                <EnvelopeMap :project="project" :width="274" :height="204"></EnvelopeMap>
              </div>
              <div class="project-info-details">
                <div>
                  <h5>{{ $t('projectDashboard.feedInfo.version') }}</h5>
                  <span>{{ project.feedinfo ? project.feedinfo.feed_version : '' }}</span>
                </div>
                <div>
                  <h5>{{ $t('projectDashboard.feedInfo.feedID') }}</h5>
                  <span>{{ project.feedinfo ? project.feedinfo.feed_id : '' }}</span>
                </div>
                <div class="grid g2">
                  <div>
                    <h5>{{ $t('projectDashboard.feedInfo.startDate') }}</h5>
                    <span>{{ project.feedinfo ? project.feedinfo.feed_start_date : '' }}</span>
                  </div>
                  <div>
                    <h5>{{ $t('projectDashboard.feedInfo.endDate') }}</h5>
                    <span>{{ project.feedinfo ? project.feedinfo.feed_end_date : '' }}</span>
                  </div>
                </div>
                <div class="grid g2">
                  <div>
                    <h5>{{ $t('projectDashboard.feedInfo.contactURL') }}</h5>
                    <span>{{ project.feedinfo ? project.feedinfo.feed_contact_url : '' }}</span>
                  </div>
                  <div>
                    <h5>{{ $t('projectDashboard.feedInfo.contactEmail') }}</h5>
                    <span>{{ project.feedinfo ? project.feedinfo.feed_contact_email : '' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <BuildAndValidateGTFS :project="project" @update-project="updateProjectStatus"></BuildAndValidateGTFS>
      </div>
      <div class="box-data">
        <h2>{{ $t('projectDashboard.gtfsRequiredData') }}</h2>
        <div class="grid-data required">
          <DataCard v-for="file in data.slice(0, 9)" v-bind:key="file.id" :projectId="$route.params.projectId"
                    :viewName="file.viewName" :filename="file.name" :quantity="file.entries" :state="file.state"
                    :errorNumber="file.error_number" :warningNumber="file.warning_number"
                    :message="$t(file.message)"></DataCard>
        </div>
      </div>
      <div class="box-data">
        <h2>{{ $t('projectDashboard.gtfsOptionalData') }}</h2>
        <div class="grid-data optional">
          <DataCard v-for="file in data.slice(9)" v-bind:key="file.id" :projectId="$route.params.projectId"
                    :viewName="file.viewName" :filename="file.name" :quantity="file.entries" :state="file.state"
                    :errorNumber="file.error_number" :warningNumber="file.warning_number"
                    :message="$t(file.message)"></DataCard>
        </div>
      </div>
    </div>
    <InputDataModal :show="feedInfo.edit" @close="feedInfo.edit=false" @cancel="feedInfo.edit=false" @save="saveFeedInfo"
                    @removeError="removeMessageError"
                    :title="feedInfo.config.title" :link="feedInfo.config.link" :fields="feedInfo.config.fields"
                    :initialData="project.feedinfo?project.feedinfo:{}" :errors="feedInfo.config.errors">
    </InputDataModal>
    <DeletionModal></DeletionModal>
  </div>
</template>

<script>
import {DateTime} from 'luxon';
import projectsAPI from '@/api/projects.api';
import tablesAPI from '@/api/tables.api';
import feedInfoAPI from '@/api/feedinfo.api';
import InputDataModal from '@/components/modal/InputDataModal.vue';
import EnvelopeMap from '@/components/EnvelopeMap.vue';
import DataCard from "@/components/project/DataCard";
import Enums from '@/utils/enums';
import ProjectMenu from "@/components/project/ProjectMenu.vue";
import DeletionModal from "@/components/project/DeletionModal";
import BuildAndValidateGTFS from "@/components/project/BuildAndValidateGTFS";
import ProjectNameEditor from "@/components/project/ProjectNameEditor";

export default {
  name: 'ProjectDashboard',
  components: {
    ProjectNameEditor,
    BuildAndValidateGTFS,
    ProjectMenu,
    DataCard,
    InputDataModal,
    EnvelopeMap,
    DeletionModal
  },
  data() {
    let data = [{
      name: "Agencies",
      viewName: "Agencies",
      id: "agency"
    }, {
      name: "Calendars",
      viewName: "Calendars",
      id: "calendar"
    }, {
      name: "Stops",
      viewName: "Stops",
      id: "stops"
    }, {
      name: "Routes",
      viewName: "Routes",
      id: "routes"
    }, {
      name: "Shapes",
      viewName: "Shapes",
      id: "shapes"
    }, {
      name: "Trips",
      viewName: "Trips",
      id: "trips"
    }, {
      name: "Stop Times",
      viewName: "StopTimes",
      id: "stop_times"
    }, {
      name: "Frequencies",
      viewName: "Frequencies",
      id: "frequencies"
    }, {
      name: "Calendar Dates",
      viewName: "CalendarDates",
      id: "calendar_dates"
    }, {
      name: "Fare Attributes",
      viewName: "FareAttributes",
      id: "fare_attributes"
    }, {
      name: "Fare Rules",
      viewName: "FareRules",
      id: "fare_rules"
    }, {
      name: "Transfers",
      viewName: "Transfers",
      id: "transfers"
    }, {
      name: "Pathways",
      viewName: "Pathways",
      id: "pathways"
    }, {
      name: "Levels",
      viewName: "Levels",
      id: "levels"
    },
    ];
    return {
      feedInfo: {
        edit: false,
        config: {
          title: 'Feed info',
          link: 'https://developers.google.com/transit/gtfs/reference#feed_infotxt',
          errors: {},
          fields: [
            {
              title: "Publisher Name",
              name: "feed_publisher_name",
              type: Enums.InputType.INPUT,
              required: true,
            },
            {
              title: "Publisher URL",
              name: "feed_publisher_url",
              type: Enums.InputType.URL,
              required: true,
            },
            {
              title: "Language",
              name: "feed_lang",
              type: Enums.InputType.INPUT,
              required: true,
            },
            {
              title: "Start date",
              name: "feed_start_date",
              type: Enums.InputType.DATE,
              required: true,
            },
            {
              title: "End Date",
              name: "feed_end_date",
              type: Enums.InputType.DATE,
              required: true,
            },
            {
              title: "Version",
              name: "feed_version",
              type: Enums.InputType.INPUT,
              required: true,
            },
            {
              title: "Contact URL",
              name: "feed_contact_url",
              type: Enums.InputType.URL,
              required: false,
            },
            {
              title: "Contact Email",
              name: "feed_contact_email",
              type: Enums.InputType.EMAIL,
              required: false,
            },
            {
              title: "ID",
              name: "feed_id",
              type: Enums.InputType.INPUT,
              required: true,
            },
          ]
        }
      },
      project: {
        feedinfo: {},
        gtfsvalidation: {}
      },
      data,
      showMenu: false,
    }
  },
  computed: {
    lastModification() {
      return DateTime.fromISO(this.project.last_modification).toRelative({locale: this.$i18n.locale});
    }
  },
  methods: {
    initData() {
      projectsAPI.getProjectDetail(this.$route.params.projectId).then(response => {
        this.project = response.data;
      });
      this.retrieveCardData();
    },
    retrieveCardData() {
      tablesAPI.list_tables(this.$route.params.projectId).then(response => {
        let data = response.data;
        this.data = this.data.map(datum => {
          let entry = data[datum.id];
          if (entry) {
            entry.state = Enums.DataCard.ENABLED;

            if (entry.entries === 0) {
              datum.message = 'projectDashboard.dataCard.noData';
              datum.state = Enums.DataCard.EMPTY
            }

            if (datum.id === 'routes' && data.agency.entries === 0) {
              datum.message = 'projectDashboard.dataCard.routesBlockMessage';
              datum.state = Enums.DataCard.BLOCKED;
            } else if (datum.id === 'trips' && (data.routes.entries === 0 || data.calendar.entries === 0 || data.shapes.entries === 0)) {
              datum.message = 'projectDashboard.dataCard.tripsBlockMessage';
              datum.state = Enums.DataCard.BLOCKED;
            } else if (datum.id === 'frequencies' && data.trips.entries === 0) {
              datum.message = 'projectDashboard.dataCard.frequenciesBlockMessage';
              datum.state = Enums.DataCard.BLOCKED;
            } else if (datum.id === 'transfers' && data.stops.entries === 0) {
              datum.message = 'projectDashboard.dataCard.transfersBlockMessage';
              datum.state = Enums.DataCard.BLOCKED;
            } else if (datum.id === 'pathways' && data.stops.entries === 0) {
              datum.message = 'projectDashboard.dataCard.pathwaysBlockMessage';
              datum.state = Enums.DataCard.BLOCKED;
            }

            return {
              ...entry,
              ...datum,
            }
          }
          return datum;
        });
      });
    },
    updateProjectName(project) {
      this.project.name = project.name;
    },
    saveFeedInfo(feedInfoData) {
      let method = this.project.feedinfo && this.project.feedinfo.id ? feedInfoAPI.update : feedInfoAPI.create;
      method(this.$route.params.projectId, feedInfoData).then((response) => {
        this.project.feedinfo = response.data;
        this.feedInfo.edit = false;
        this.feedInfo.config.errors = {};
      }).catch(err => {
        this.feedInfo.config.errors = err.response.data;
      });
    },
    removeMessageError(fieldName) {
      this.$delete(this.feedInfo.config.errors, fieldName);
    },
    updateProjectStatus(project) {
      this.project.gtfs_file_updated_at = project.gtfs_file_updated_at;
      this.project.gtfs_building_and_validation_status = project.gtfs_building_and_validation_status;
      this.project.gtfs_building_duration = project.gtfs_building_duration;
      this.project.gtfs_validation.message = project.gtfs_validation.message;
      this.project.gtfs_validation.error_number = project.gtfs_validation.error_number;
      this.project.gtfs_validation.warning_number = project.gtfs_validation.warning_number;
      this.project.gtfs_validation.duration = project.gtfs_validation.duration;
      this.retrieveCardData();
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => vm.initData());
  },
}
</script>

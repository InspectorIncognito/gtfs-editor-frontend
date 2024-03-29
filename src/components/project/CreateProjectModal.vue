<template>
  <BaseModal :show="show" v-on="$listeners" :classes="['modal-new-project']" @close="setToDefaultValues">
    <template v-slot:m-content>
      <div class="modal-new-header">
        <h2>{{ $t('myProjects.createProject') }}</h2>
      </div>
      <div class="content">
        <input v-model="projectName" type="text" class="main-input-text" :placeholder="$t('myProjects.projectName')"
               :class="{error: errors.name }" @focus="errors={}"
               v-tooltip="{ theme: 'error-tooltip', content: errors.name?errors.name[0]:'', shown: errors.name !== undefined }"/>
        <div class="title">
          <h4>{{ $t('myProjects.chooseHowToStart') }}</h4>
          <div class="line"></div>
        </div>
        <div class="new-box">
          <label class="grid-new-box">
            <input type="radio" name="how-to-start" :value="projectCreationType.EMPTY"
                   v-model="creationType"/>
            <div class="flex center">
              <img src="@/assets/img/new-scratch.svg" alt="New from scratch image"/>
              <img src="@/assets/img/check.svg" class="check" alt="Check"/>
            </div>
            <p>{{ $t('myProjects.startEmptyProject') }}</p>
          </label>
        </div>
        <div class="new-box">
          <label class="grid-new-box">
            <input type="radio" name="how-to-start" :value="projectCreationType.FROM_GTFS"
                   v-model="creationType"/>
            <div class="flex center">
              <img src="@/assets/img/new-file.svg" alt="New from GTFS file image"/>
              <img src="@/assets/img/check.svg" class="check" alt="Check"/>
            </div>
            <p>{{ $t('myProjects.startProjectFromGTFS') }}</p>
          </label>
          <div class="upload-gtfs-file"
               v-tooltip="{ theme: 'error-tooltip', content: errors.file?errors.file[0]:'', shown: errors.file !== undefined, placement:'top' }">
            <label>
              <input type="file" id="file" ref="file" accept="application/zip" v-on:change="handleFileUpload"
                     :disabled="creationType===projectCreationType.EMPTY"/>
              <span class="btn flat"><span>{{ $t('general.upload') }}</span><i
                  class="material-icons">file_upload</i></span>
            </label>
            <div class="file-name" v-if="filename"><span>{{ filename }}</span>
              <button class="btn flat icon error" @click="deleteAttachmentFile"><i class="material-icons">close</i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn green" @click="createProjectAction"
                :disabled="creationType===projectCreationType.FROM_GTFS && filename===null">
          <span>{{ $t('general.create') }}</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from "@/components/modal/BaseModal";
import Enums from "@/utils/enums";
import projectsAPI from "@/api/projects.api";

export default {
  name: 'CreateProjectModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      projectName: null,
      creationType: Enums.ProjectCreationType.EMPTY,
      projectCreationType: Enums.ProjectCreationType,
      fileContent: null,
      filename: null,
      errors: {}
    }
  },
  methods: {
    handleFileUpload() {
      this.fileContent = this.$refs.file.files.item(0);
      if (this.$refs.file.files[0]) {
        this.filename = this.$refs.file.files[0].name;
        delete this.errors.file;
      } else {
        this.$refs.file.value = null;
        this.filename = null;
      }
    },
    deleteAttachmentFile() {
      this.$refs.file.value = null;
      this.filename = null;
    },
    createProjectAction() {
      if (this.creationType === Enums.ProjectCreationType.EMPTY) {
        this.createProjectAndRedirect();
      } else {
        this.createProjectFromGTFS();
      }
    },
    createProjectAndRedirect() {
      projectsAPI.createProject(this.projectName).then(response => {
        this.errors = {};
        this.$router.push({name: "projectoverview", params: {projectId: response.data.project_id}});
      }).catch((error) => {
        this.errors = error.response.data;
      });
    },
    createProjectFromGTFS() {
      projectsAPI.createProjectFromGTFS(this.projectName, this.fileContent).then(response => {
        this.setToDefaultValues();
        this.$emit('project-created', response.data);
      }).catch(error => {
        if (Array.isArray(error.response.data)) {
          this.errors = {file: error.response.data};
        } else {
          this.errors = error.response.data;
        }
        this.$refs.file.value = null;
      });
    },
    setToDefaultValues() {
      this.$refs.file.value = null;
      this.fileContent = null;
      this.filename = null;
      this.projectName = null;
      this.creationType = Enums.ProjectCreationType.EMPTY;
      this.errors = {};
    }
  },
  watch: {
    creationType(newValue) {
      if (newValue === Enums.ProjectCreationType.EMPTY) {
        this.fileContent = null;
        this.filename = null;
        this.$refs.file.value = null;
        delete this.errors.file;
      }
    }
  }
}
</script>

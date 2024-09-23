<template>
  <BaseMenu :placement="placement" :options="options" v-on="$listeners"
            @delete="$store.commit('project/setShowDeletionModal', true)"></BaseMenu>
</template>

<script>
import BaseMenu from '@/components/BaseMenu.vue'
import Enums from '@/utils/enums.js'

export default {
  name: 'ProjectMenu',
  components: {
    BaseMenu
  },
  props: {
    placement: {
      type: String,
      default: Enums.MenuBoxPlacement.UPPER_LEFT,
    },
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      options: [
        {
          icon: 'delete',
          label: 'general.delete',
          eventName: 'delete',
          isDisabled: false,
          classes: ['delete']
        }
      ]
    }
  },
  mounted() {
    this.$store.commit('project/setCurrentProject', this.project);
  }
}
</script>

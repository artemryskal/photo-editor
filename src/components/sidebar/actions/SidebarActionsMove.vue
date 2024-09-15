<template>
  <div>
    <v-btn :color="color" elevation="0" @click="toggleTool">
      <v-icon size="20">mdi-hand-back-right</v-icon>
    </v-btn>
  </div>
</template>

<script>
import actionsMixin from '@/mixins/actions'

export default {
  name: 'SidebarActionsMove',
  mixins: [actionsMixin],
  data() {
    return {
      toolName: 'move',
    }
  },
}
</script>

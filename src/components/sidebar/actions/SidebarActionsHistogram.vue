<template>
  <div>
    <v-btn elevation="0" @click="setModal('ModalsHistogram')">
      <v-icon size="20">mdi-chart-areaspline-variant</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'SidebarActionsResize',
  methods: {
    ...mapMutations({
      setModal: 'modalsStore/setModal',
    }),
  },
}
</script>

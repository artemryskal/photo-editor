<template>
  <v-tooltip bottom>
    <template #activator="{ on, attrs }">
      <v-icon v-bind="attrs" v-on="on" size="13">mdi-help</v-icon>
    </template>
    {{ msg }}
  </v-tooltip>
</template>

<script>
export default {
  name: 'ToolsTooltip',
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
}
</script>

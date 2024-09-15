<template>
  <v-app class="app">
    <v-layout>
      <v-main>
        <!-- Canvas -->
        <CanvasBox />

        <!-- Сайдбар -->
        <SidebarBox />

        <!-- Загрузка файла -->
        <ModalsUpload />
        <!-- Масштабирование -->
        <ModalsResize />
        <!-- Гистограмма -->
        <ModalsHistogram />
        <!-- Фильтры -->
        <ModalsFilters />

        <!-- Глобальный компонент уведомлений из библиотеки -->
        <notifications />
      </v-main>
    </v-layout>
  </v-app>
</template>

<script>
import keybindsMixin from './mixins/keybinds'

export default {
  name: 'App',
  mixins: [keybindsMixin],
}
</script>

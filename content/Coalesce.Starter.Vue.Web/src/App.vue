<template>
  <v-app id="vue-app">
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list>
        <v-list-item link to="/">
          <v-list-item-action>
            <v-icon>fas fa-home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link to="/coalesce-example">
          <v-list-item-action>
            <v-icon>fas fa-palette</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Coalesce Example</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark dense clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>
        <router-link to="/" class="white--text" style="text-decoration: none">
          Coalesce Vue Template
        </router-link>
      </v-toolbar-title>
    </v-app-bar>

    <v-main>
      <transition name="router-transition" mode="out-in" appear>
        <!-- https://stackoverflow.com/questions/52847979/what-is-router-view-key-route-fullpath -->
        <router-view ref="routeComponent" :key="$route.path" />
      </transition>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router/composables";

const route = useRoute();
const drawer = ref<boolean | null>(null);
const routeComponent = ref<any>();

const routeMeta = computed(() => {
  if (!route || route.name === null) return null;
  return route.meta;
});

const baseTitle = document.title;
watch(
  () => routeComponent.value?.pageTitle,
  (n: string | null | undefined) => {
    if (n) {
      document.title = n + " - " + baseTitle;
    } else {
      document.title = baseTitle;
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
.router-transition-enter-active,
.router-transition-leave-active {
  transition: 0.1s ease-out;
}

.router-transition-move {
  transition: transform 0.4s;
}

.router-transition-enter,
.router-transition-leave-to {
  opacity: 0;
}
</style>

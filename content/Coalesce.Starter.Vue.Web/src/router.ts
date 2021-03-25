import Vue from "vue";
import Router from "vue-router";

import Home from "./views/Home.vue";
import About from "./views/About.vue";
import CoalesceExample from "./views/CoalesceExample.vue";
import { CAdminTablePage, CAdminEditorPage } from "coalesce-vue-vuetify";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/about",
      name: "about",
      component: About,
    },
    {
      path: "/coalesce-example",
      name: "coalesce-example",
      component: CoalesceExample,
      props: { title: "Coalesce Example" },
    },

    // Coalesce admin routes
    {
      path: "/admin/:type",
      name: "coalesce-admin-list",
      component: CAdminTablePage,
      props: (r) => ({
        type: r.params.type,
      }),
    },
    {
      path: "/admin/:type/edit/:id?",
      name: "coalesce-admin-item",
      component: CAdminEditorPage,
      props: (r) => ({
        type: r.params.type,
        id: r.params.id,
      }),
    },
  ],
});

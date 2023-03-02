import { createCoalesceVuetify } from "coalesce-vue-vuetify3";
import { mount } from "@vue/test-utils";
import { ArgumentsType } from "vitest";

import { createVuetify } from "vuetify";
import $metadata from "@/metadata.g";
import router from "@/router";

// Shim ResizeObserver, as vuetify's VApp relies on it.
global.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

beforeEach(() => {
  // Clear out elements that vuetify attached to the body
  // that otherwise won't get cleared out. E.g. modals and such.
  document.body.childNodes.forEach((n) => n.remove());
});

const vuetify = createVuetify({});
const coalesceVuetify = createCoalesceVuetify({
  metadata: $metadata,
});

/** Mounts a component  on its own */
const mountComponent = function (
  component: ArgumentsType<typeof mount>[0],
  options: ArgumentsType<typeof mount>[1]
) {
  return mount(component, {
    ...options,
    attachTo: document.body,
    global: {
      plugins: [vuetify, coalesceVuetify, router],
    },
  });
} as typeof mount;

export async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export { nextTick } from "vue";
export { mountComponent as mount };

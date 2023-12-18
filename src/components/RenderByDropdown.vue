<template>
  <div class="render-by">
    <PrettySelect
      label="View By"
      :options="renderableOptions"
      :value="currentMode"
      @change="
        (val) => {
          currentMode = val;
        }
      "
    />
  </div>
</template>

<script>
import { displayNameForMode } from "./../store/modules/application/helpers";
import PrettySelect from "./PrettySelect";

export default {
  computed: {
    renderableProperties() {
      return [
        "spaces",
        "building_units",
        "thermal_zones",
        "space_types",
        "construction_sets",
        "pitched_roofs",
      ];
    },
    renderableOptions() {
      return this.renderableProperties.map((p) => ({
        display: displayNameForMode(p),
        val: p,
      }));
    },
    currentMode: {
      get() {
        return this.$store.state.application.currentSelections.mode;
      },
      set(mode) {
        this.$store.dispatch("application/setCurrentMode", { mode });
      },
    },
  },
  components: {
    PrettySelect,
  },
};
</script>

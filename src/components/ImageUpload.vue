<template>
  <input
    type="file"
    ref="imageInput"
    id="upload-image-input"
    style="display: none;"
    @change="uploadImage"
  />
</template>
<script>
import { mapState, mapGetters } from 'vuex';
import modelHelpers from './../store/modules/models/helpers';

export default {
  name: 'ImageUpload',
  mounted() {
    window.eventBus.$on('uploadImage', (event) => {
      this.$refs.imageInput.click();
    });
  },
  computed: {
    ...mapState({
      pxPerRWU(state) {
        const { pixels, rwuRange } = state.application.scale.x;
        return pixels / (rwuRange[1] - rwuRange[0]);
      },
      max_y: state => state.project.view.max_y,
      min_y: state => state.project.view.min_y,
      min_x: state => state.project.view.min_x,
      max_x: state => state.project.view.max_x,
    }),
    ...mapGetters({
      currentStory: 'application/currentStory',
    }),
  },
  methods: {
    uploadImage(event) {
      const files = event.target.files;
      const that = this;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.addEventListener('load', () => {
          const image = new Image();
          image.onload = () => {
            const rwuHeight = (image.height / that.pxPerRWU) / 4;
            const rwuWidth = (image.width / that.pxPerRWU) / 4;
            that.$store.dispatch('models/createImageForStory', {
              story_id: that.currentStory.id,
              src: image.src,
              // TODO: unique name
              name: modelHelpers.generateName(that.$store.state.models, 'images', that.currentStory),
              // translate image dimensions into rwu
              height: rwuHeight,
              width: rwuWidth,
              x: (that.min_x + that.max_x) / 2,
              y: (that.min_y + that.max_y) / 2,
            });
            that.$refs.imageInput.value = '';
          };
          image.src = reader.result;
        }, false);
        if (file) { reader.readAsDataURL(file); }
      }
    },
  },
}
</script>

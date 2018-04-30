<template>
  <transition name="modal">
    <div class="color-picker-modal">
      <div class="modal-mask">
        <div class="modal-wrapper"
          @click="$emit('close')"
        >
          <div class="modal-container" @click.stop>
            <div class="modal-body">
              <swatches v-model="color" inline show-fallback/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Swatches from 'vue-swatches';

export default {
  name: 'ColorPickerModal',
  props: ['value'],
  computed: {
    color: {
      get() { return this.value; },
      set(newVal) {
        this.$emit('change', newVal);
      },
    },
  },
  mounted() {
    document.addEventListener('keydown', this.closeOnEsc);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.closeOnEsc);
  },
  methods: {
    closeOnEsc(e) {
      if (e.keyCode === 27) {
        this.$emit('close');
      }
    },
  },
  components: {
    Swatches,
  },
}
</script>

<style lang="scss">
.color-picker-modal {
  .modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 300px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}


.modal-body {
  margin: 20px 0;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
/* customizing color picker */
*:focus {
  outline: none;
}
.vue-swatches__container, .vue-swatches__wrapper {
  &:focus {
    outline: none;
  }
}
.vue-swatches .vue-swatches__wrapper {
  display: flex;
  max-width: 100%;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0 !important;
}
.vue-swatches__container {
    .vue-swatches__wrapper {
        .vue-swatches__swatch {
            min-width: 42px;
            display: block;
            margin-right: 5px !important;
            margin-left: 5px;
            .vue-swatches__check__wrapper {
                margin-top: 9px;
            }
        }
    }
  .vue-swatches__fallback__input {
      background: unset;
      color: black;
  }
  .vue-swatches__fallback__button {
      display: none;
  }
}
}
</style>

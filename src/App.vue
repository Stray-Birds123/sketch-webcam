<script>
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import sleep from 'js-util/sleep';
import debounce from 'js-util/debounce';

import BackHome from '@/components/common/BackHome.vue';
import GradualCover from '@/components/common/GradualCover.vue';
import Modal from '@/components/common/Modal.vue';
import SiteTitle from '@/components/common/SiteTitle.vue';

export default {
  name: 'App',
  metaInfo: {
    title: '',
    titleTemplate: `%s${process.env.VUE_APP_WEBSITE_NAME}`
  },
  components: {
    BackHome,
    GradualCover,
    Modal,
    SiteTitle
  },
  async created() {
    const { state, dispatch } = this.$store;

    await tf.setBackend('webgl');

    // append canvas and add styles to it.
    document.body.append(state.canvas);
    state.canvas.style = `
        position: absolute;
        top: 0;
        left: 0;
      `;

    // On global events.
    window.addEventListener('resize', debounce(this.resize, 500));
    window.addEventListener('deviceorientation', this.resize);
    window.addEventListener('mousemove', this.mousemove);
    document.addEventListener('touchstart', this.touchstart);
    document.addEventListener('touchmove', this.touchmove);
    document.addEventListener('touchend', this.touchend);

    // Initialize
    this.resize();
    state.camera.start();
    this.update();
    state.clock.start();

    dispatch('webcam/init');
  },
  methods: {
    update() {
      const { state } = this.$store;

      const time = state.clock.running === true ? state.clock.getDelta() : 0;
      if (state.update !== null) {
        state.update(time);
      }
      state.renderer.render(state.scene, state.camera);
      requestAnimationFrame(this.update);
    },
    async resize() {
      const { state, commit } = this.$store;

      await sleep(500);
      state.resolution.set(window.innerWidth, window.innerHeight);
      state.canvas.width = state.resolution.x;
      state.canvas.height = state.resolution.y;
      commit('changeMediaQuery', state.resolution.x < 768);
      commit('setPixelRatio');
      state.camera.resize();
      state.renderer.setSize(state.resolution.x, state.resolution.y);
      state.renderer.setPixelRatio(state.pixelRatio);
      commit('webcam/setResolution');
      if (state.resize !== null) {
        state.resize();
      }
    },
    mousemove(e) {
      const { state } = this.$store;

      if (state.isEnabledTouch === true) return;
      state.mouse.set(
        (e.clientX / state.resolution.x) * 2 - 1,
        -(e.clientY / state.resolution.y) * 2 + 1
      );
    },
    touchstart(e) {
      this.$store.commit('touch/start', {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    },
    touchmove(e) {
      this.$store.commit('touch/move', {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    },
    touchend() {
      this.$store.commit('touch/end');
    }
  }
};
</script>

<template lang="pug">
#app
  SiteTitle
  router-view(
    v-if = '$store.state.webcam.videoTexture !== null'
    )
  BackHome
  GradualCover
  Modal
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

@import '@/assets/scss/foundation/normalize.scss';
@import '@/assets/scss/foundation/global.scss';
@import '@/assets/scss/foundation/keyframes.scss';

@import '@/assets/scss/util/index.scss';

#app {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 10;
}
</style>

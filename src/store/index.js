import Vue from 'vue';
import Vuex from 'vuex';
import { WebGL1Renderer, Vector2, Scene, Clock } from 'three';
import UAParser from 'ua-parser-js';

import touch from './touch';
import webcam from './webcam';
import modal from './modal';

import Camera from '@/webgl/common/Camera';

Vue.use(Vuex);

const canvas = document.createElement('canvas');
const ua = UAParser();

export default new Vuex.Store({
  state: {
    canvas,
    resolution: new Vector2(),
    mouse: new Vector2(),
    renderer: new WebGL1Renderer({
      alpha: true,
      antialias: false,
      canvas: canvas
    }),
    scene: new Scene(),
    camera: new Camera(),
    clock: new Clock(),
    update: null,
    resize: null,
    isMobile: false,
    pixelRatio: 1
  },
  getters: {
    isMobilePortrait(state) {
      return state.isMobile && state.resolution.x < state.resolution.y;
    }
  },
  mutations: {
    setUpdate(state, update) {
      state.update = update;
    },
    destroyUpdate(state) {
      state.update = null;
    },
    setResize(state, resize) {
      state.resize = resize;
    },
    destroyResize(state) {
      state.resize = null;
    },
    changeMediaQuery(state, bool) {
      state.isMobile = bool;
    },
    setPixelRatio(state) {
      state.pixelRatio =
        ua.os.name === 'iOS' || ua.os.name === 'Android' ? 2 : 1;
    }
  },
  actions: {},
  modules: {
    touch,
    webcam,
    modal
  }
});

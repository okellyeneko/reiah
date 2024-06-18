import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";
const [layerStore, setLayerStore] = createStore({
  bikeLayer: null,
  trafficLayer: null,
  transitLayer: null,
  map: null,
  markerList: null,
  Plotly: null,
});
const [isGoogleMapInitialized, setIsGoogleMapInitialized] = createSignal(false);

export {
  layerStore,
  setLayerStore,
  isGoogleMapInitialized,
  setIsGoogleMapInitialized,
};

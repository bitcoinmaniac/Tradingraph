export default {
  props: {
    initialSize: {
      type: Object,
      required: false
    },
    settings: {
      type: Object,
      required: false,
      default: () => {}
    },
    data: {
      type: [Array, ArrayBuffer],
      required: true
    },
    requestedParams: {
      type: Object,
      required: true,
      default: {}
    },
    isEmpty: {
      type: Boolean,
      required: false,
      default: false
    },
    intervalWidth: {
      type: Number,
      required: false,
      default: (new Date()).getTime() / 1e3
    },
    initExposition: {
      type: Number,
      required: false,
      default: 86400
    },
    intervalStartOffset: {
      type: Number,
      required: false,
      default: null
    },
    availableCandleWidths: {
      type: Array,
      required: false,
      default: () => [900, 1800, 3600, 14400, 28800, 43200, 86400, 604800, 2592000, 31536000]
    },
    availableIntervals: {
      type: Array,
      required: false,
      default: () => [900, 1800, 3600, 14400, 28800, 43200, 86400, 604800, 2592000, 31536000]
    },
    reloadCounter: {
      type: Number,
      required: false,
      default: 0
    },
    params: {
      type: Object,
      required: false,
      default: {}
    },
    minCandleWidth: {
      type: Number,
      required: false,
      default: 3
    }
  },
  watch: {
    intervalWidth (value) {
      this.interval.width = value;
    },
    initExposition (value) {
      this.zoom.value = this.interval.width / value;
    },
    intervalStartOffset (value) {
      this.interval.offset = value;
    },
    availableCandleWidths (value) {
      this.candleWidths = value;
      this.zoom.value = this.rebaseZoom(this.zoom.value);
      if ('onRedraw' in this) {
        this.onRedraw();
      }
    },
    availableIntervals (value) {
      this.zoom.time_parts = value;
      this.zoom.value = this.rebaseZoom(this.zoom.value);
      if ('onRedraw' in this) {
        this.onRedraw();
      }
    },
    data (value) {
      this.chartData = value;
      return {}
    }
  }
};

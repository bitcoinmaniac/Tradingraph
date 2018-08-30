export default {
  data() {
    return {
      height: null,
      width: null,
      clientWidth: null,
      clientHeight: null,
      chart: {
        height: 260,
        width: 940,
        offset: {
          top: 0,
          left: 0
        }
      },
      zoom: {
        value: this.intervalWidth / this.initExposition,
        time_parts: this.availableIntervals,
        curr_time_part: 0
      },
      interval: {
        width: this.intervalWidth,
        firstPoint: 0,
        offset: this.intervalStartOffset ? +this.intervalStartOffset : 0
      }
    }
  },
  computed: {
    // Pixel number includes zoom koof
    dpi () {
      return this.chart.width / this.interval.width * this.zoom.value;
    },
    // Current time exposition
    exposition () {
      return +((this.chart.width / this.dpi).toFixed(5));
    },
    // Coefficient of transformations native pixels to internal for X
    koofScreenX () {
      return ('clientWidth' in this) && (+this.clientWidth) !== 0 ? this.width / this.clientWidth : 1;
    },
    // Coefficient of transformations native pixels to internal for Y
    koofScreenY () {
      return ('clientHeight' in this) && (+this.clientHeight) !== 0 ? this.height / this.clientHeight : 1;
    },
    // Base for font height
    fontHeight () {
      return this.koofScreenY > 0 ? 16 * this.koofScreenY : 16;
    },
    maxPart () {
      return this.zoom.time_parts[this.zoom.time_parts.length - 1];
    },
    minPart () {
      return this.zoom.time_parts[0];
    },
    minExposition () {
      return this.minPart * 10 > 86400 ? this.minPart * 10 : 86400;
    },
    maxExposition () {
      return this.maxPart * 100
    },
    minZoom () {
      let minZoom = this.interval.width / (this.maxExposition);
      if (this.availableCandleWidths.length) {
        let maxCandleWidth = this.availableCandleWidths[this.availableCandleWidths.length - 1];
        minZoom = this.interval.width / (maxCandleWidth * this.chart.width / 3);
      }
      return minZoom;
    },
    maxZoom () {
      return this.interval.width / (this.minExposition)
    }
  },
  watch: {
    'zoom.value' () {
      this.onRedraw();
    },
    'interval.offset' () {
      this.onRedraw();
    },
    'initialSize.height' () {
      this._onResize();
    },
    'initialSize.width' () {
      this._onResize();
    }
  },
  created () {
    window.addEventListener('resize', this._onResize);
  },
  mounted () {
    this._onResize();
  },
  methods: {
    _onResize () {
      if (this.width) {
        this.clientWidth = this.$refs.chart.clientWidth;
      }
      if (this.height) {
        this.clientHeight = this.$refs.chart.clientHeight;
      }
      if (this.initialSize.width > 0) {
        this.width = this.initialSize.width;
      } else {
        this.width = this.clientWidth;
      }
      if (this.initialSize.height > 0) {
        this.height = this.initialSize.height - this.sizes.navigator.height - this.offsets.navigatorOffset;
      } else {
        this.height = this.clientHeight;
      }
      this.chart.width = this.width - this.chart.offset.left - this.koofScreenX * 2;
      this.chart.height = this.height - this.offsets.chartTop - this.offsets.chartBottom;
      if (!this.clientWidth && !this.clientHeight) {
        this.$nextTick(() => {
          this.clientWidth = this.$refs.chart.clientWidth;
          this.clientHeight = this.$refs.chart.clientHeight;
        });
      }
      if ('onRedraw' in this) {
        this.onRedraw();
      }
    },
    _rebaseZoomByParams (params, zoom) {
      let result = zoom < this.minZoom ? this.minZoom : zoom;
      return result > this.maxZoom ? this.maxZoom : result;
    },
    rebaseZoom (zoom) {
      return this._rebaseZoomByParams(this, zoom);
    },
    onZoom (zoom, targetMoment) {
      let oldExposition = this.exposition;
      let zoomValue = this.rebaseZoom(this.zoom.value * zoom);
      this.zoom.value = zoomValue < 1 ? 1 : this.rebaseZoom(this.zoom.value * zoom);
      this.interval.offset = this._rebaseOffset(
        this.interval.offset + (oldExposition - this.exposition) *
        ((targetMoment - this.interval.offset) / this.exposition)
      );
    },
    _rebaseOffset (offset) {
      if (offset < 0) {
        offset = 0;
      } else if (offset > this.interval.width - this.exposition) {
        offset = this.interval.width - this.exposition;
      } else if (offset < this.interval.firstPoint) {
        offset = this.interval.firstPoint;
      }
      return Math.floor(offset);
    },
    setView (offset = this.interval.offset, exposition = this.exposition) {
      this.interval.offset = this._rebaseOffset(offset);
      this.zoom.value = this.rebaseZoom(this.interval.width / exposition);
    },
    onSwipe (params) {
      this.interval.offset = this._rebaseOffset(this.interval.offset + params.offsetX);
    },
    onHandle (data, position) {
      switch (position) {
        case 'left': {
          this.setView(data.offset, data.exposition);
          break;
        }
        case 'center': {
          this.setView(data.offset);
          break;
        }
        case 'right': {
          this.setView(data.offset, data.exposition);
          break;
        }
        default: break;
      }
    }
  },
  destroyed () {
    window.removeEventListener('resize', this._onResize);
  }
};

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
      return this._calcKoofScreenY();
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
      return this.minPart * 3
    },
    maxExposition () {
      return this.maxPart * this.zoom.time_parts.length
    },
    minZoom () {
      return this.interval.width / (this.maxExposition);
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
    }
  },
  created () {
    window.addEventListener('resize', this._onResize);
  },
  mounted () {
    this._onResize();
  },
  methods: {
    _calcKoofScreenY() {
      return ('clientHeight' in this) && (+this.clientHeight) !== 0 ? this.height / this.clientHeight : 1;
    },
    _onResize () {
      if (this.initialSize.width > 0) {
        this.width = this.initialSize.width;
      } else {
        this.clientWidth = this.$el.clientWidth;
        this.width = this.clientWidth;
      }
      if (this.initialSize.height > 0) {
        this.height = this.initialSize.height;
      } else {
        this.clientHeight = this.$el.clientHeight;
        this.height = this.clientHeight;
      }
      this.chart.width = this.width - this.chart.offset.left - this.koofScreenX * 2;
      this.chart.height = this.height - this.chart.offset.top - this.fontSizeAxisX * 1.5;
      if ('onRedraw' in this) {
        this.onRedraw();
      }
    },
    _rebaseZoomByParams (params, zoom) {
      let result = zoom < this.minZoom ? this.minZoom : zoom;

      if (this.candleWidths && this.candleWidths.length) {
        let maxCandleWidth = this.candleWidths[this.candleWidths.length - 1];
        this.minZoom = params.interval.width / (maxCandleWidth * this.chart.width / 3);
        result = result < this.minZoom ? this.minZoom : result;
      }
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

export default {
  data() {
    return {
      height: null,
      width: null,
      clientWidth: null,
      clientHeight: null,
      offsetTop: null,
      offsetLeft: null,
      chart: {
        height: 260,
        width: 940,
        offset: {
          top: 0,
          left: 0
        }
      },
      widths: {
        navigator: 0,
        axisX: 0,
        axisY: 0,
        crosshair: 0,
        rightPanel: 70
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
      let wholeExposition = this.interval.width;
      let minExposition = this.minPart * 10;
      if (this.interval.firstPoint > 0) {
        wholeExposition = this.interval.width - this.interval.firstPoint;
        minExposition = wholeExposition < minExposition ? wholeExposition : minExposition
      }
      return minExposition > 86400 ? minExposition : 86400;
    },
    maxExposition () {
      let maxCandleWidth = this.availableCandleWidths[this.availableCandleWidths.length - 1];
      let expositionLimit = this.interval.width - this.interval.firstPoint;
      if (this.availableCandleWidths.length) {
        let expositionByCandles = maxCandleWidth * this.chart.width / this.minCandleWidth;
        return expositionLimit > expositionByCandles ? expositionByCandles : expositionLimit;
      }
      return this.maxPart;
    },
    minZoom () {
      return this.interval.width / (this.maxExposition);
    },
    maxZoom () {
      return this.interval.width / (this.minExposition)
    },
    axisXOffset () {
      if (this.candles && this.candles.width) {
        return this.widths.rightPanel + this.candles.width / 4;
      }
      return 90;
    }
  },
  watch: {
    'zoom.value' () {
      this.onRedraw();
      this.sendOffsetAndExposition(this.interval.offset, this.exposition);
    },
    'interval.offset' () {
      this.onRedraw();
      this.sendOffsetAndExposition(this.interval.offset, this.exposition);
    },
    'interval.firstPoint' () {
      if (this.interval.firstPoint > 0) {
        this.setView(this.intervalStartOffset, this.initExposition);
      }
    },
    maxZoom () {
      this.setView();
    },
    minZoom () {
      this.setView();
    },
    'initialSize.height' () {
      this._onResize();
    },
    'initialSize.width' () {
      this._onResize();
    },
    reloadCounter () {
      this.interval.firstPoint = 0;
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
      this.offsetTop = this.$el.offsetTop;
      this.offsetLeft = this.$el.offsetLeft;
      if (this.width) {
        this.clientWidth = this.$refs.chart.clientWidth || this.$refs.chart.parentNode.clientWidth;
      }
      if (this.height) {
        this.clientHeight = this.$refs.chart.clientHeight || this.$refs.chart.parentNode.clientHeight;
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
      this.widths.navigator = this.widths.crosshair = this.widths.axisY = this.width;
      this.chart.width = this.width;
      this.chart.height = this.height - this.offsets.chartTop - this.offsets.chartBottom;
      if (!this.clientWidth && !this.clientHeight) {
        this.$nextTick(() => {
          this.clientWidth = this.$refs.chart.clientWidth || this.$refs.chart.parentNode.clientWidth;
          this.clientHeight = this.$refs.chart.clientHeight || this.$refs.chart.parentNode.clientHeight;
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
      if (offset < 1) {
        offset = this.interval.width * (1 - offset);
      }
      if (offset < 0) {
        offset = 0;
      } else if (offset > this.interval.width - this.exposition) {
        offset = this.interval.width - this.exposition;
      }
      if (offset < this.interval.firstPoint) {
        offset = this.interval.firstPoint;
      }
      return Math.floor(offset);
    },
    setView (offset = this.interval.offset, exposition = this.exposition) {
      if (exposition > this.maxExposition &&  exposition > this.minExposition) {
        offset = offset + exposition - this.maxExposition;
        exposition = this.maxExposition;
      }
      if (exposition < this.minExposition) {
        offset = offset + exposition - this.minExposition;
      }
      this.zoom.value = this.rebaseZoom(this.interval.width / exposition);
      this.interval.offset = this._rebaseOffset(offset);
    },
    onSwipe (params) {
      this.interval.offset = this._rebaseOffset(this.interval.offset + params.offsetX);
    },
    onHandle (data, position) {
      switch (position) {
        case 'left':
        case 'right': {
          this.setView(data.offset, data.exposition);
          break;
        }
        case 'center': {
          this.setView(data.offset);
          break;
        }
        default: break;
      }
    },
    sendOffsetAndExposition (offset, exposition) {
      if (this.interval.firstPoint > 0 && this.interval.width > 0 && offset !== this.intervalStartOffset || exposition !== this.initExposition) {
        this.$emit('lastLocationInfo', offset, exposition, this.interval.firstPoint, this.interval.width);
      }
    }
  },
  destroyed () {
    window.removeEventListener('resize', this._onResize);
  }
};

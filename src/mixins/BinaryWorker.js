import BinaryWorker from 'worker-loader?inline=true!@/workers/BinaryDataWorker.js';

export default {
  data () {
    return {
      workers: {}
    };
  },
  watch: {
    requestedParams: {
      handler () {
        let availableParams = this.findRequestedParam(this.requestedParams, this.workers.binaryWorker.requestedParams);
        if (availableParams.length) {
          let task = 'SET_PARAMS';
          let params = {};
          for (let i = 0, len = availableParams.length; i < len; i++) {
            params[availableParams[i]] = this.requestedParams[availableParams[i]];
          }
          this.workers.binaryWorker.postMessage({ task, params });
        }
      },
      deep: true
    },
    data () {
      this.workers.binaryWorker.postMessage({
        task: 'APPEND',
        data: this.data
      });
    },
    reloadCounter () {
      this.workers.binaryWorker.postMessage({task: 'RELOAD'});
    }
  },
  mounted () {
    let binaryWorker = new BinaryWorker();
    binaryWorker.onmessage = this.onBinaryWorkerMessage;
    binaryWorker.redraw = this.render;
    binaryWorker.renderIndicators = this.renderIndicators;
    this.workers.binaryWorker = binaryWorker;
    this.workers.binaryWorker.requestedParams = [];
  },
  methods: {
    onBinaryWorkerMessage (message) {
      switch (message.data.type) {
        case 'REQUEST_PARAMS': {
          this.workers.binaryWorker.requestedParams = message.data.body.outer;
          this.$emit('requestParams', message.data.body.outer);
          if (message.data.body.inner.indexOf['candleWidths'] !== -1) {
            this.setCandleWidthsParam(this.availableCandleWidths);
          }
          break;
        }
        case 'REQUEST_DATA': {
          this.isLoading = true;
          this.$emit('requestData', message.data.body);
          break;
        }
        case 'APPENDED': {
          this.isEmpty = false;
          for (let i = 0, len = message.data.body.type.length; i < len; i++) {
            switch (message.data.body.type[i]) {
              case 'candleData': {
                this.renderCandles();
                this.renderIndicators();
                break;
              }
              case 'averageData': {
                this.renderAverage();
                break;
              }
              case 'indicatorData': {
                this.renderIndicators();
                break;
              }
              default: break;
            }
          }
          break;
        }
        case 'RENDERED': {
          switch (message.data.body.type) {
            case 'average': {
              this.average = message.data.body.data;
              if (this.average.minTimestamp) {
                this.interval.firstPoint = this.average.minTimestamp;
              }
              break;
            }
            case 'candles': {
              let candles = {};
              for (let field in message.data.body.data) {
                if (field !== 'candles') {
                  candles[field] = message.data.body.data[field];
                }
              }
              this.candles = candles;
              this.candles['candles'] = message.data.body.data.candles;
              this.isLoading = false;
              break;
            }
            case 'indicators': {
              this.indicatorDisplayableData.splice(0);
              this.indicatorDisplayableData = Object.keys(message.data.body.data.indicators).map(key => {
                if (message.data.body.data.indicators[key]) {
                  return message.data.body.data.indicators[key];
                } else {
                  return '';
                }
              });
              break;
            }
            default: break;
          }
          break;
        }
        case 'EMPTY': {
          this.isLoading = false;
          this.isEmpty = true;
          break;
        }
        default: break;
      }
    },
    render () {
      this.renderCandles();
      this.renderAverage();
      this.renderIndicators();
    },
    renderCandles () {
      if (this.chart.width && this.chart.height) {
        this.setCandleWidthsParam(this.availableCandleWidths);
        this.workers.binaryWorker.postMessage({
          task: 'RENDER',
          params: {
            type: 'candles',
            offset: this.interval.offset,
            exposition: this.exposition,
            viewWidth: this.chart.width - this.axisXOffset,
            viewHeight: this.chart.height,
            indicators: this.indicators
          }
        });
      }
    },
    renderAverage () {
      this.workers.binaryWorker.postMessage({
        task: 'RENDER',
        params: {
          type: 'average',
          viewWidth: this.width,
          viewHeight: this.sizes.navigator.height
        }
      });
    },
    renderIndicators () {
      // this.workers.binaryWorker.postMessage({
      //   task: 'RENDER',
      //   params: {
      //     type: 'indicators',
      //     offset: this.interval.offset,
      //     exposition: this.exposition,
      //     indicators: this.indicators,
      //     viewWidth: this.width - this.axisXOffset,
      //     viewHeight: this.chart.height
      //   }
      // });
    },
    findRequestedParam (newParams, requestedParam) {
      let availableParams = [];
      Object.keys(newParams).map(param => {
        if (requestedParam.indexOf(param) !== -1) {
          availableParams.push(param);
        }
      });
      return availableParams;
    },
    setCandleWidthsParam (candleWidths) {
      if (candleWidths.length) {
        this.workers.binaryWorker.postMessage({
          task: 'SET_PARAMS',
          params: { candleWidths }
        });
      }
    }
  }
}
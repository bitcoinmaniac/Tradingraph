import CandlesWorker from 'worker-loader?inline=true!@/workers/CandlesWorker.js';

export default {
  data () {
    return {
      workers: {}
    }
  },
  props: {
    dataAverage: {
      type: Array,
      required: true
    }
  },
  mounted () {
    this.workerInitialize();
  },
  watch: {
    data () {
      if (this.data.length) {
        this.workers.candlesWorker.postMessage({
          task: 'SET-PARAMS',
          params: {
            candleWidths: this.availableCandleWidths,
            noMoreData: this.noMoreData
          }
        });
        this.workers.candlesWorker.postMessage({task: 'APPEND', data: this.data});
      }
    },
    dataAverage () {
      if (this.workers.candlesWorker) {
        this.workers.candlesWorker.postMessage({task: 'APPEND_AVERAGE', data: this.dataAverage});
      }
    },
    params () {
      this.workers.candlesWorker.postMessage({
        task: 'SET-PARAMS',
        params: this.params
      });
    },
    reloadCounter () {
      this.workers.candlesWorker.postMessage({task: 'RELOAD'});
    },
    isEmpty () {
      this.workers.candlesWorker.postMessage({
        task: 'SET-PARAMS',
        params: {
          empty: this.isEmpty
        }
      });
    }
  },
  methods: {
    workerInitialize () {
      let candlesWorker = new CandlesWorker({
        candleWidths: this.availableCandleWidths
      });
      candlesWorker.onmessage = this._onCandlesWorkerMessage;
      candlesWorker.redraw = this._remakeCandles;
      this.workers.candlesWorker = candlesWorker;
    },
    _remakeCandles () {
      if (this.chart.width && this.chart.height) {
        this.workers.candlesWorker.postMessage({
          task: 'RENDER',
          offset: this.interval.offset,
          exposition: this.exposition,
          viewWidth: this.chart.width,
          viewHeight: this.chart.height
        });
      }
    },
    _onCandlesWorkerMessage (message) {
      switch (message.data.type) {
        case 'APPENDED' : {
          this._remakeCandles();
          break;
        }
        case 'APPENDED_AVERAGE' : {
          this.workers.candlesWorker.postMessage({
            task: 'RENDER_AVERAGE',
            offset: this.interval.offset,
            exposition: this.exposition,
            viewWidth: this.clientWidth,
            viewHeight: this.sizes.navigator.height
          });
          break;
        }
        case 'NEED_DATA' : {
          this.$emit('requestData', message.data.body);
          break;
        }
        case 'NEED_PARAMS' : {
          this.$emit('requestParams', message.data.body.outer);
          if (message.data.body.inner.candleWidths && this.availableCandleWidths.length) {
            this.workers.candlesWorker.postMessage({
              task: 'SET-PARAMS',
              params: {
                candleWidths: this.availableCandleWidths
              }
            });
          }
          break;
        }
        case 'RENDERED' : {
          let candles = {};
          for (let field in message.data.body) {
            if (field !== 'candles') {
              candles[field] = message.data.body[field];
            }
          }
          this.candles = candles;
          this.candles['candles'] = message.data.body.candles;
          break;
        }
        case 'RENDERED_AVERAGE' : {
          this.average = message.data.body;
          if (message.data.body.minTimestamp) {
            this.interval.firstPoint = message.data.body.minTimestamp;
          }
          break;
        }
        default: break;
      }
    }
  }
};

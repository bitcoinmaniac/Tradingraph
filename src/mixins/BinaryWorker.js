import BinaryWorker from 'worker-loader?inline=true!@/workers/BinaryDataWorker.js';

export default {
  data () {
    return {
      workers: {}
    };
  },
  watch: {
    requestedParams () {
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
    availableCandleWidths () {
      if (this.availableCandleWidths.length) {
        this.setCandleWidthsParam(this.availableCandleWidths);
      }
    },
    data () {
      this.workers.binaryWorker.postMessage({
        task: 'APPEND',
        data: this.data
      });
    }
  },
  mounted () {
    let binaryWorker = new BinaryWorker();
    binaryWorker.onmessage = this.onBinaryWorkerMessage;
    // binaryWorker.redraw = this._remakeCandles;
    this.workers.binaryWorker = binaryWorker;
    this.workers.binaryWorker.requestedParams = [];
  },
  methods: {
    onBinaryWorkerMessage (message) {
      switch (message.data.type) {
        case 'REQUEST_PARAMS': {
          this.workers.binaryWorker.requestedParams = message.data.body.outer;
          this.$emit('requestParams', message.data.body.outer);
          if (message.data.body.inner.indexOf['candleWidths'] !== -1 && this.availableCandleWidths.length) {
            this.setCandleWidthsParam(this.availableCandleWidths);
          }
          break;
        }
        case 'REQUEST_DATA': {
          this.$emit('requestData', message.data.body);
          break;
        }
        case 'APPENDED': {
          for (let i = 0, len = message.data.body.type.length; i < len; i++) {
            switch (message.data.body.type[i]) {
              case 'candleData': {
                break;
              }
              case 'averageData': {
                this.workers.binaryWorker.postMessage({
                  task: 'RENDER',
                  params: {
                    type: 'average',
                    params: {
                      viewWidth: this.clientWidth,
                      viewHeight: this.sizes.navigator.height
                    }
                  }
                });
                break;
              }
              default: break;
            }
          }
          break;
        }
        case 'RENDERED': {
          console.log('RENDERED', message);
          switch (message.data.body.type) {
            case 'average': {
              this.average = message.data.body.data;
              if (this.average.minTimestamp) {
                this.interval.firstPoint = this.average.minTimestamp;
              }
              break;
            }
            default: break;
          }
        }
        default: break;
      }
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
      this.workers.binaryWorker.postMessage({
        task: 'SET_PARAMS',
        params: { candleWidths }
      });
    }
  }
}
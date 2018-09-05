const MIN_WIDTH_CANDLE = 10;
const VOLUME_ZONE = 0.3;    // Volume area

class BinaryDataWorker {
  constructor () {
    this.data = {
      treeReady: false,
      rawBinary: [],
      rawParsed: [],
      rawAverageBinary: [],
      rawAverageParsed: [],
      firstEntry: 0,
      lastResolution: 0,
      start: null,
      width: null,
      tree: []
    };
    this.params = {
      empty: false,
      candleWidths: [],
      defaultExposition: 30,
      fileSizes: {},
      resolutions: [],
      packetSize: 0,
      dataRequestPending: false,
      isInitialLoading: false
    };
    this.requestInitialParams();
  }
  requestInitialParams () {
    this.sendMessage('REQUEST_PARAMS', {
      inner: ['candleWidths'],
      outer: ['fileSizes', 'resolutions', 'packetSize']
    });
  }
  initialLoading (resolution) {
    let end = this.params.fileSizes[resolution];
    let exposition = this.rebaseExposition(end, end);
    let offset = this.rebaseOffset(end - exposition, end);
    this.params.dataRequestPending = true;
    this.params.isInitialLoading = true;
    this.sendMessage('REQUEST_DATA', {offset, end: end - 1, resolution});
  }
  rebaseOffset (offset, dataLength) {
    if (offset < 0) {
      return 0
    } else if (offset > (dataLength - 1)) {
      return dataLength - 1;
    }
    return offset;
  }
  rebaseExposition (exposition, dataLength) {
    if (exposition > dataLength) {
      return dataLength
    }
    return exposition;
  }
  append (data) {
    this.params.dataRequestPending = false;
    this.appendedData = ['candleData'];
    this.data.rawBinary = data;
    this.data.rawParsed = this.parseChartData(this.data.rawBinary);
    if (this.params.isInitialLoading === true) {
      this.appendedData.push('averageData');
      this.data.averageBinary = data;
      this.data.averageParsed = this.data.rawParsed.slice();
      this.params.isInitialLoading = false;
    }
    this.sendMessage('APPENDED', { type: this.appendedData });
  }
  parseEntity (entity) {
    return {
      timestamp: (new Uint32Array(entity, 0, 1))[0],
      volume: (new Float32Array(entity, 4, 1))[0],
      open: (new Float32Array(entity, 8, 1))[0],
      high: (new Float32Array(entity, 12, 1))[0],
      low: (new Float32Array(entity, 16, 1))[0],
      close: (new Float32Array(entity, 20, 1))[0],
      average: (new Float32Array(entity, 24, 1))[0]
    }
  }
  parseChartData (rawData) {
    let dataArray = [];
    for (let i = 0, j = 0; i < rawData.byteLength; i += this.params.packetSize, j++) {
      dataArray[j] = this.parseEntity(rawData.slice(i, i + this.params.packetSize));
    }
    return dataArray;
  }
  renderAverage (viewWidth, viewHeight) {
    let dataLength = this.data.averageParsed.length;
    if (dataLength) {
      let step = (viewWidth) / dataLength;
      let result = {
        minTimestamp: this.data.averageParsed[0].timestamp,
        maxTimestamp: this.data.averageParsed[dataLength - 1].timestamp,
        path: []
      };
      let sortedByAverage = this.data.averageParsed.slice().sort((a, b) => {return a.average - b.average;});
      let highest = sortedByAverage[dataLength - 1].average;
      let lowest = sortedByAverage[0].average;
      let yMultiplyer = viewHeight / (highest - lowest);
      result.path.push(`M6 ${yMultiplyer * (highest - this.data.averageParsed[0].average)}`);
      for (let i = 1; i < dataLength; i++) {
        result.path.push(`L${step * i} ${yMultiplyer * (highest - this.data.averageParsed[i].average)}`);
      }
      this.sendMessage('RENDERED', { data: result, type: 'average'});
    }
  }
  /**
   * @description Apply params for render
   * @param {Object} params - params
   * @return none
   */
  setParams (freshParams) {
    Object.keys(freshParams).map((param) => {
      this.params[param] = freshParams[param];
    });
    this.data.treeReady = false;
  }
  messageHandler (message) {
    switch (message.data.task) {
      case 'SET_PARAMS': {
        this.setParams(message.data.params);
        if (
          Object.keys(this.params.fileSizes).length > 0 && this.params.resolutions.length > 0 &&
          this.params.fileSizes[this.params.resolutions[this.params.resolutions.length - 1]] > 0 &&
          this.params.packetSize && !this.params.dataRequestPending && !this.data.rawBinary.length
        ) {
          this.initialLoading(this.params.resolutions[this.params.resolutions.length - 1]);
        }
        break;
      }
      case 'APPEND': {
        this.append(message.data.data);
        break;
      }
      case 'RENDER': {
        switch (message.data.params.type) {
          case 'average' : {
            this.renderAverage(message.data.params.params.viewWidth, message.data.params.params.viewHeight);
            break;
          }
          default: break;
        }
      }
      // case 'RELOAD': {
      //   this.params.empty = false;
      //   this.params.noMoreData = false;
      //   this.resetData();
      //   // this.params.dataRequestPending = true;
      //   this.requestParams();
      //   break;
      // }
      default: break;
    }
  }
  /**
   * @description Send message to parrent
   * @param {String} type - string based command for parrent
   * @param {Object} body - data for message depends on command
   */
  sendMessage (type, body = null) {
    postMessage({type, body});
  }
}

let worker = new BinaryDataWorker();

onmessage = (data) => {
  worker.messageHandler(data);
};
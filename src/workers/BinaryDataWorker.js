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
    this.data.treeReady = false;
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
    this.makeTree();
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
  /**
   * @description Make specific tree by raw data
   * @return none
   */
  makeTree () {
    if (this.data.rawParsed.length > 0) {
      this.data.start = this.data.rawParsed[0].timestamp;
      this.data.end = this.data.rawParsed[this.data.rawParsed.length - 1].timestamp;
      this.params.candleWidths.map((case_) => {
        this.data.tree[case_] = [];

        let lastCandle = null;

        this.data.rawParsed.map((candle) => {
          let id = candle.timestamp - (candle.timestamp % case_);
          if (lastCandle && (id === lastCandle.id)) {
            lastCandle.low = candle.low < lastCandle.low ? candle.low : lastCandle.low;
            lastCandle.high = candle.high > lastCandle.high ? candle.high : lastCandle.high;
            lastCandle.close = candle.close;
            lastCandle.volume += candle.volume;
          } else {
            if (lastCandle) {
              this.data.tree[case_].push(lastCandle);
            }
            lastCandle = {
              id: id,
              timestamp: candle.timestamp,
              open: candle.open,
              low: candle.low,
              high: candle.high,
              close: candle.close,
              volume: candle.volume
            };
          }
        });
        if (lastCandle) {
          this.data.tree[case_].push(lastCandle);
        }
      });
      this.data.treeReady = true;
    }
  }
  /**
   * @description Looking for satisfying width of candle
   * @param {Number} exposition - exposition width
   * @param {Number} viewWidth  - view box width
   * @return true/false
   */
  findCandleWidthForUse (exposition, viewWidth) {
    let targetCandleNumber = viewWidth / MIN_WIDTH_CANDLE;
    let caseCandidate = null;
    let prevCandleDiff = 0;
    this.params.candleWidths.map((case_) => {
      if (caseCandidate) {
        let candleDiff = Math.abs(Math.round(targetCandleNumber - exposition / case_));
        if (candleDiff < prevCandleDiff) {
          prevCandleDiff = candleDiff;
          caseCandidate = case_;
        }
      } else {
        caseCandidate = case_;
        prevCandleDiff = Math.abs(Math.round(targetCandleNumber - exposition / case_));
      }
    });
    return caseCandidate;
  }
  /**
   * @description Render candles objects
   * @param {Number} offset     - exposition offset
   * @param {Number} exposition - exposition width
   * @param {Number} viewWidth  - view box width
   */
  renderCandles (offset, exposition, viewWidth, viewHeight) {
    if (!this.data.treeReady) {
      this.makeTree();
    }
    let result = {
      low: null,
      high: null,
      maxVolume: null,
      width: null,
      candles: [],
      candlesPositivePath: [],
      candlesNegativePath: [],
      volumePath: []
    };
    let theCase = this.findCandleWidthForUse(exposition, viewWidth);
    let theData = this.data.tree[theCase];
    let koofX = viewWidth / exposition;
    result.width = theCase * koofX;
    let start = 0;
    // console.log('RENDER', theData);
    if (theData /* && this.data.lastResolution === theCase */) {
      let stop = theData.length;
      if (offset > this.data.start) {
        start = -Math.floor((offset - this.data.start) / theCase);
      }

      for (let index = -start; index < stop; index++) {
        let candle = theData[index];
        if (candle.timestamp <= offset) {
          continue;
        } else if (candle.timestamp > offset + exposition) {
          stop = index;
          break;
        } else if (start < 0) {
          start = index;
        }
        if ((result.low == null) || (result.low > candle.low)) {
          result.low = candle.low;
        }
        if ((result.high == null) || (result.high < candle.high)) {
          result.high = candle.high;
        }
        if ((result.maxVolume == null) || (result.maxVolume < candle.volume)) {
          result.maxVolume = candle.volume;
        }
      }

      start = Math.abs(start);
      if (stop == null) {
        stop = theData.length;
      }
      let koofY = viewHeight / (result.high - result.low);
      let koofYV = viewHeight * VOLUME_ZONE / result.maxVolume; // for volume
      let barHalf = theCase * koofX * 0.25;
      for (let index = start; index < stop; index++) {
        let candle = theData[index];
        let x = (candle.timestamp - offset) * koofX;
        let pathMainLine = `M${x} ${(result.high - candle.low) * koofY} L${x} ${(result.high - candle.high) * koofY} `;
        let pathCandleBody = `M${x - barHalf} ${(result.high - candle.close) * koofY} L${x + barHalf} ${(result.high - candle.close) * koofY} ` +
          `L${x + barHalf} ${(result.high - candle.open) * koofY} L${x - barHalf} ${(result.high - candle.open) * koofY} `;
        let rCandle = Object.assign({}, candle);

        if (candle.open <= candle.close) {
          rCandle.class = 'positive';
          rCandle.candlePathIndex = result.candlesPositivePath.push(pathMainLine + pathCandleBody) - 1;
        } else {
          rCandle.class = 'negative';
          rCandle.candlePathIndex = result.candlesNegativePath.push(pathMainLine + pathCandleBody) - 1;
        }

        rCandle.volumePathIndex = result.volumePath.push(`M${x - barHalf} ${viewHeight - candle.volume * koofYV} L${x + barHalf} ${viewHeight - candle.volume * koofYV} ` +
          `L${x + barHalf} ${viewHeight} L${x - barHalf} ${viewHeight} `) - 1;

        rCandle.x = x;
        result.candles.push(rCandle);
      }
    } else if (!this.params.dataRequestPending) {
      // this.params.dataRequestPending = true;
      // this.sendMessage('REQUEST_DATA', {offset: 0, end: this.params.resolutions[this.params.resolutions.length - 1], resolution: theCase});
      // this.data.lastResolution = theCase;
      // return false;
    }
    // if (this.data.start > 0 && this.data.start <= offset) {
    // } else if (!this.params.dataRequestPending && offset > this.params.firstTimestamp) {
    //   this.params.dataRequestPending = true;
    //   this.sendMessage('REQUEST_DATA', {offset: offset, end: this.params.resolutions[this.params.resolutions.length - 1], resolution: theCase});
    // }
    this.data.lastResolution = theCase;
    this.sendMessage('RENDERED', { type: 'candles', data: result });
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
      this.sendMessage('RENDERED', { type: 'average', data: result});
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
          this.params.packetSize && !this.params.dataRequestPending && !this.params.initialLoading
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
        let params = message.data.params;
        switch (params.type) {
          case 'average': {
            this.renderAverage(params.viewWidth, params.viewHeight);
            break;
          }
          case 'candles': {
            this.renderCandles(params.offset, params.exposition, params.viewWidth, params.viewHeight);
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
const MIN_WIDTH_CANDLE = 3;
const VOLUME_ZONE = 0.3;    // Volume area

class BinaryDataWorker {
  constructor () {
    this.data = {
      treeReady: false,
      rawBinary: [],
      rawParsed: [],
      averageBinary: [],
      averageParsed: [],
      firstEntry: 0,
      lastResolution: 0,
      start: null,
      width: null,
      last: {
        offset: 0,
        end: 0,
        resolution: 0
      },
      tree: []
    };
    this.params = {
      empty: false,
      candleWidths: [],
      defaultExposition: 86400 * 30,
      fileSizes: {},
      resolutions: [],
      packetSize: 0,
      dataRequestPending: false,
      isInitialLoading: true
    };
    this.requestInitialParams();
  }
  resetData () {
    Object.assign(this.data, {
      treeReady: false,
      rawBinary: [],
      rawParsed: [],
      averageBinary: [],
      averageParsed: [],
      firstEntry: 0,
      lastResolution: 0,
      start: null,
      width: null,
      last: {
        offset: 0,
        end: 0,
        resolution: 0
      },
      tree: []
    });
    Object.assign(this.params, {
      dataRequestPending: false,
      isInitialLoading: true,
      fileSizes: {},
      resolutions: [],
      empty: false
    });
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
    let offset = this.rebaseOffset(end - exposition, resolution);
    this.params.isInitialLoading = true;
    this.requestData(offset, end - 1, resolution);
  }
  rebaseOffset (offset, resolution) {
    let dataLength = this.params.fileSizes[resolution];
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
    this.data.rawBinary = data.slice(0);
    this.data.rawParsed = this.parseChartData(this.data.rawBinary);
    if (this.params.isInitialLoading === true) {
      this.appendedData.push('averageData');
      this.data.averageBinary = data.slice(0);
      this.data.averageParsed = this.data.rawParsed.slice(0);
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
  findAvailableResolution (resolution = 86400) {
    let resolutionQty = this.params.resolutions.length;
    if (resolution > this.params.resolutions[resolutionQty - 1]) {
      return this.params.resolutions[resolutionQty - 1];
    }
    for (let i = 0, len = resolutionQty; i < len; i++) {
      if (resolution === this.params.resolutions[i] || (resolution < this.params.resolutions[i] && i === 0)) {
        return this.params.resolutions[i];
      } else if (resolution < this.params.resolutions[i] && i > 0) {
        return this.params.resolutions[i - 1];
      }
    }
  }
  convertTimestampToPackage (timestamp, resolution) {
    return Math.ceil(timestamp / resolution) * this.params.packetSize;
  }
  convertOffsetToPackage (offset, resolution) {
    let lastPointTimestamp = (new Date()).getTime() / 1e3;
    let offsetFromEnd = lastPointTimestamp - (offset - this.params.defaultExposition);
    let convertedOffset = this.convertTimestampToPackage(offsetFromEnd, resolution);
    let fileSize = this.params.fileSizes[resolution];
    return this.rebaseOffset(fileSize - convertedOffset, resolution)
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
    let koofX = viewWidth / exposition;
    result.width = theCase * koofX;
    let theData = this.data.tree[theCase];
    let start = 0;
    // console.log('RENDER', offset, exposition, viewWidth, viewHeight);
    if (theData && this.data.lastResolution === theCase) {
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
      let yFactor = 0;
      if (result.high !== result.low) {
        yFactor = viewHeight / (result.high - result.low);
      } else {
        yFactor = viewHeight / (result.high * 1.1 - result.low);
      }
      let yVolumeFactor = 0;
      if (result.maxVolume > 0) {
        yVolumeFactor = viewHeight * VOLUME_ZONE / result.maxVolume;
      }
      let barHalf = theCase * koofX * 0.25;
      for (let index = start; index < stop; index++) {
        let candle = theData[index];
        let x = (candle.timestamp - offset) * koofX;
        let pathMainLine = `M${x} ${(result.high - candle.low) * yFactor} L${x} ${(result.high - candle.high) * yFactor} `;
        let pathCandleBody =
          `M${x - barHalf} ${(result.high - candle.close) * yFactor}
           L${x + barHalf} ${(result.high - candle.close) * yFactor}
           L${x + barHalf} ${(result.high - candle.open) * yFactor}
           L${x - barHalf} ${(result.high - candle.open) * yFactor}`;
        let rCandle = Object.assign({}, candle);

        if (candle.open <= candle.close) {
          rCandle.class = 'positive';
          rCandle.candlePathIndex = result.candlesPositivePath.push(pathMainLine + pathCandleBody) - 1;
        } else {
          rCandle.class = 'negative';
          rCandle.candlePathIndex = result.candlesNegativePath.push(pathMainLine + pathCandleBody) - 1;
        }

        rCandle.volumePathIndex = result.volumePath.push(
          `M${x - barHalf} ${viewHeight - candle.volume * yVolumeFactor}
           L${x + barHalf} ${viewHeight - candle.volume * yVolumeFactor}
           L${x + barHalf} ${viewHeight}
           L${x - barHalf} ${viewHeight}`
        ) - 1;

        rCandle.x = x;
        result.candles.push(rCandle);
      }
    } else {
      let resolution = this.findAvailableResolution(theCase);
      this.requestData(
        this.convertOffsetToPackage(offset, resolution),
        this.params.fileSizes[resolution] - 1,
        resolution
      );
      // let resolution = this.findAvailableResolution(theCase);
      // let offsetFromFirstPoint = this.rebaseOffset(this.convertTimestampToPackage(offset - this.data.averageParsed[0].timestamp, resolution), resolution);
      // this.params.dataRequestPending = true;
      // // let exposition = this.convertExpositionToPackage(this.data.averageParsed[this.data.averageParsed.length - 1].timestamp - offset, resolution);
      // this.requestData(
      //   offsetFromFirstPoint,
      //   this.params.fileSizes[resolution],
      //   resolution
      // );
      // this.data.lastResolution = theCase;
      // return false;
    }
    if (this.data.start > 0 && this.data.start > offset) {
      // this.params.dataRequestPending = true;
      // let resolution = this.findAvailableResolution(theCase);
      // // let exposition = this.convertExpositionToPackage(this.data.averageParsed[this.data.averageParsed.length - 1].timestamp - offset, resolution);
      // this.requestData(
      //   0,
      //   this.params.fileSizes[resolution],
      //   resolution
      // );
      let resolution = this.findAvailableResolution(theCase);
      this.requestData(
        this.convertOffsetToPackage(offset, resolution),
        this.params.fileSizes[resolution] - 1,
        resolution
      );
    }
    this.data.lastResolution = theCase;
    this.sendMessage('RENDERED', { type: 'candles', data: result });
  }
  returnEmptyData () {
    this.sendMessage('RENDERED', {
      type: 'candles',
      data: {
        candles: [],
        candlesPositivePath: [],
        candlesNegativePath: [],
        volumePath: []
      }
    });
    this.sendMessage('RENDERED', {
      type: 'average',
      data: {
        minTimestamp: 0,
        path: []
      }
    });
  }
  renderAverage (viewWidth, viewHeight) {
    let dataLength = this.data.averageParsed.length;
    if (dataLength) {
      let step = (viewWidth) / dataLength;
      let result = {
        minTimestamp: this.data.averageParsed[0].timestamp - 86400,
        maxTimestamp: this.data.averageParsed[dataLength - 1].timestamp,
        path: []
      };
      let sortedByAverage = this.data.averageParsed.slice(0).sort((a, b) => {return a.average - b.average;});
      let highest = sortedByAverage[dataLength - 1].average;
      let lowest = sortedByAverage[0].average;
      let yMultiplyer = 0;
      if (highest !== lowest) {
        yMultiplyer = viewHeight / (highest - lowest);
      }
      result.path.push(`M0 ${yMultiplyer * (highest - this.data.averageParsed[0].average)}`);
      for (let i = 1; i < dataLength; i++) {
        result.path.push(`L${step * i} ${yMultiplyer * (highest - this.data.averageParsed[i].average)}`);
      }
      this.sendMessage('RENDERED', { type: 'average', data: result});
    }
  }
  requestData(offset = this.data.last.offset, end = this.data.last.end, resolution = this.data.last.resolution) {
    if (!this.params.dataRequestPending && end > 0 && (this.data.last.offset !== offset || this.data.last.end !== end || this.data.last.resolution !== resolution)) {
      this.params.dataRequestPending = true;
      Object.assign(this.data.last, {offset, end, resolution});
      this.sendMessage('REQUEST_DATA', {offset, end, resolution});
    }
  }
  /**
   * @description Apply params for render
   * @param {Object} params - params
   * @return none
   */
  setParams (freshParams) {
    if (freshParams.candleWidths && !this.isCandleWidthsTheSame(freshParams.candleWidths)) {
      Object.assign(this.data, {
        treeReady: false,
        rawBinary: [],
        rawParsed: [],
        firstEntry: 0,
        lastResolution: 0,
        start: null,
        width: null,
        tree: []
      });
    }
    Object.assign(this.params, freshParams);
  }
  isCandleWidthsTheSame (newCandleWidths) {
    for (let i = 0, len = newCandleWidths.length; i < len; i++) {
      if (this.params.candleWidths.indexOf(newCandleWidths[i]) === -1) {
        return false;
      }
    }
    return true;
  }
  messageHandler (message) {
    switch (message.data.task) {
      case 'SET_PARAMS': {
        this.setParams(message.data.params);
        if (
          !this.data.averageParsed.length && Object.keys(this.params.fileSizes).length > 0 &&
          this.params.resolutions.length > 0 &&
          this.params.fileSizes[this.params.resolutions[this.params.resolutions.length - 1]] > 0 &&
          this.params.packetSize && !this.params.dataRequestPending
        ) {
          this.initialLoading(this.params.resolutions[this.params.resolutions.length - 1]);
        } else if (
          !this.data.averageParsed.length && Object.keys(this.params.fileSizes).length > 0 && this.params.resolutions.length > 0 &&
          this.params.fileSizes[this.params.resolutions[this.params.resolutions.length - 1]] === 0)
        {
          this.sendMessage('EMPTY');
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
        break;
      }
      case 'RELOAD': {
        this.returnEmptyData();
        this.params.empty = false;
        this.resetData();
        this.requestInitialParams();
        break;
      }
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
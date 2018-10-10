const MIN_WIDTH_CANDLE = 3;
const VOLUME_ZONE = 0.3;    // Volume area
class SvgDraw {
  constructor (points) {
    this.points = points;
    this.smoothing = 0.2;
  }
  line (pointA, pointB)  {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX)
    };
  }
  controlPoint (current, previous, next, reverse) {
    // When 'current' is the first or last point of the array
    // 'previous' or 'next' don't exist.
    // Replace with 'current'
    const p = previous || current;
    const n = next || current;

    // Properties of the opposed-line
    const o = this.line(p, n);

    // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * this.smoothing;

    // The control point position is relative to the current point
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
  }
  bezierCommand (point, i, a) {
    // start control point
    const cps = this.controlPoint(a[i - 1], a[i - 2], point);

    // end control point
    const cpe = this.controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
  }
  drawSvgPath () {
    // build the d attributes by looping over the points
    return this.points.reduce(
      (acc, point, i, a) => i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${this.bezierCommand(point, i, a)}`,
      ''
    );
  }
}
class TechIndicators {
  constructor () {}
}
class BinaryDataWorker {
  constructor () {
    this.data = {
      treeReady: false,
      candlesBinary: [],
      candlesParsed: [],
      averageBinary: [],
      averageParsed: [],
      firstEntry: 0,
      lastResolution: 0,
      biggerWindow: 0,
      start: null,
      end: null,
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
      firstPoints: {},
      resolutions: [],
      firstTimestamps: {},
      packetSize: 0,
      dataRequestPending: false,
      isInitialLoading: true,
      needDropData: false
    };
    this.requestInitialParams();
  }
  resetData () {
    Object.assign(this.data, {
      treeReady: false,
      candlesBinary: [],
      candlesParsed: [],
      averageBinary: [],
      averageParsed: [],
      biggerWindow: 0,
      firstEntry: 0,
      lastResolution: 0,
      start: null,
      end: null,
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
      firstPoints: {},
      firstTimestamps: {},
      resolutions: [],
      empty: false
    });
  }
  requestInitialParams () {
    this.sendMessage('REQUEST_PARAMS', {
      inner: ['candleWidths'],
      outer: ['fileSizes', 'firstPoints', 'resolutions', 'packetSize']
    });
  }
  initialLoading (resolution) {
    let end = this.params.fileSizes[resolution];
    let offset = 0;
    this.params.isInitialLoading = true;
    this.requestData(offset, end - 1, resolution);
  }
  rebaseOffset (offset, resolution) {
    let dataLength = this.params.fileSizes[resolution];
    if (offset < 0 || isNaN(offset)) {
      return 0
    } else if (offset > (dataLength - 1)) {
      return dataLength - 1;
    }
    return offset;
  }
  rebaseEnd (end, resolution) {
    if (end > this.params.fileSizes[resolution]) {
      return this.params.fileSizes[resolution];
    }
    return end;
  }
  append (data) {
    this.data.treeReady = false;
    this.params.dataRequestPending = false;
    this.appendedData = ['candleData'];
    this.data.candlesBinary = data.slice(0);
    this.data.candlesParsed.splice(0);
    if (this.params.needDropData) {
      // this.data.candlesParsed.splice(0);
      this.params.needDropData = false;
    }
    this.data.candlesParsed = this.data.candlesParsed.concat(this.parseChartData(this.data.candlesBinary)).sort((a, b) => {
      return a.timestamp - b.timestamp;
    });
    if (this.params.isInitialLoading === true) {
      this.appendedData.push('averageData');
      this.data.averageBinary = data.slice(0);
      this.data.averageParsed = this.data.candlesParsed.slice(0);
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
    if (this.data.candlesParsed.length > 0) {
      this.data.start = this.data.candlesParsed[0].timestamp;
      this.data.end = this.data.candlesParsed[this.data.candlesParsed.length - 1].timestamp;
      this.params.candleWidths.map((case_) => {
        this.data.tree[case_] = [];

        let lastCandle = null;

        this.data.candlesParsed.map((candle) => {
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
    let firstTimestamp = this.params.firstTimestamps[resolution] || ((new Date()).getTime() / 1e3 - this.params.fileSizes[resolution] / this.params.packetSize * resolution);
    let diff = offset - firstTimestamp;
    let convertedOffset = this.convertTimestampToPackage(diff, resolution);
    return this.rebaseOffset(convertedOffset, resolution);
  }
  convertEndToPackage (end, resolution) {
    let fileSize = this.params.fileSizes[resolution];
    let lastPointTimestamp = (this.params.firstTimestamps[resolution] + (fileSize - this.params.packetSize) / this.params.packetSize * resolution) || (new Date()).getTime() / 1e3;
    let convertedEnd = this.convertTimestampToPackage(lastPointTimestamp - end, resolution);
    return this.rebaseEnd(fileSize - convertedEnd, resolution);
  }
  computeSma (array, windowSize) {
    let window = windowSize || array.length;
    let result = [];
    for (let i = 0; i < array.length; i++) {
      if (i + 1 < window) {
        result.push(NaN);
      } else {
        result.push(this.average(array.slice(i + 1 - window, i + 1)));
      }
    }
    return result;
  }
  computeEma (array, windowSize) {
    let weight = 2 / (windowSize + 1);
    let ema = [this.average(array.slice(0, windowSize))];
    for (let i = 1; i < array.length; i++) {
      ema.push(array[i] * weight + ema[i - 1] * (1 - weight));
    }
    return ema;
  }
  computeStdev (array, windowSize) {
    let window = windowSize || array.length;
    let result = [];
    for (let i = 0; i < array.length; i++) {
      if (i + 1 < window) {
        result.push(NaN);
      } else {
        result.push(this.standardDeviation(array.slice(i + 1 - window, i + 1)));
      }
    }
    return result;
  }
  pointwise (fn, firstArray, secondArray) {
    let result = [];
    for (let i = 0, len = firstArray.length; i < len; i++) {
      result.push(fn(firstArray[i], secondArray[i]));
    }
    return result;
  }
  computeBolinger (array, window, mult = 2) {
    let middle = this.computeSma(array, window);
    let stddev = this.computeStdev(array, window);
    let upper = this.pointwise((a, b) => a + b * mult, middle, stddev);
    let lower = this.pointwise((a, b) => a - b * mult, middle, stddev);
    return {lower, upper};
  }
  average (arr) {
    return arr.reduce((sum, value) => sum + value, 0) / arr.length;
  }
  standardDeviation (values) {
    let average = this.average(values);

    let squareDiffs = values.map(value => {
      let diff = value - average;
      let sqrDiff = diff * diff;
      return sqrDiff;
    });
    let averageSquareDiff = this.average(squareDiffs);
    return Math.sqrt(averageSquareDiff);
  }
  computeIndicators (start, stop, array, indicators) {
    let result = {};
    for (let indicator in indicators) {
      if (!indicators[indicator].enabled) {
        continue;
      }
      result[indicator] = {
        params: indicators[indicator].params,
        type: indicators[indicator].type,
        dataByPoint: [],
        multiplyLinesData: {},
        indicatorsPath: '',
        data: []
      }
      switch (result[indicator].type) {
        case 'ema' : {
          let window = +indicators[indicator].values.window;
          result[indicator].data = this.computeEma(array.slice(0, stop), window);
          break;
        }
        case 'sma' : {
          let window = +indicators[indicator].values.window;
          result[indicator].data = this.computeSma(array.slice(0, stop), window);
          break;
        }
        case 'bolinger' : {
          let window = +indicators[indicator].values.window;
          result[indicator].data = this.computeBolinger(array.slice(0, stop), window);
          result[indicator].multiplyLinesData = { lower: [], upper: [] };
          break;
        }
        default: break;
      }
    }
    return result;
  }
  placeIndicatorsByPoint (indicators, start, stop, array, offset, factors) {
    for (let index = start; index < stop; index++) {
      let candle = array[index];
      let x = (candle.timestamp - offset) * factors.x;
      for (let indicator in indicators) {
        switch (indicators[indicator].type) {
          case 'ema' :
          case 'sma' : {
            let sma = indicators[indicator].data;
            let indicatorLength = sma.length;
            let indicatorDif = indicatorLength - (stop - start);
            let pointY = (factors.high - (sma[index - start + indicatorDif] || candle.close)) * factors.y;
            indicators[indicator].dataByPoint.push([x, pointY]);
            break;
          }
          case 'bolinger' : {
            for (let line in indicators[indicator].data) {
              let lineData = indicators[indicator].data[line];
              let indicatorLength = lineData.length;
              let indicatorDif = indicatorLength - (stop - start);
              let pointY = (factors.high - (lineData[index - start + indicatorDif] || candle.close)) * factors.y;
              indicators[indicator].multiplyLinesData[line].push([x, pointY]);
            }
            break;
          }
          default: break;
        }
      }
    }
    for (let indicator in indicators) {
      if (indicators[indicator].dataByPoint.length) {
        let draw = new SvgDraw(indicators[indicator].dataByPoint);
        indicators[indicator].indicatorsPath = draw.drawSvgPath();
      } else if (Object.keys(indicators[indicator].multiplyLinesData).length) {
        indicators[indicator].indicatorsPath = [];
        for (let line in indicators[indicator].multiplyLinesData) {
          let draw = new SvgDraw(indicators[indicator].multiplyLinesData[line]);
          indicators[indicator].indicatorsPath.push(draw.drawSvgPath());
        }
      }
      delete indicators[indicator].data;
      delete indicators[indicator].dataByPoint;
      delete indicators[indicator].type;
    }
    return indicators;
  }
  findBiggerWindow (indicators) {
    for (let indicator in indicators) {
      if (indicators[indicator].values.window && indicators[indicator].values.window > this.data.biggerWindow) {
        this.data.biggerWindow = indicators[indicator].values.window;
      }
    }
  }
  /**
   * @description Render candles objects
   * @param {Number} offset     - exposition offset
   * @param {Number} exposition - exposition width
   * @param {Number} viewWidth  - view box width
   */
  renderCandles (offset, exposition, viewWidth, viewHeight, indicators) {
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
      volumePath: [],
      indicators: {}
    };
    let theCase = this.findCandleWidthForUse(exposition, viewWidth);
    let koofX = viewWidth / exposition;
    result.width = theCase * koofX;
    let dataByCase = this.data.tree[theCase];
    this.findBiggerWindow(indicators);
    if (dataByCase && this.data.lastResolution === theCase) {
      let start = 0;
      let stop = dataByCase.length;
      if (offset > this.data.start) {
        start = -Math.floor((offset - this.data.start) / theCase);
      }

      for (let index = -start; index < stop; index++) {
        let candle = dataByCase[index];
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
        stop = dataByCase.length;
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
        let candle = dataByCase[index];
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
      this.renderIndicatorsAfterCandles(offset, exposition, indicators, viewWidth, viewHeight, {
        theCase: theCase,
        start: start,
        stop: stop,
        x: koofX,
        y: yFactor,
        high: result.high
      });
    }
    let resolution = this.findAvailableResolution(theCase);
    let additionalOffset = this.data.biggerWindow * 2 * resolution || this.params.defaultExposition;
    if (!this.params.isInitialLoading && offset > 1 && ((this.data.start + additionalOffset) > offset || this.data.end < (offset + exposition) || !dataByCase || this.data.lastResolution !== theCase)) {
      // let correctOffset = offset < this.data.end ? offset : this.data.end;
      // let correctEnd = (offset + exposition) > this.data.start ? (offset + exposition) : this.data.start;
      if (resolution) {
        this.requestData(
          this.convertOffsetToPackage(offset - additionalOffset, resolution),
          this.convertEndToPackage(offset + exposition, resolution) - 1,
          resolution
        );
      }
    }
    if (this.data.lastResolution !== theCase) {
      this.params.needDropData = true;
    }
    this.data.lastResolution = theCase;
    this.sendMessage('RENDERED', { type: 'candles', data: result });
  }
  renderIndicators (offset, exposition, indicators, viewWidth, viewHeight) {
    let result = {};
    let theCase = this.findCandleWidthForUse(exposition, viewWidth);
    let xFactor = viewWidth / exposition;
    let dataByCase = this.data.tree[theCase];
    let start = 0;
    let atLeastOneEnabled = false;
    if (Object.keys(indicators).length) {
      for (let item in indicators) {
        if (indicators[item].enabled) {
          atLeastOneEnabled = true;
          break;
        }
      }
    }
    if (dataByCase && atLeastOneEnabled) {
      let stop = dataByCase.length;
      let high = null;
      let low = null;
      if (offset > this.data.start) {
        start = -Math.floor((offset - this.data.start) / theCase);
      }

      for (let index = -start; index < stop; index++) {
        let candle = dataByCase[index];
        if (candle.timestamp <= offset) {
          continue;
        } else if (candle.timestamp > offset + exposition) {
          stop = index;
          break;
        } else if (start < 0) {
          start = index;
        }
        if ((low == null) || (low > candle.low)) {
          low = candle.low;
        }
        if ((high == null) || (high < candle.high)) {
          high = candle.high;
        }
      }

      start = Math.abs(start);
      if (stop == null) {
        stop = dataByCase.length;
      }
      let yFactor = 0;
      if (high !== low) {
        yFactor = viewHeight / (high - low);
      } else {
        yFactor = viewHeight / (high * 1.1 - low);
      }
      let close = dataByCase.map(value => value.close);
      let computedIndicators = this.computeIndicators(start, stop, close, indicators);
      result = this.placeIndicatorsByPoint(computedIndicators, start, stop, dataByCase, offset, {x: xFactor, y: yFactor, high: high});
    }
    this.sendMessage('RENDERED', {
      type: 'indicators',
      data: {
        indicators: result
      }
    });
  }
  renderIndicatorsAfterCandles (offset, exposition, indicators, viewWidth, viewHeight, factors) {
    let result = {};
    let dataByCase = this.data.tree[factors.theCase];
    let atLeastOneEnabled = false;
    if (Object.keys(indicators).length) {
      for (let item in indicators) {
        if (indicators[item].enabled) {
          atLeastOneEnabled = true;
          break;
        }
      }
    }
    if (dataByCase && atLeastOneEnabled) {
      let close = dataByCase.map(value => value.close);
      let computedIndicators = this.computeIndicators(factors.start, factors.stop, close, indicators);
      result = this.placeIndicatorsByPoint(
        computedIndicators,
        factors.start,
        factors.stop,
        dataByCase,
        offset,
        {x: factors.x, y: factors.y, high: factors.high}
        );
    }

    this.sendMessage('RENDERED', {
      type: 'indicators',
      data: {
        indicators: result
      }
    });
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
        candlesBinary: [],
        candlesParsed: [],
        firstEntry: 0,
        lastResolution: 0,
        start: null,
        width: null,
        tree: [],
        last: {
          offset: 0,
          end: 0,
          resolution: 0
        },
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
    // console.log('GET', message.data.task);
    switch (message.data.task) {
      case 'SET_PARAMS': {
        this.setParams(message.data.params);
        if (
          message.data.params.fileSizes && Object.keys(this.params.fileSizes).length > 0 &&
          this.params.resolutions.length > 0 &&
          this.params.fileSizes[this.params.resolutions[this.params.resolutions.length - 1]] > 0 &&
          this.params.packetSize && !this.params.dataRequestPending
        ) {
          if (this.params.firstPoints && Object.keys(this.params.firstPoints).length) {
            for(let interval in this.params.firstPoints) {
              this.params.firstTimestamps[interval] = this.parseEntity(this.params.firstPoints[interval]).timestamp;
            }
          }
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
            this.renderCandles(params.offset, params.exposition, params.viewWidth, params.viewHeight, params.indicators);
            break;
          }
          case 'indicators': {
            this.renderIndicators(params.offset, params.exposition, params.indicators, params.viewWidth, params.viewHeight);
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
    // console.log('SEND', type);
    postMessage({type, body});
  }
}

let worker = new BinaryDataWorker();

onmessage = (data) => {
  worker.messageHandler(data);
};
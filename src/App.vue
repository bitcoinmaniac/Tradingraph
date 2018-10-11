<template>
  <div class="tradingraph">
    <svg xmlns="http://www.w3.org/2000/svg" style="display:none">
      <symbol id="gear" viewBox="0 0 30 30">
        <path class="gear__candle-2" d="M26,26h-4V13c0-0.552,0.448-1,1-1h2c0.552,0,1,0.448,1,1V26z"/>
        <path class="gear__candle-1" d="M20,26h-4v-9c0-0.552,0.448-1,1-1h2c0.552,0,1,0.448,1,1V26z"/>
        <path class="gear__candle-2" d="M14,26h-4V15c0-0.552,0.448-1,1-1h2c0.552,0,1,0.448,1,1V26z"/>
        <path class="gear__candle-1" d="M8,26H4v-7c0-0.552,0.448-1,1-1h2c0.552,0,1,0.448,1,1V26z"/>
        <circle cx="24" cy="6" r="2"/><circle cx="18" cy="11" r="2"/><circle cx="12" cy="8" r="2"/><circle cx="6" cy="12" r="2"/>
        <polyline class="gear__line" points="  6,12 12,8 18,11 24,6 " style="fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;"/></symbol>
    </svg>

    <div>
      <div v-if="!isEmpty" class="menu">
        <button class="menu__button" @click="toogleMenu" title="Indicator">
          <svg width="22" height="22"><use xlink:href="#gear"></use></svg>
        </button>
      </div>
      <indicators v-show="isIndicatorsOpen" @indicatorChange="handleIndicatorChange"></indicators>
      <svg class="crypto-chart"
           :view-box.camel="[0, 0, width ? width : 0, height ? height : 0]"
           :width="width ? width : 0"
           :height="height ? height : 0"
           @mousedown.prevent="_onMixinMouse"
           @mousemove.prevent="_onMixinMouse"
           @mouseup.prevent="_onMixinMouse"
           @mouseleave.prevent="_onMixinMouse"
           @touchstart.prevent="_onMixinTouch"
           @touchmove.prevent="_onMixinTouch"
           @touchend.prevent="_onMixinTouch"
           @touchcancel.prevent="_onMixinTouch"
           :style="{cursor: interactive.cursor}"
           ref="chart"
      >
        <symbol id="indicators-path-symbol" :viewBox="`0 0 ${width - axisXOffset} ${chart.height}`">
          <indicators-render :indicatorData="indicatorDisplayableData"></indicators-render>
        </symbol>
        <symbol v-if="candles" id="candles-path-symbol" :viewBox="`0 0 ${width - axisXOffset} ${chart.height}`">
          <path class="candles-path-positive" :d="positiveCandlesPath"/>
          <path class="candles-path-negative" :d="negativeCandlesPath"/>
          <path class="candles-path-volume" :d="volumeCandlesPath"/>
          <g v-if="interactive.hoverCandle">
            <path class="candles-path-volume hover"
                  :d="candles.volumePath[interactive.hoverCandle.volumePathIndex]"/>
            <path v-if="interactive.hoverCandle.class == 'negative'" class="candles-path-negative hover"
                  :d="candles.candlesNegativePath[interactive.hoverCandle.candlePathIndex]"/>
            <path v-else-if="interactive.hoverCandle.class == 'positive'" class="candles-path-positive hover"
                  :d="candles.candlesPositivePath[interactive.hoverCandle.candlePathIndex]"/>
          </g>
        </symbol>
        <!--main chart group-->
        <g v-if="isLoading" name="loading">
          <!--<slot name="loading">-->
            <!--<text :y="30" :x="8" :font-size="14">Loading...</text>-->
          <!--</slot>-->
        </g>
        <g v-if="isEmpty">
          <text  :y="height / 2" :x="width / 2" style="text-anchor: middle; font-family: 'Roboto', monospace" :font-size="14">
            <slot name="noData">No data</slot>
          </text>
        </g>
        <g v-else-if="candles">
          <use xlink:href="#indicators-path-symbol" :y="offsets.chartTop" :width="width - axisXOffset" :height="chart.height"></use>
          <use xlink:href="#candles-path-symbol" :y="offsets.chartTop" :width="width - axisXOffset" :height="chart.height"></use>
          <g v-if="interactive.hoverCandle">
            <text :y="15" :x="8" style="text-anchor: start; font-family: 'Roboto', monospace" :font-size="interactiveTool.fontSize"
                  :style="hoverColor(interactive.hoverCandle.open, interactive.hoverCandle.close)">
              O: {{interactive.hoverCandle.open.toFixed(interactive.fraction.limit)}}
              H: {{interactive.hoverCandle.high.toFixed(interactive.fraction.limit)}}
              L: {{interactive.hoverCandle.low.toFixed(interactive.fraction.limit)}}
              C: {{interactive.hoverCandle.close.toFixed(interactive.fraction.limit)}}
              Vol: {{interactive.hoverCandle.volume.toFixed(interactive.fraction.nominal)}}
            </text>
          </g>
          <axis-y :candles="candles" :chart-height="chart.height" :chart-width="widths.axisY" :chart-offset="offsets.chartTop"
                  :fractionLimit="interactive.fraction.limit"/>
          <axis-x v-if="candles && candles.candles.length" :chart-height="chart.height" :chart-width="width" :time-parts="zoom.time_parts" :exposition="exposition"
                  :offset="interval.offset" :dpi="dpi" :candleWidth="candles && candles.width || 3" :chart-offset="offsets.chartBottom"
                  :transform="`scale(${(width - axisXOffset) / width} 1)`"/>
          <crosshair :chart-height="chart.height" :chart-width="widths.crosshair" :fractionLimit="interactive.fraction.limit"
                     :chart-offset="offsets.chartTop" :candles="candles" :interactive="interactive" />
        </g>
      </svg>
    </div>
    <navigator :width="widths.navigator" :average="average" :offset="interval.offset" :exposition="exposition"
               :wholeInterval="interval.width" @handler="onHandle" :minZoom="minZoom" :maxZoom="maxZoom"/>
  </div>
</template>

<script>
  import cloneDeep from 'lodash.clonedeep';
  import MixinScreen from './mixins/screen';
  import MixinEventsMouse from './mixins/events-mouse';
  import MixinEventsTouche from './mixins/events-touch';
  import MixinEventsWheel from './mixins/events-wheel';
  import MixinFilters from './mixins/filters';
  import MixinProps from './mixins/props';
  import MixinWorkers from './mixins/BinaryWorker';
  import MixinOptions from './mixins/options';

  import AxisX from "./components/Axis/AxisX";
  import AxisY from "./components/Axis/AxisY";
  import Crosshair from "./components/Intercative/Crosshair";
  import Navigator from "./components/Navigator/Navigator";
  import Indicators from "./components/Indicators/Indicators"
  import IndicatorsRender from "./components/Indicators/IndicatorsRender";

  export default {
    name: 'crypto-chart',
    mixins: [
      MixinScreen,
      MixinProps,
      MixinEventsMouse,
      MixinEventsTouche,
      MixinEventsWheel,
      MixinFilters,
      MixinWorkers,
      MixinOptions
    ],
    components: {
      AxisX,
      AxisY,
      Crosshair,
      Navigator,
      Indicators,
      IndicatorsRender
    },
    data() {
      return {
        chartData: this.data,
        candles: null,
        isEmpty: false,
        isLoading: false,
        average: [],
        isIndicatorsOpen: false,
        interactive: {
          cursor: 'default',
          hoverCandle: null,
          cursorX: 0,
          cursorY: 0,
          isHover: false,
          fraction: {
            limit: 4,
            nominal: 4
          }
        },
        indicators: {},
        indicatorDisplayableData: [],
        interactiveTool: {
          fontSize: 10
        }
      };
    },
    computed: {
      positiveCandlesPath() {
        let result = this.candles.candlesPositivePath;
        if (this.interactive.hoverCandle && this.interactive.hoverCandle.class === 'positive') {
          result = cloneDeep(result);
          result.splice(this.interactive.hoverCandle.candlePathIndex, 1);
        }
        return result.join(' ');
      },
      negativeCandlesPath() {
        let result = this.candles.candlesNegativePath;
        if (this.interactive.hoverCandle && this.interactive.hoverCandle.class === 'negative') {
          result = cloneDeep(result);
          result.splice(this.interactive.hoverCandle.candlePathIndex, 1);
        }
        return result.join(' ');
      },
      volumeCandlesPath() {
        let result = this.candles.volumePath;
        if (this.interactive.hoverCandle) {
          result = result.slice();
          result.splice(this.interactive.hoverCandle.volumePathIndex, 1);
        }
        return result.join(' ');
      },
      fontSizeAxisY() {
        return this.fontHeight < (this.chart.offset.left / 6) ? this.chart.offset.left / 6 : this.fontHeight;
      },
      fontSizeAxisX() {
        return this.fontHeight > (this.clientWidth / 16) ? this.clientWidth / 16 : this.fontHeight;
      }
    },
    watch: {
      settings: {
        handler () {
          if (this.settings.interactiveTool && this.settings.interactiveTool.fraction) {
            Object.assign(this.interactive.fraction, this.settings.interactiveTool.fraction);
          }
          if (this.settings.interactiveTool && this.settings.interactiveTool.fontSize) {
            this.interactiveTool.fontSize = this.settings.interactiveTool.fontSize;
          }
        },
        deep: true
      },
      'eventsMouse.scrolling.isScrolling' (value) {
        this.interactive.cursor = value ? 'grabbing' : 'default';
      },
      'eventsMouse.scrolling.isHover' (value) {
        this.interactive.isHover = value;
      },
      reloadCounter () {
        this.indicatorDisplayableData = [];
      }
    },
    created () {
      if (this.settings.interactiveTool && this.settings.interactiveTool.fraction) {
        Object.assign(this.interactive.fraction, this.settings.interactiveTool.fraction);
      }
      if (this.settings.interactiveTool && this.settings.interactiveTool.fontSize) {
        this.interactiveTool.fontSize = this.settings.interactiveTool.fontSize;
      }
    },
    methods: {
      handleIndicatorChange (value) {
        this.indicators = value;
        for (let worker in this.workers) {
          this.workers[worker].redraw();
        }
      },
      onRedraw() {
        for (let worker in this.workers) {
          this.workers[worker].redraw();
        }
      },
      onClick (params) {
        this.interactive.cursorX = params.x;
        this.interactive.cursorY = params.y;
        this.findHoverCandle();
      },
      onHover(params) {
        this.interactive.cursorX = params.x;
        this.interactive.cursorY = params.y;
        this.findHoverCandle();
      },
      findHoverCandle() {
        if (this.candles) {
          this.candles.candles.map((candle) => {
            if ((this.interactive.cursorX >= candle.x - this.candles.width * 0.25) && (this.interactive.cursorX <= candle.x + this.candles.width * 0.25)) {
              this.interactive.hoverCandle = candle;
            }
          });
        }
      },
      hoverColor (open, close) {
        return `fill: ${open > close ? 'rgba(211, 47, 47, 0.8)' : 'rgba(104, 159, 56, 0.8)'}`;
      },
      toogleMenu () {
        this.isIndicatorsOpen = !this.isIndicatorsOpen;
      }
    }
  };
</script>

<style lang="scss">
  .gear {
    &__candle-2 {
      fill: darkred;
    }
    &__candle-1 {
      fill: darkgreen;
    }
    &__line {
      stroke: darkblue;
    }
  }
  .tradingraph {
    position: relative;
  }
  .menu {
    position: absolute;
    top: 24px;
    left: 8px;
    &__button {
      &:hover {
        transform: scale(1.1);
      }
      display: flex;
      flex-direction: row;
      padding: 1px;
      background: rgba(255,255,255,0.95);
      border: 1px solid lightgray;
      border-radius: 4px;
    }
  }
  .indicators {
    position: absolute;
    display: flex;
    flex-direction: column;
    background: white;
    margin: 0 8px;
    border: none;
    border-radius: 4px;
    box-shadow: 0 0 4px gray;
    font-size: 12px;
    padding: 8px;
  }
  .crypto-chart {
    .axis-y, .axis-x, .axis-border {
      shape-rendering: crispEdges;
      stroke: #000;
      stroke-width: 1px;
      fill: none;
    }

    .candle {
      stroke-width: 1px;
    }

    .candles-path-volume {
      stroke: rgba(21, 101, 192, 0.16);
      fill: rgba(21, 101, 192, 0.16);
    }

    .candles-path-volume.hover {
      stroke: rgba(21, 101, 192, 0.16);
      fill: rgba(21, 101, 192, 0.16);
    }

    .candles-path-positive {
      stroke: rgba(104, 159, 56, 1);
      fill: rgba(104, 159, 56, 1);
    }

    .candles-path-positive.hover {
      stroke: rgba(104, 230, 56, 0.8);
      fill: rgba(104, 230, 56, 0.8);
    }

    .candles-path-negative {
      stroke: rgba(211, 47, 47, 1);
      fill: rgba(211, 47, 47, 1);
    }

    .candles-path-negative.hover {
      stroke: rgba(230, 47, 47, 1);
      fill: rgba(255, 60, 60, 1);
    }

  }

</style>

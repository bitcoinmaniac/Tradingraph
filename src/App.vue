<template>
  <div>
    <div>
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
        <!--main chart group-->
        <g v-if="!isEmpty">
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
          <g v-if="candles" :transform="`translate(0, ${this.offsets.chartTop})`">
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
          </g>
          <axis-y :candles="candles" :chart-height="chart.height" :chart-width="chart.width" :chart-offset="offsets.chartTop"
                  :fractionLimit="interactive.fraction.limit"/>
          <axis-x :chart-height="chart.height" :chart-width="chart.width" :time-parts="zoom.time_parts" :exposition="exposition"
                  :offset="interval.offset" :dpi="dpi" :candleWidth="candles && candles.width || 3" :chart-offset="offsets.chartBottom"/>
          <crosshair :chart-height="chart.height" :chart-width="chart.width" :fractionLimit="interactive.fraction.limit"
                     :chart-offset="offsets.chartTop" :candles="candles" :interactive="interactive" />
        </g>
        <g v-else>
          <text  :y="height / 2" :x="width / 2" style="text-anchor: start; font-family: 'Roboto', monospace" :font-size="14">
            <slot name="noData">No data</slot>
          </text>
        </g>
      </svg>
    </div>
    <navigator :width="width" :average="average" :offset="interval.offset" :exposition="exposition"
               @handler="onHandle" :minZoom="minZoom" :maxZoom="maxZoom"/>
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
  // import MixinWorkers from './mixins/workers';
  import MixinWorkers from './mixins/BinaryWorker';
  import MixinOptions from './mixins/options';

  import AxisX from "./components/Axis/AxisX";
  import AxisY from "./components/Axis/AxisY";
  import Crosshair from "./components/Intercative/Crosshair"
  import Navigator from "./components/Navigator/Navigator"

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
      Navigator
    },
    data() {
      return {
        chartData: this.data,
        candles: null,
        isEmpty: false,
        average: [],
        interactive: {
          cursor: 'default',
          hoverCandle: null,
          cursorX: 0,
          cursorY: 0,
          fraction: {
            limit: 4,
            nominal: 4
          }
        },
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
      }
    }
  };
</script>

<style lang="scss">

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

    .cross {
      fill: none;
      stroke: rgb(51, 51, 51);
      stroke-width: 1;
      stroke-dasharray: 1, 3;
      visibility: visible;
    }

    .price-label {
      path {
        fill: #440000;
        stroke: #440000;
        opacity: 0.5;
      }
      text {
        stroke: none;
        fill: #fff;
        text-anchor: end;
      }
    }

    .moment-label {
      path {
        fill: #333;
        stroke: #333;
        opacity: 0.5;
      }
      text {
        stroke: none;
        fill: #fff;
        text-anchor: middle;
      }
    }

  }

</style>

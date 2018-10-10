<template>
  <div>
    <svg xmlns="http://www.w3.org/2000/svg" style="display:none">
      <symbol id="gear" viewBox="0 0 13 13">
        <path d="M8.224,965.559H4.988l-.265-1.486a1.064,1.064,0,0,1-.424-.212l-1.22.9L.8,962.482l.9-1.22a1.067,1.067,0,0,0-.212-.424L0,960.572v-3.237l1.486-.265c.053-.159.106-.265.159-.424l-.9-1.22,2.282-2.281,1.22.9a3.681,3.681,0,0,0,.424-.159l.212-1.486H8.118l.212,1.486a3.636,3.636,0,0,1,.424.159l1.22-.9,2.282,2.281-.9,1.22a3.654,3.654,0,0,0,.159.424l1.486.212v3.237l-1.486.212a1.885,1.885,0,0,1-.212.478l.9,1.22L9.922,964.71l-1.22-.9a1.066,1.066,0,0,0-.424.212ZM5.89,964.5H7.322l.212-1.273.318-.106a4.112,4.112,0,0,0,.849-.371l.318-.159,1.008.743,1.008-1.008-.743-1.008.159-.318a3.247,3.247,0,0,0,.371-.9l.106-.318,1.22-.159v-1.433l-1.22-.159-.106-.318a4.105,4.105,0,0,0-.371-.849l-.159-.265.743-1.008-1.008-1.008-1.008.743-.265-.159a5.892,5.892,0,0,0-.849-.371l-.318-.106-.159-1.22H6l-.159,1.22-.318.106a4.105,4.105,0,0,0-.849.371l-.265.159-1.22-.743-1.008,1.008.743,1.008-.159.265a2.344,2.344,0,0,0-.318.849l-.106.318-1.273.212v1.433l1.273.212.106.318a4.109,4.109,0,0,0,.371.849l.159.318-.743,1.008,1.008,1.008,1.008-.743.318.159a5.892,5.892,0,0,0,.849.372l.318.106Zm.69-1.963a3.555,3.555,0,1,1,3.555-3.555A3.555,3.555,0,0,1,6.58,962.535Zm0-6.049a2.494,2.494,0,1,0,2.494,2.494A2.491,2.491,0,0,0,6.58,956.486Z" transform="translate(0 -952.4)"/>
      </symbol>
    </svg>

    <div>
      <div class="menu">
        <button class="menu__button" @click="toogleMenu"> Indicators </button>
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
        <!--main chart group-->
        <g v-if="isLoading" name="loading">
          <slot name="loading">
            <text :y="30" :x="8" :font-size="14">Loading...</text>
          </slot>
        </g>
        <g v-if="isEmpty">
          <text  :y="height / 2" :x="width / 2" style="text-anchor: middle; font-family: 'Roboto', monospace" :font-size="14">
            <slot name="noData">No data</slot>
          </text>
        </g>
        <g v-else-if="candles">
          <g v-if="interactive.hoverCandle">
            <text :y="15" :x="8" style="text-anchor: start; font-family: 'Roboto', monospace" :font-size="interactiveTool.fontSize"
                  :style="hoverColor(interactive.hoverCandle.open, interactive.hoverCandle.close)">
              Os: {{interactive.hoverCandle.open.toFixed(interactive.fraction.limit)}}
              H: {{interactive.hoverCandle.high.toFixed(interactive.fraction.limit)}}
              L: {{interactive.hoverCandle.low.toFixed(interactive.fraction.limit)}}
              C: {{interactive.hoverCandle.close.toFixed(interactive.fraction.limit)}}
              Vol: {{interactive.hoverCandle.volume.toFixed(interactive.fraction.nominal)}}
            </text>
          </g>
          <g :transform="`translate(0, ${this.offsets.chartTop})`">
            <path class="candles-path-positive" :d="positiveCandlesPath"/>
            <path class="candles-path-negative" :d="negativeCandlesPath"/>
            <path class="candles-path-volume" :d="volumeCandlesPath"/>
            <indicators-render :indicatorData="indicatorDisplayableData"></indicators-render>
            <g v-if="interactive.hoverCandle">
              <path class="candles-path-volume hover"
                    :d="candles.volumePath[interactive.hoverCandle.volumePathIndex]"/>
              <path v-if="interactive.hoverCandle.class == 'negative'" class="candles-path-negative hover"
                    :d="candles.candlesNegativePath[interactive.hoverCandle.candlePathIndex]"/>
              <path v-else-if="interactive.hoverCandle.class == 'positive'" class="candles-path-positive hover"
                    :d="candles.candlesPositivePath[interactive.hoverCandle.candlePathIndex]"/>
            </g>
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
  .menu {
    margin: 8px;
    position: relative;
    &__button {
      background: none;
      border: none;
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

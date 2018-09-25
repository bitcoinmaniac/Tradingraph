<template>
  <g v-if="interactive.hoverCandle" :transform="`translate(0, ${chartOffset})`">
    <path class="cross" :d="crossPath"/>
    <g class="price-label" :transform="`translate(${chartWidth}, ${realY})`">
      <path d="M-70 -10 L0 -10 L0 0 L0 10 L-70 10"/>
      <text x="-6" :y="4" :font-size="10" style="font-family: 'Roboto', monospace">{{currentPrice | price(fractionLimit)}}</text>
    </g>
    <g class="moment-label" :transform="`translate(${interactive.cursorX}, ${chartHeight})`">
      <path d="M-50 0 L50 0 L50 24 L-50 24"/>
      <text :y="15" :font-size="10" style="font-family: 'Roboto', monospace">{{interactive.hoverCandle.timestamp | moment}}
      </text>
    </g>
  </g>
</template>

<script>
  import Filters from '../../mixins/filters';
  export default {
    name: 'chart-interactive-crosshair',
    mixins: [Filters],
    props: {
      chartHeight: {
        type: Number,
        required: true
      },
      chartWidth: {
        type: Number,
        required: true
      },
      chartOffset: {
        type: Number,
        required: true
      },
      candles: {
        required: true
      },
      interactive: {
        required: true
      },
      fractionLimit: {
        type: Number,
        required: false,
        default: 4
      }
    },
    computed: {
      realY () {
        return (this.interactive.cursorY + this.chartOffset);
      },
      crossPath() {
        if (!this.interactive.hoverCandle) {
          return '';
        }
        let x = this.interactive.hoverCandle.x;
        return `M${x} 0 L${x} ${this.chartHeight} M0 ${this.realY} L${this.chartWidth} ${this.realY} `;
      },
      currentPrice() {
        return this.candles.low + (this.candles.high - this.candles.low) * (this.chartHeight - this.realY) / this.chartHeight;
      }
    }
  };
</script>

<style scoped>

</style>
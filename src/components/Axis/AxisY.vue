<template>
  <g v-if="axisY.length">
    <g v-for="(price, index) in axisY" :transform="`translate(0, ${price.y + chartOffset})`" :key="index">
      <line x1="0" :x2="chartWidth - 70" class="axis-x" stroke-opacity="0.1"></line>
      <line :x1="chartWidth - 70" :x2="chartWidth" class="axis-x" stroke-opacity="0.08" stroke-dasharray="2"></line>
      <text :x="chartWidth - 5" y="-4" font-size="10" text-anchor='end' style="font-family: 'Roboto', monospace"> {{price.price | price(fractionLimit)}} </text>
    </g>
    <line :x1="chartWidth - 70" :x2="chartWidth - 70" :y1="chartOffset" :y2="chartHeight + chartOffset" class="axis-x" stroke-opacity="0.1"></line>
  </g>
</template>

<script>
  import Filters from '../../mixins/filters';
  export default {
    name: 'chart-axis-y',
    mixins: [Filters],
    props: {
      candles: {
        required: true
      },
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
      fractionLimit: {
        type: Number,
        required: false,
        default: 4
      }
    },
    computed: {
      axisY() {
        if (!this.candles) {
          return [];
        }
        let height = this.chartHeight;
        let stepY = height / 8;
        let stepPrice = (this.candles.high - this.candles.low) / 8;
        let result = [];

        for (let f = 0, y = height, price = this.candles.low;
             f < 9;
             y -= stepY, price += stepPrice, f++) {
          result.push({
            y: y,
            price: price
          });
        }
        return result;
      }
    }
  };
</script>

<style scoped>

</style>
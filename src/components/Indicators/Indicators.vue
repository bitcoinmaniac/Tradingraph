<template>
  <table class="indicators">
    <tr v-for="(indicator, index) in indicators" style="display: flex; flex-direction: row" :key="index">
      <td class="indicators__checkbox">
        <input type="checkbox" v-model="indicator.enabled"/>
      </td>
      <td class="indicators__name" :class="{'indicators__name--disabled': !indicator.enabled}" :style="{color: indicator.params.color}">{{indicator.name}}</td>
      <td>
        <input v-for="(input, key) in indicator.values" class="indicators__number-input"
               type="number" :disabled="!indicator.enabled"
               v-model="indicator.values[key]" :key="key"/>
      </td>
    </tr>
  </table>
</template>

<script>
export default {
  name: 'IndicatorsLogic',
  data () {
    return {
      indicators: {
        'Sma1': {
          name: 'Sma 1',
          type: 'sma',
          enabled: true,
          params: {
            color: '#595cac'
          },
          values: {
            window: 7
          },
          data: []
        },
        'Sma2': {
          name: 'Sma 2',
          type: 'sma',
          enabled: true,
          params: {
            color: '#8aa2ac'
          },
          values: {
            window: 14
          },
          data: []
        },
        'Ema1': {
          name: 'Ema 1',
          type: 'ema',
          enabled: false,
          params: {
            color: '#87ac73'
          },
          values: {
            window: 7
          },
          data: []
        },
        'Ema2': {
          name: 'Ema 2',
          type: 'ema',
          enabled: false,
          params: {
            color: '#5caca4'
          },
          values: {
            window: 14
          },
          data: []
        }
      },
    }
  },
  created () {
    this.$emit('indicatorChange', this.indicators);
  },
  watch: {
    indicators: {
      handler () {
        this.$emit('indicatorChange', this.indicators);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style scoped lang="scss">
  .indicators {
    background: rgba(255,255,255,0.9);
    position: absolute;
    top: 24px;
    left: 24px;
    transition: all .5s ease;
    &__name {
      width: 4rem;
      &--disabled {
        color: gray;
      }
    }
    &__number-input {
      width: 2rem;
    }
  }
</style>
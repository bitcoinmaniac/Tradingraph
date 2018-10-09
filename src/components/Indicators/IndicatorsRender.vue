<template>
  <g>
    <g v-for="indicator in indicatorData">
      <path v-if="typeof indicator.indicatorsPath === 'string'"
            fill="transparent" :stroke="indicator.params.color"
            :d="indicator.indicatorsPath"/>
      <path v-else-if="typeof indicator.indicatorsPath === 'object'"
            v-for="(subLine) in indicator.indicatorsPath"
            fill="transparent" :stroke="indicator.params.color"
            :d="subLine"/>
    </g>
  </g>
</template>

<script>
  export default {
    name: 'IndicatorsRender',
    props: {
      indicatorData: {
        type: Array,
        required: true
      }
    }
  };
</script>

<style scoped>

</style>
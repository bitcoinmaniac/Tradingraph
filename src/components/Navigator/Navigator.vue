<template>
  <svg :view-box.camel="[0, 0, width, height]"
       @mousedown.prevent="_onMixinMouse"
       @mousemove.prevent="_onMixinMouse"
       @mouseup.prevent="_onMixinMouse"
       @mouseleave.prevent="_onMixinMouse">
    <line x1="0" :x2="width" stroke="black" opacity="0.3"/>
    <g>
      <path class="candles-path-volume" fill="transparent" stroke="rgba(21,101,192,0.8)" :d="navigatorPath"/>
    </g>
    <g>
      <path fill="rgba(21,101,192,0.8)" :d="left"/>
      <path fill="rgba(21,101,192,0.1)" :d="center"></path>
      <path fill="rgba(21,101,192,0.8)" :d="right"/>
    </g>
    <line x1="0" :x2="width" :y1="height" :y2="height" stroke="black" opacity="0.3"/>
  </svg>
</template>

<script>
  import MouseEvents from '../../mixins/events-mouse';
  export default {
    name: 'chart-navigator',
    mixins: [MouseEvents],
    props: {
      width: {
        type: Number,
        required: true
      },
      height: {
        type: Number,
        required: false,
        default: 50
      },
      average: {
        required: true
      },
      offset: {
        type: Number,
        required: true
      },
      exposition: {
        type: Number,
        required: true
      }
    },
    data () {
      return {
        handleWidth: 6,
        lastHandle: null,
        HANDLES: {
          LEFT: 0,
          CENTER: 1,
          RIGHT: 2
        }
      }
    },
    computed: {
      navigatorPath () {
        return this.average.path && this.average.path.join() || '';
      },
      xMultiplier () {
        return this.width / (this.average.maxTimestamp - this.average.minTimestamp);
      },
      leftX () {
        return (this.offset - this.average.minTimestamp) * this.xMultiplier
      },
      rightX () {
        return (this.offset + this.exposition - this.average.minTimestamp) * this.xMultiplier
      },
      left () {
        return `M${this.leftX} 0, L${this.leftX - this.handleWidth} 0,
                L${this.leftX - this.handleWidth} ${this.height}, L${this.leftX} ${this.height}`
      },
      center () {
        return `M${this.leftX} 0, L${this.rightX} 0, L${this.rightX} ${this.height}, L${this.leftX} ${this.height}`
      },
      right () {
        return `M${this.rightX - this.handleWidth} 0, L${this.rightX} 0,
                L${this.rightX} ${this.height}, L${this.rightX - this.handleWidth} ${this.height}`
      }
    },
    watch: {
      'eventsMouse.scrolling.isScrolling' () {
        this.lastHandle = null;
      }
    },
    methods: {
      onSwipe (bla, event) {
        let offset = this.offset - (this.eventsMouse.scrolling.layerX - event.layerX) / this.xMultiplier;
        offset = (offset + this.exposition) > this.average.maxTimestamp ? (this.average.maxTimestamp - this.exposition) : offset;
        offset = (offset - this.handleWidth / this.xMultiplier) < this.average.minTimestamp ?
                 (this.average.minTimestamp + this.handleWidth / this.xMultiplier) : offset;
        if (this.lastHandle !== this.HANDLES.CENTER && this.lastHandle !== this.HANDLES.RIGHT &&
            this.eventsMouse.scrolling.layerX - this.leftX >= 0 &&
            this.eventsMouse.scrolling.layerX - this.leftX <= this.handleWidth + 2 ||
            this.lastHandle === this.HANDLES.LEFT) {
          this.lastHandle = this.HANDLES.LEFT;
          this.$emit('handler', offset, 'left');
        } else if (this.lastHandle !== this.HANDLES.LEFT && this.lastHandle !== this.HANDLES.CENTER &&
            this.eventsMouse.scrolling.layerX - this.rightX >= 0 &&
            this.eventsMouse.scrolling.layerX - this.rightX <= this.handleWidth + 2 ||
            this.lastHandle === this.HANDLES.RIGHT) {
          this.lastHandle = this.HANDLES.RIGHT;
          this.$emit('handler', offset, 'right');
        } else if (this.lastHandle !== this.HANDLES.LEFT && this.lastHandle !== this.HANDLES.RIGHT &&
            this.eventsMouse.scrolling.layerX - this.leftX >= this.handleWidth &&
            this.eventsMouse.scrolling.layerX - this.rightX <= this.handleWidth ||
            this.lastHandle === this.HANDLES.CENTER) {
          this.lastHandle = this.HANDLES.CENTER;
          this.$emit('handler', offset, 'center');
        } else {
          this.lastHandle = null;
        }
        this.eventsMouse.scrolling.layerX = event.layerX;
      }
    }
  };
</script>

<style scoped>

</style>
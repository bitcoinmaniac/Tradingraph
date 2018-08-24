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
      <path fill="rgba(21,101,192,0.8)" :class="{'please-stop-handle': expositionLimitLeft}" :d="left"/>
      <path fill="rgba(21,101,192,0.1)" :class="{'please-stop-center': expositionLimit}" :d="center"></path>
      <path fill="rgba(21,101,192,0.8)" :class="{'please-stop-handle': expositionLimitRight}" :d="right"/>
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
      },
      minZoom: {
        type: Number,
        required: false,
        default: 86400
      },
      maxZoom: {
        type: Number,
        required: false,
        default: 86400 * 365
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
        },
        fixed: {
          left: 10,
          right: 10
        },
        startCenterDiff: 0,
        startExposition: 0,
        expositionLimit: false,
        expositionLimitLeft: false,
        expositionLimitRight: false
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
        if (this.eventsMouse.scrolling.isScrolling) {
          return this.fixed.left;
        } else {
          this.fixed.left = (this.offset - this.average.minTimestamp) * this.xMultiplier;
          return this.fixed.left;
        }
      },
      rightX () {
        if (this.eventsMouse.scrolling.isScrolling) {
          return this.fixed.right;
        } else {
          this.fixed.right = (this.offset + this.exposition - this.average.minTimestamp) * this.xMultiplier;
          return this.fixed.right;
        }
      },
      left () {
        return `M${this.leftX} 0, L${this.leftX - this.handleWidth} 0,
                L${this.leftX - this.handleWidth} ${this.height}, L${this.leftX} ${this.height}`;
      },
      center () {
        return `M${this.leftX} 0, L${this.rightX} 0, L${this.rightX} ${this.height}, L${this.leftX} ${this.height}`;
      },
      right () {
        return `M${this.rightX - this.handleWidth} 0, L${this.rightX} 0,
                L${this.rightX} ${this.height}, L${this.rightX - this.handleWidth} ${this.height}`;
      },
      isRightHandle () {
        return this.lastHandle !== this.HANDLES.CENTER && this.lastHandle !== this.HANDLES.RIGHT &&
          this.eventsMouse.scrolling.layerX - this.leftX >= -2 &&
          this.eventsMouse.scrolling.layerX - this.leftX <= this.handleWidth + 2 ||
          this.lastHandle === this.HANDLES.LEFT;
      },
      isLeftHandle () {
        return this.lastHandle !== this.HANDLES.LEFT && this.lastHandle !== this.HANDLES.CENTER &&
          this.eventsMouse.scrolling.layerX - this.rightX >= -2 &&
          this.eventsMouse.scrolling.layerX - this.rightX <= this.handleWidth + 2 ||
          this.lastHandle === this.HANDLES.RIGHT
      },
      isCenterHandle () {
        return this.lastHandle !== this.HANDLES.LEFT && this.lastHandle !== this.HANDLES.RIGHT &&
          this.eventsMouse.scrolling.layerX - this.leftX >= this.handleWidth &&
          this.eventsMouse.scrolling.layerX - this.rightX <= this.handleWidth ||
          this.lastHandle === this.HANDLES.CENTER;
      }
    },
    watch: {
      'eventsMouse.scrolling.isScrolling' () {
        this.lastHandle = null;
        this.expositionLimit = false;
        this.expositionLimitRight = false;
        this.expositionLimitLeft = false;
      }
    },
    methods: {
      onSwipe (notInteresting, event) {
        if (this.isRightHandle) {
          this.lastHandle = this.HANDLES.LEFT;
          let offset = this.checkForLeftEdge(this.computeOffset());
          let exposition = (this.rightX - event.layerX) / this.xMultiplier;
          if (this.isExpositionValid(exposition)) {
            this.expositionLimitLeft = false;
            this.fixed.left = event.layerX;
            this.$emit('handler', {offset, exposition}, 'left');
          } else {
            this.expositionLimitLeft = true;
          }
        } else if (this.isLeftHandle) {
          this.lastHandle = this.HANDLES.RIGHT;
          let offset = this.average.minTimestamp + this.leftX / this.xMultiplier;
          let exposition = this.checkForRightEdge(this.computeOffset() - offset);
          if (this.isExpositionValid(exposition)) {
            this.expositionLimitRight = false;
            this.fixed.right = event.layerX;
            this.$emit('handler', {offset, exposition}, 'right');
          } else {
            this.expositionLimitRight = true;
          }
        } else if (this.isCenterHandle) {
          if (!this.lastHandle) {
            this.startCenterDiff = this.leftX - event.layerX;
            this.startExposition = this.fixed.right - this.fixed.left;
          }
          this.fixed.left = event.layerX + this.startCenterDiff;
          this.fixed.right = this.fixed.left + this.startExposition;
          let offset = this.computeOffset(this.startCenterDiff);
          offset = this.checkForRightEdge(offset);
          offset = this.checkForLeftEdge(offset);
          this.lastHandle = this.HANDLES.CENTER;
          this.$emit('handler', {offset}, 'center');
        } else {
          this.lastHandle = null;
        }
        this.eventsMouse.scrolling.layerX = event.layerX;
      },
      computeOffset (additional = 0) {
        return this.average.minTimestamp + (event.layerX + additional) / this.xMultiplier;
      },
      checkForRightEdge (offset) {
        return (offset + this.exposition) > this.average.maxTimestamp ? (this.average.maxTimestamp - this.exposition) : offset;
      },
      checkForLeftEdge (offset) {
        return (offset - this.handleWidth / this.xMultiplier) < this.average.minTimestamp ?
          (this.average.minTimestamp + this.handleWidth / this.xMultiplier) : offset;
      },
      isExpositionValid (exposition) {
        this.expositionLimitLeft = false;
        this.expositionLimitRight = false;
        this.expositionLimit = !(exposition > this.minZoom && exposition < this.maxZoom);
        return !this.expositionLimit;
      }
    },
  };
</script>

<style scoped>
  .please-stop-center {
    fill: rgba(192,11,101,0.1);
  }
  .please-stop-handle {
    fill: rgba(192,11,101,0.8);
  }
</style>
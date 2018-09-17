<template>
  <svg :view-box.camel="[0, 0, width ? width : 0, height ? height : 0]"
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
       :style="[grabStyle]"
  >
    <line x1="0" :x2="width" stroke="black" opacity="0.3"/>
    <g :transform="navigatotScale">
      <g :transform="navigatorPathScale">
        <path fill="transparent" stroke="rgba(21,101,192,0.8)" :d="navigatorPath"/>
      </g>
      <g v-if="this.average && this.average.minTimestamp > 0">
        <path fill="rgba(21,101,192,0.8)" stroke="1" :class="{'please-stop-handle': expositionLimitLeft}" :d="left"/>
        <path fill="rgba(21,101,192,0.1)" stroke="1" :class="{'please-stop-center': expositionLimit}" :d="center"></path>
        <path fill="rgba(21,101,192,0.8)" stroke="1" :class="{'please-stop-handle': expositionLimitRight}" :d="right"/>
      </g>
    </g>
    <line x1="0" :x2="width" :y1="height" :y2="height" stroke="black" opacity="0.3"/>
  </svg>
</template>

<script>
  import MouseEvents from '../../mixins/events-mouse';
  import TouchEvents from '../../mixins/events-touch';
  export default {
    name: 'chart-navigator',
    mixins: [MouseEvents, TouchEvents],
    props: {
      height: {
        type: Number,
        required: false,
        default: 50
      },
      average: {
        required: true,
        default: {
          average: [],
          minTimestamp: 0
        }
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
        required: false
      },
      maxZoom: {
        type: Number,
        required: false
      },
      width: {
        type: Number,
        required: false
      },
      wholeInterval: {
        type: Number,
        required: true
      }
    },
    data () {
      return {
        yIndent: 3,
        handleWidth: 8,
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
        startLeftDiff: 0,
        startExposition: 0,
        expositionLimit: false,
        expositionLimitLeft: false,
        expositionLimitRight: false,
        grabStyle: {cursor: 'default'}
      }
    },
    computed: {
      workAreaCoef () {
        return (this.width - 2 * this.handleWidth) / this.width;
      },
      navigatotScale () {
        if (this.width) {
          return `translate(${this.handleWidth}) scale(${this.workAreaCoef})`;
        } else {
          return `translate(${this.handleWidth})`;
        }
      },
      navigatorPathScale () {
        return `translate(0, ${this.yIndent}) scale(1, ${(this.height - 2 * this.yIndent) / this.height})`;
      },
      navigatorPath () {
        return this.average.path && this.average.path.join(' ') || '';
      },
      xMultiplier () {
        if (this.width && this.average.minTimestamp) {
          return (this.width) / (this.wholeInterval - this.average.minTimestamp);
        } else {
          return 1;
        }
      },
      leftX () {
        if (!this.eventsMouse.scrolling.isScrolling) {
          this.fixed.left = (this.offset - this.average.minTimestamp || 0) * this.xMultiplier;
        }
        return this.fixed.left;
      },
      rightX () {
        if (!this.eventsMouse.scrolling.isScrolling) {
          this.fixed.right = (this.offset + this.exposition - this.average.minTimestamp || 0) * this.xMultiplier;
        }
        return this.fixed.right;
      },
      left () {
        return `M${this.leftX} 0 L${this.leftX - this.handleWidth} 0
                L${this.leftX - this.handleWidth} ${this.height} L${this.leftX} ${this.height}`;
      },
      center () {
        return `M${this.leftX} 0 L${this.rightX} 0 L${this.rightX} ${this.height} L${this.leftX} ${this.height}`;
      },
      right () {
        return `M${this.rightX} 0 L${this.rightX + this.handleWidth} 0
                L${this.rightX + this.handleWidth} ${this.height} L${this.rightX} ${this.height}`;
      },
      isLeftHandle () {
        return this.lastHandle !== this.HANDLES.CENTER && this.lastHandle !== this.HANDLES.RIGHT &&
          this.isLeft(this.eventsMouse.scrolling.clientXWithOffset) || this.lastHandle === this.HANDLES.LEFT;
      },
      isCenterHandle () {
        return this.lastHandle !== this.HANDLES.LEFT && this.lastHandle !== this.HANDLES.RIGHT &&
          this.isCenter(this.eventsMouse.scrolling.clientXWithOffset) || this.lastHandle === this.HANDLES.CENTER;
      },
      isRightHandle () {
        return this.lastHandle !== this.HANDLES.LEFT && this.lastHandle !== this.HANDLES.CENTER &&
          this.isRight(this.eventsMouse.scrolling.clientXWithOffset) || this.lastHandle === this.HANDLES.RIGHT
      },
      maxExposition () {
        return this.wholeInterval / this.minZoom
      },
      minExposition () {
        return this.wholeInterval / this.maxZoom
      }
    },
    watch: {
      'eventsMouse.scrolling.isScrolling' () {
        this.lastHandle = null;
        this.expositionLimit = false;
        this.expositionLimitRight = false;
        this.expositionLimitLeft = false;
        this.computeGrabStyle(this.eventsMouse.scrolling.clientXWithOffset);
      }
    },
    methods: {
      convertXForHandler (x) {
        return x / this.workAreaCoef - this.handleWidth;
      },
      isLeft (x) {
        x = this.convertXForHandler(x);
        return x >= this.leftX - 1.5 * this.handleWidth && x <= this.leftX;
      },
      isCenter (x) {
        x = this.convertXForHandler(x);
        return x >= this.leftX && x <= this.rightX;
      },
      isRight (x) {
        x = this.convertXForHandler(x);
        return x >= this.rightX && x <= this.rightX + 1.5 * this.handleWidth;
      },
      computeGrabStyle (x) {
        if (this.isCenter(x)) {
          this.grabStyle.cursor = 'grab';
        } else if (this.isRight(x) || this.isLeft(x)) {
          this.grabStyle.cursor = 'ew-resize';
        } else {
          this.grabStyle.cursor = 'default';
        }
      },
      onHover (event) {
        this.computeGrabStyle(event.x);
      },
      onSwipe (event) {
        if (event.x && this.isLeftHandle) {
          this.grabStyle.cursor = 'ew-resize';
          this.lastHandle = this.HANDLES.LEFT;
          let offset = this.convertCurrentX(event.x);
          let exposition = (this.rightX - event.x) / this.xMultiplier;
          if (this.isExpositionValid(exposition) && this.checkForLeftEdge(offset, exposition) && event.x < this.rightX) {
            this.expositionLimitLeft = false;
            this.fixed.left = event.x;
            this.$emit('handler', {offset, exposition}, 'left');
          } else {
            this.expositionLimitLeft = true;
          }
        } else if (event.x && this.isRightHandle) {
          this.grabStyle.cursor = 'ew-resize';
          this.lastHandle = this.HANDLES.RIGHT;
          let offset = this.average.minTimestamp + this.leftX / this.xMultiplier;
          let exposition = this.convertCurrentX(event.x) - offset;
          if (this.isExpositionValid(exposition) && this.checkForRightEdge(offset) && event.x > this.leftX) {
            this.expositionLimitRight = false;
            this.fixed.right = event.x;
            this.$emit('handler', {offset, exposition}, 'right');
          } else {
            this.expositionLimitRight = true;
          }
        } else if (event.x && this.isCenterHandle) {
          this.grabStyle.cursor = 'grabbing';
          if (this.lastHandle === null) {
            this.startCenterDiff = this.leftX - event.x;
            this.startExposition = this.convertTimestampToX(this.exposition);
          }
          this.lastHandle = this.HANDLES.CENTER;
          let offset = this.convertCurrentX(event.x, this.startCenterDiff);
          if (this.checkForRightEdge(offset, this.convertXToTimestamp(this.startExposition)) && this.checkForLeftEdge(offset)) {
            this.fixed.left = event.x + this.startCenterDiff;
            this.fixed.right = this.fixed.left + this.startExposition;
          } else if (!this.checkForRightEdge(offset, this.convertXToTimestamp(this.startExposition))) {
            this.fixed.right = this.width;
            this.fixed.left = this.fixed.right - this.startExposition;
            let dif = this.width - (event.x + this.startCenterDiff);
            offset = offset + this.convertXToTimestamp(dif);
          } else if (!this.checkForLeftEdge(offset)) {
            this.fixed.left = 0;
            this.fixed.right = this.startExposition;
            offset = this.average.minTimestamp;
          }
          this.$emit('handler', {offset}, 'center');
        } else {
          this.grabStyle.cursor = 'default';
          this.lastHandle = null;
        }
      },
      convertCurrentX (x, additional = 0) {
        return this.average.minTimestamp + this.convertXToTimestamp(x + additional);
      },
      convertXToTimestamp (x) {
        return x / this.xMultiplier;
      },
      convertTimestampToX (timestamp) {
        return timestamp * this.xMultiplier;
      },
      checkForRightEdge (offset, exposition = this.exposition) {
        return (offset + exposition) <= this.wholeInterval;
      },
      checkForLeftEdge (offset) {
        return (offset) > this.average.minTimestamp - this.handleWidth
      },
      isExpositionValid (exposition) {
        this.expositionLimitLeft = false;
        this.expositionLimitRight = false;
        this.expositionLimit = !(exposition < this.maxExposition && exposition > this.minExposition);
        return !this.expositionLimit;
      }
    }
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
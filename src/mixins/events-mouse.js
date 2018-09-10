export default {
  methods: {
    _onMixinMouse(event) {
      let offsets = this.$el.getBoundingClientRect();
      let additionalOffsetsY = 0;
      if (this.offsets && this.offsets.chartTop && this.offsets.chartBottom) {
        additionalOffsetsY = this.offsets.chartTop + this.offsets.chartBottom;
      }
      switch(event.type){
        case 'mousedown':
          this.eventsMouse.scrolling.clientX = event.clientX;
          this.eventsMouse.scrolling.clientY = event.clientY;
          this.eventsMouse.scrolling.clientXWithOffset = event.clientX - offsets.left;
          this.eventsMouse.scrolling.clientYWithOffset = event.clientY - offsets.top;
          this.eventsMouse.scrolling.layerX = event.layerX;
          this.eventsMouse.scrolling.layerY = event.layerY;
          this.eventsMouse.scrolling.isScrolling = true;
          if ('onClick' in this) {
            this.onClick({
              x : event.clientX - offsets.left,
              y : event.clientY - offsets.top - additionalOffsetsY
            });
          }
          break;
        case 'mousemove':
          if('onHover' in this) {
            this.onHover({
              x : event.clientX - offsets.left,
              y : event.clientY - offsets.top - additionalOffsetsY
            });
          }
          if (this.eventsMouse.scrolling.isScrolling) {
            this.eventsMouse.scrolling.power = (this.eventsMouse.scrolling.clientX - event.clientX);
            this.eventsMouse.scrolling.clientX = event.clientX;
            this.eventsMouse.scrolling.layerX = event.layerX;
            if ('onSwipe' in this) {
              this.onSwipe({
                x : event.clientX - offsets.left,
                y : event.clientY - offsets.top - additionalOffsetsY,
                offsetX : this.eventsMouse.scrolling.power / this.dpi,
                offsetY : 0
              }, event);
            }
          }
          break;
        case 'mouseup':
        case 'mouseleave':
          this.eventsMouse.scrolling.isScrolling = false;
          break;
      }
    }
  },
  data () {
    return {
      eventsMouse: {
        x: null,
        y: null,
        scrolling: {
          power: 0,
          clientX: 0,
          clientY: 0,
          layerX: 0,
          layerY: 0,
          isScrolling: false,
          inertTimer: setInterval(() => {
            if (!this.eventsMouse.scrolling.isScrolling && (Math.abs(this.eventsMouse.scrolling.power) > 1)) {
              if ('onSwipe' in this) {
                this.onSwipe({
                  offsetX : this.eventsMouse.scrolling.power / this.dpi,
                  offsetY : 0
                });
              }
              this.eventsMouse.scrolling.power /= 1.2;
            }
          }, 20)
        }
      }
    }
  }
};

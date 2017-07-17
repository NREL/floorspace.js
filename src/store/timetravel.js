const serializeState = (state) => {
  const scaleX = state.application.scale.x;
  const scaleY = state.application.scale.y;

  const clone = JSON.parse(JSON.stringify(state));
  clone.application.scale.x = scaleX;
  clone.application.scale.y = scaleY;

  return clone;
};

export default {
  timetravelStates: [],
  timetravelIndex: 0,
  store: null,
  init(store) {
    this.store = store;

    // this is reset for each action
    let mutationsForAction = [];
    // override commit to store names of mutations
    const originalCommit = store.commit;
    store.commit = function overrideCommit(...args) {
      // console.log('committing', args);
      mutationsForAction.push(args[0]);
      originalCommit.apply(this, args);
    };

    // monkey patch dispatch to store each version of the state
    const that = this;
    const originalDispatch = store.dispatch;
    store.dispatch = function overrideDispatch(...args) {
      const action = args[0];
      console.log('dispatching', args[0]);
      originalDispatch.apply(this, args);


      // TODO: filter by action type


      if (that.timetravelIndex < that.timetravelStates.length - 1) {
        // clear tail from states and then push at index
        that.timetravelStates = that.timetravelStates.slice(0, that.timetravelIndex);
      }

      that.timetravelStates.push({
        meta: {
          action: args[0],
          mutations: mutationsForAction,
        },
        state: serializeState(store.state),
      });
      that.timetravelIndex += 1;
      mutationsForAction = [];
    };
  },
  undo() {
    this.timetravelIndex -= 2;
    this.store.replaceState(this.timetravelStates[this.timetravelIndex].state);
    console.log('undo', this.timetravelIndex, this.timetravelStates[this.timetravelIndex]);
  },
  redo() {
    if (this.timetravelIndex < this.timetravelStates.length - 1) {
      this.timetravelIndex += 1;
      this.store.replaceState(this.timetravelStates[this.timetravelIndex].state);
      console.log('redo', this.timetravelIndex);
    }
  },
};

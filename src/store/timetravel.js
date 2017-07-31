const serializeState = (state) => {
  const scaleX = state.application.scale.x;
  const scaleY = state.application.scale.y;

  const clone = JSON.parse(JSON.stringify(state));
  clone.application.scale.x = scaleX;
  clone.application.scale.y = scaleY;

  const currentSelections = clone.application.currentSelections;
  const currentStory = clone.models.stories.find(s => s.id === currentSelections.story.id);
  currentSelections.story = currentStory;
  currentSelections.space = currentSelections.space ? currentStory.spaces.find(s => s.id === currentSelections.space.id) : null;
  currentSelections.shading = currentSelections.shading ? currentStory.shading.find(s => s.id === currentSelections.shading.id) : null;

  currentSelections.building_unit = currentSelections.building_unit ? clone.models.library.building_units.find(b => b.id === currentSelections.building_unit.id) : null;
  currentSelections.thermal_zone = currentSelections.thermal_zone ? clone.models.library.thermal_zones.find(t => t.id === currentSelections.thermal_zone.id) : null;
  currentSelections.space_type = currentSelections.space_type ? clone.models.library.space_types.find(s => s.id === currentSelections.space_type.id) : null;

  clone.application.currentSelections = currentSelections;

  return clone;
};
const logState = state => state;

export default {
  store: null,
  pastTimetravelStates: [],
  futureTimetravelStates: [],
  currentlyInBatch: false,
  init(store) {
    const that = this;
    this.store = store;
    store.timetravel = this;

    this.pastTimetravelStates = [];
    this.futureTimetravelStates = [];

    /*
    * store.commit and store.replaceState mutate the data store
    * monkey patch them to call the onChange function supplied in app config
    */
    const originalReplaceState = store.replaceState;
    store.replaceState = function overrideReplaceState(...args) {
      if (window.api) { window.api.config.onChange(); }
      originalReplaceState.apply(this, args);
    };
    const originalCommit = store.commit;
    store.commit = function overrideCommit(...args) {
      if (window.api) { window.api.config.onChange(); }
      originalCommit.apply(this, args);
    };

    /*
    * monkey patch store.dispatch to store a new copy of the store.state for each
    * set of actions dispatched
    */
    const originalDispatch = store.dispatch;
    store.dispatch = function overrideDispatch(...args) {
      const action = args[0];

      // ignore changes to view bounds
      if (action !== ('project/setViewMinX') && action !== ('project/setViewMinY') &&
      action !== ('project/setViewMaxX') && action !== ('project/setViewMaxY') &&
      action !== ('application/setScaleX') && action !== ('application/setScaleY') &&
      action !== 'project/setSpacing') {
        /*
        * This timeout will prevent the store from saving if the event queue is not empty
        * The result is that each checkpoint contains a set of related actions, so undo can't leave us in an invalid state
        */
        // TODO: go over this with Brian again
        that.maybeSaveCheckpoint();
        console.log('dispatching action:', args[0]);
      }

      originalDispatch.apply(this, args);
    };
  },
  maybeSaveCheckpoint() {
    if (!this.currentlyInBatch) {
      this.saveCheckpoint();
    }
    // now, ignore the next few calls, until we clear the event loop.
    this.currentlyInBatch = true;
    clearTimeout(this.resetBatchFlag);
    this.resetBatchFlag = setTimeout(() => { this.currentlyInBatch = false; }, 0);
  },
  /*
  * Empty future states and save the currentState to pastTimetravelStates
  */
  saveCheckpoint() {
    this.pastTimetravelStates.push(serializeState(this.store.state));
    console.log('saving state:', this.pastTimetravelStates[this.pastTimetravelStates.length - 1]);
    this.futureTimetravelStates = [];
  },

  undo() {
    const replacementState = this.pastTimetravelStates.pop();
    if (replacementState) {
      this.futureTimetravelStates.push(serializeState(this.store.state));
      this.store.replaceState(replacementState);
      console.warn('undo', replacementState);
      // console.log('undo', this.pastTimetravelStates.map(s => logState(s)), logState(replacementState), this.futureTimetravelStates.map(s => logState(s)));
    }
  },

  redo() {
    const replacementState = this.futureTimetravelStates.pop();
    if (replacementState) {
      this.pastTimetravelStates.push(serializeState(this.store.state));
      this.store.replaceState(replacementState);
      console.warn('redo', replacementState);
      // console.log('redo', this.pastTimetravelStates.map(s => logState(s)), logState(replacementState), this.futureTimetravelStates.map(s => logState(s)));
    }
  },
  logTimetravel() {
    console.log('past:', this.pastTimetravelStates.map(s => logState(s)));
    console.log('current', logState(this.store.state));
    console.log('future:', this.futureTimetravelStates.map(s => logState(s)));
  },
};

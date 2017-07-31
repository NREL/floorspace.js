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
const logState = (state) => {
  return state.geometry[0].vertices.length;
};

export default {
  store: null,
  pastTimetravelStates: [],
  futureTimetravelStates: [],
  hasUndone: false,
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
      action !== ('application/setScaleX') && action !== ('application/setScaleY')) {
        /*
        * This timeout will prevent the store from saving if the event queue is not empty
        * The result is that each checkpoint contains a set of related actions, so undo can't leave us in an invalid state
        */
        // TODO: go over this with Brian again
        if (that.hasUndone) {
          console.log("the user has just undone something, we need to stick the current state to the end of paststates before dispatching the action and saving the new state");
          that.pastTimetravelStates.push(serializeState(that.store.state));
          that.hasUndone = false;
        }
        clearTimeout(store.checkpointTimout);
        store.checkpointTimout = setTimeout(that.saveCheckpoint.bind(that), 0);
      }

      console.log('dispatching', args[0]);
      originalDispatch.apply(this, args);
    };
    // initialize timetravel with a base state
    this.pastTimetravelStates.push(serializeState(this.store.state))
  },
  /*
  * Empty future states and save the currentState to pastTimetravelStates
  */
  saveCheckpoint(currentState) {
    this.pastTimetravelStates.push(serializeState(this.store.state));
    this.futureTimetravelStates = [];
    this.hasUndone = false;
  },

  undo() {
    let replacementState = this.pastTimetravelStates.pop();
    // the current state is also the last state on the pastTimetravelStates stack unless the user has just run undo()
    // use the second to last state
    if (!this.hasUndone) { replacementState = this.pastTimetravelStates.pop(); }
    this.hasUndone = true;
    if (replacementState) {
      this.futureTimetravelStates.push(serializeState(this.store.state));
      this.store.replaceState(replacementState);
      // console.log('undo', this.pastTimetravelStates.map(s => logState(s)), logState(replacementState), this.futureTimetravelStates.map(s => logState(s)));
    }
  },

  redo() {
    const replacementState = this.futureTimetravelStates.pop();
    if (replacementState) {
      this.pastTimetravelStates.push(serializeState(this.store.state));
      this.store.replaceState(replacementState);
      // console.log('redo', this.pastTimetravelStates.map(s => logState(s)), logState(replacementState), this.futureTimetravelStates.map(s => logState(s)));
    }
  },
  logTimetravel() {
    console.log('past:', this.pastTimetravelStates.map(s => logState(s)));
    console.log('current', logState(this.store.state));
    console.log('future:', this.futureTimetravelStates.map(s => logState(s)));
  },
};

const serializeState = (state) => {
  const clone = JSON.parse(JSON.stringify(state));

  // TODO: update these to be IDs and not references, then update importcode and serealization code
  const currentSelections = clone.application.currentSelections;
  const currentStory = clone.models.stories.find(s => s.id === currentSelections.story_id);

  currentSelections.building_unit = currentSelections.building_unit ? clone.models.library.building_units.find(b => b.id === currentSelections.building_unit.id) : null;
  currentSelections.thermal_zone = currentSelections.thermal_zone ? clone.models.library.thermal_zones.find(t => t.id === currentSelections.thermal_zone.id) : null;
  currentSelections.space_type = currentSelections.space_type ? clone.models.library.space_types.find(s => s.id === currentSelections.space_type.id) : null;

  clone.application.currentSelections = currentSelections;

  return clone;
};
const filteredActions = [
  'application/setScaleX',
  'application/setCurrentTool',
  'application/setScaleY',
  'project/setSpacing',
  'project/setViewMinX',
  'project/setViewMinY',
  'project/setViewMaxX',
  'project/setViewMaxY',
  'application/clearSubSelections',
  'application/setCurrentStoryId',
  'application/setCurrentStory',
  'application/setCurrentSpace',
  'application/setCurrentShading',
  'application/setCurrentImage',
  'application/setCurrentBuildingUnit',
  'application/setCurrentThermalZone',
  'application/setCurrentSpaceType',
  'project/setPreviousStoryVisible',
  'project/setGridVisible',
];

const logState = state => state;

export default {
  store: null,
  pastTimetravelStates: [],
  futureTimetravelStates: [],
  currentlyInBatch: false,
  triggeringAction: '(none)',
  init(store) {
    const that = this;
    this.store = store;
    store.timetravel = this;

    this.pastTimetravelStates = [];
    this.futureTimetravelStates = [];

    this.store.replaceState({ ...store.state, timetravelInitialized: true });
    /*
    * store.commit and store.replaceState mutate the data store
    * monkey patch them to call the onChange function supplied in app config
    */
    const originalReplaceState = store.replaceState;
    store.replaceState = function overrideReplaceState(...args) {
      if (window.api) { window.api.config.onChange(); }
      const newState = args[0];

      // non timetravel props
      // TODO: ask brian about config syntax for this
      newState.application.scale = this.state.application.scale;
      newState.project.view = this.state.project.view;
      newState.project.grid = this.state.project.grid;
      newState.project.previous_story = this.state.project.previous_story;

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
      if (filteredActions.indexOf(action) === -1) {
        /*
        * This timeout will prevent the store from saving if the event queue is not empty
        * The result is that each checkpoint contains a set of related actions, so undo can't leave us in an invalid state
        */
        // TODO: go over this with Brian again
        that.maybeSaveCheckpoint(action);
        console.log('dispatching action:', args[0]);
      }

      originalDispatch.apply(this, args);
    };
  },
  maybeSaveCheckpoint(action) {
    if (!this.currentlyInBatch) {
      this.saveCheckpoint(action);
    }
    // now, ignore the next few calls, until we clear the event loop.
    this.currentlyInBatch = true;
    clearTimeout(this.resetBatchFlag);
    this.resetBatchFlag = setTimeout(() => { this.currentlyInBatch = false; }, 0);
  },
  /*
  * Empty future states and save the currentState to pastTimetravelStates
  */
  saveCheckpoint(action) {
    this.pastTimetravelStates.push({
      triggeringAction: this.triggeringAction,
      state: serializeState(this.store.state)
    });
    this.triggeringAction = action;
    console.warn('saving state:', this.pastTimetravelStates[this.pastTimetravelStates.length - 1]);
    this.futureTimetravelStates = [];
  },

  undo() {
    if (!this.pastTimetravelStates.length) { return; }
    const { state: replacementState, triggeringAction } = this.pastTimetravelStates.pop();
    const oldAction = this.triggeringAction;
    this.futureTimetravelStates.push({
      triggeringAction: this.triggeringAction,
      state: serializeState(this.store.state),
    });
    this.triggeringAction = triggeringAction;
    this.store.replaceState(replacementState);
    console.log('undo', replacementState);
    window.eventBus.$emit('success', `undo ${oldAction}`);
  },

  redo() {
    if (!this.futureTimetravelStates.length) { return; }
    const { state: replacementState, triggeringAction } = this.futureTimetravelStates.pop();
    this.pastTimetravelStates.push({
      state: serializeState(this.store.state),
      triggeringAction: this.triggeringAction,
    });
    this.triggeringAction = triggeringAction;
    this.store.replaceState(replacementState);
    window.eventBus.$emit('success', `redo ${triggeringAction}`);
    console.log('redo', replacementState);
  },
  logTimetravel() {
    console.log('past:', this.pastTimetravelStates.map(s => logState(s)));
    console.log('current', logState(this.store.state));
    console.log('future:', this.futureTimetravelStates.map(s => logState(s)));
  },
};

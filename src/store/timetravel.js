import _ from 'lodash';

const serializeState = (state) => {
  return JSON.stringify(state);
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
  'project/setDimensions',
  'application/clearSubSelections',
  'application/setCurrentStoryId',
  'application/setCurrentStory',
  'application/setCurrentSpace',
  'application/setCurrentShading',
  'application/setCurrentImage',
  'application/setCurrentSpacePropertyId',
  'application/setCurrentSubSelectionType',
  'project/setPreviousStoryVisible',
  'project/setGridVisible',
  'project/setMapLatitude',
  'project/setMapLongitude',
  'project/setMapRotation',
];
const permanentActions = [
  'importFloorplan',
  'project/setMapEnabled',
  'project/setMapInitialized',
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
      if (!_.includes(filteredActions, action)) {
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
      state: serializeState(this.store.state),
    });
    this.triggeringAction = action;
    console.warn('saving state');
    this.futureTimetravelStates = [];
    this.potentiallyRollbackCheckpoint(action);
  },

  potentiallyRollbackCheckpoint(action) {
    const prevStates = this.pastTimetravelStates;
    const store = this.store;
    if (_.includes(permanentActions, action)) {
      // roll back all the way.
      this.pastTimetravelStates = [];
      this.futureTimetravelStates = [];
      return;
    }
    _.defer(() => {
      // after save checkpoint and dust has settled
      while (
        prevStates.length > 0 &&
        _.isEqual(serializeState(store.state), prevStates[prevStates.length - 1].state)
      ) {
        console.log('current state matches previous, so rolling back', prevStates[prevStates.length - 1].triggeringAction);
        prevStates.pop();
      }
    });
  },

  undo() {
    if (!this.pastTimetravelStates.length) { return; }
    const { state: replacementState, triggeringAction } = this.pastTimetravelStates.pop();
    const newState = JSON.parse(replacementState);
    const oldAction = this.triggeringAction;
    this.futureTimetravelStates.push({
      triggeringAction: this.triggeringAction,
      state: serializeState(this.store.state),
    });
    this.triggeringAction = triggeringAction;
    this.store.replaceState(newState);
    console.log('undo', newState);
    window.eventBus.$emit('success', `undo ${oldAction}`);
  },

  redo() {
    if (!this.futureTimetravelStates.length) { return; }
    const { state: replacementState, triggeringAction } = this.futureTimetravelStates.pop();
    const newState = JSON.parse(replacementState);
    this.pastTimetravelStates.push({
      state: serializeState(this.store.state),
      triggeringAction: this.triggeringAction,
    });
    this.triggeringAction = triggeringAction;
    this.store.replaceState(newState);
    window.eventBus.$emit('success', `redo ${triggeringAction}`);
    console.log('redo', newState);
  },
  logTimetravel() {
    console.log('past:', this.pastTimetravelStates.map(s => logState(s)));
    console.log('current', logState(this.store.state));
    console.log('future:', this.futureTimetravelStates.map(s => logState(s)));
  },
};

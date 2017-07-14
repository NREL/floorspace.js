const serializeState = (state) => {
  const scaleX = state.application.scale.x;
  const scaleY = state.application.scale.y;

  const clone = JSON.parse(JSON.stringify(state));
  clone.application.scale.x = scaleX;
  clone.application.scale.y = scaleY;

  return clone;
};

export default function configureTimetravel(store) {
  // monkey patch commit to store each version of the state
  let timetravelStates = [];

  let timetravelIndex = 0;

  const originalCommit = store.commit;
  store.commit = function overrideCommit(...args) {
    console.log('committing', args);
    originalCommit.apply(this, args);

    // // filter by mutation type
    // timetravelStates.push(JSON.parse(JSON.stringify(store.state)));
    // // if timetravelIndex < timetravelStates.length - 1, clear tail from states and then push at index
    // timetravelIndex += 1;
  };

  const originalDispatch = store.dispatch;
  store.dispatch = function overrideDispatch(...args) {
    console.log('\n\ndispatching', args);
    originalDispatch.apply(this, args);

    // TODO: filter by action type

    // if timetravelIndex < timetravelStates.length - 1, clear tail from states and then push at index
    if (timetravelIndex < timetravelStates.length - 1) {
      timetravelStates = timetravelStates.slice(0, timetravelIndex);
    }

    timetravelStates.push(serializeState(store.state));
    timetravelIndex += 1;
  };

  window.undo = () => {
    timetravelIndex -= 1;
    store.replaceState(timetravelStates[timetravelIndex]);
    console.log('undo', timetravelIndex);
  };
  window.redo = () => {
    if (timetravelIndex < timetravelStates.length - 1) {
      timetravelIndex += 1;
      store.replaceState(timetravelStates[timetravelIndex]);
      console.log('redo', timetravelIndex);
    }
  };
}

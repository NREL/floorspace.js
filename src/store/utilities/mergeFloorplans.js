import _ from 'lodash';
import idFactory from './generateId';
import exportData from './export';
import importFloorplan from './importFloorplan';

export default function mergeFloorplans(context, payload) {
  // export current floorplan
  const currentFloorplan = exportData(context.state, context.getters);
  console.log('current floorplan: ', currentFloorplan);
  console.log('payload contains new floorplan? ', payload);
  // take in floorplan JSON to merge with current floorplan
  const floorplanToMergeIn = payload.data;
  // TODO: need way to iterate over both arrays
  floorplanToMergeIn.stories[0].spaces = [...floorplanToMergeIn.stories[0].spaces, ...currentFloorplan.stories[0].spaces];
  floorplanToMergeIn.stories[0].spaces = floorplanToMergeIn.stories[0].spaces.map((space, index) => ({
    ...space,
    id: idFactory.generate(),
    name: `Space 1 - ${index}`,
  }));
  console.log('merged? ', floorplanToMergeIn.stories);
  console.log('mutating payload? ', payload.data);
  // merge the 2 objects together making sure to dedup ids
  // import the new merged object
  importFloorplan(context, payload);
}

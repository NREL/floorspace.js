import { expect } from 'chai'
import mutations from 'src/store/mutations'
import Project from 'src/store/modules/project'
import Application from 'src/store/modules/application'
import Models from 'src/store/modules/models'
import Geometry from 'src/store/modules/geometry'

describe('store mutations', () => {
    var state = {};

    it('importState', () => {
        const project = Project.state;
        const application = Application.state;
        const models = Models.state;
        const geometry = Geometry.state;

        mutations.importState(state, {
            project,
            application,
            models,
            geometry
        });

        expect(state.project).to.equal(project);
        expect(state.application).to.equal(application);
        expect(state.models).to.equal(models);
        expect(state.geometry).to.equal(geometry);
    });
})
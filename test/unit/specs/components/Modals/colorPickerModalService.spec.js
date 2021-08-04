import { colorPickerModalService } from '../../../../../src/components/Modals/colorPickerModalService';

describe('Color picker modal service', () => {

  const mockInstance = {};

  it('should allow attaching of the modal instance once', () => {
    colorPickerModalService._attach(mockInstance);

    expect(colorPickerModalService._attach.bind(colorPickerModalService, mockInstance)).to.throw();
  });

  it('should open the modal', () => {
    colorPickerModalService.openModal('testValue');
    expect(mockInstance.value).to.equal('testValue');
  });

  it('should be able to attach a change listener when opening the modal', () => {
    let called = false
    colorPickerModalService.openModal('', () => { called = true });

    expect(called).to.equal(false);

    colorPickerModalService._change('test');
    expect(called).to.equal(true);
  });

  it('should listen for the escape key to close the modal', () => {
    expect(mockInstance.visible).to.equal(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27 }));
    expect(mockInstance.visible).to.equal(false);

    // Should remove the listener for keypress after close
    mockInstance.visible = true;
    document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27 }));
    expect(mockInstance.visible).to.equal(true);
  });

  it('should close the modal', () => {
    colorPickerModalService.openModal('');
    expect(mockInstance.visible).to.equal(true);
    colorPickerModalService.closeModal();
    expect(mockInstance.visible).to.equal(false);
  });

});

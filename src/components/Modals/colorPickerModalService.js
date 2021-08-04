/**
 * Service for dealing with the ColorPickerModal
 * Assumes that there is only one ColorPickerModal
 */
class ColorPickerModalService {
  /**
   * Connects the modal instance to this service once the modal loads in
   * It is assumed that this will happen fast enough that all calls to other functions in this class don't need to check if `modalInstance` is defined
   * @param {*} modalInstance Instance of the modal to attach
   */
  _attach(modalInstance) {
    if (this.modalInstance) {
      throw 'Modal instance already defined before attach was called.  Multiple instances of ColorPickerModal?';
    }

    this.modalInstance = modalInstance;
  }

  /**
   * Invoked when the value of the color picker modal changes
   * Calls the passed in function to change the value if it has been set
   *
   * @param {string} value
   */
  _change(value) {
    if (this._changeFn) {
      this._changeFn(value);
    }
  }

  /**
   * Hides the modals and removes attached listeners
   */
  closeModal() {
    document.removeEventListener('keydown', this.closeOnEsc);
    this.modalInstance.visible = false;

    this._changeFn = null;
  }

  /**
   * Opens the modal and attaches the appropriate listeners
   *
   * @param {string} value Value to initialize the modal with
   * @param {*} onChange Function to invoke whenever the value changes; optional
   */
  openModal(value, onChange) {
    document.addEventListener('keydown', this.closeOnEsc);
    this.modalInstance.visible = true;
    this.modalInstance.value = value;

    this._changeFn = onChange;
  }
}

export const colorPickerModalService = new ColorPickerModalService();

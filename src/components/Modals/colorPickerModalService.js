/**
 * Service for dealing with the ColorPickerModal
 * Assumes that there is only one ColorPickerModal
 */
class ColorPickerModalService {

  constructor() {
    /**
     * Checks to see if a pressed key is the escape key; if so, it closes the modal
     * The function needs to retain the reference to this even passed as an argument, so it can't be declared with normal syntax
     *
     * @param {*} e Key event
     */
    this._closeOnEsc = (e) => {
      if (e.keyCode === 27) {
        this.closeModal();
      }
    }
  }

  /**
   * Connects the modal instance to this service once the modal loads in
   * It is assumed that this will happen fast enough that all calls to other functions in this class don't need to check if `modalInstance` is defined
   * @param {*} modalInstance Instance of the modal to attach
   */
  _attach(modalInstance) {
    if (this._modalInstance) {
      throw 'Modal instance already defined before attach was called.  Multiple instances of ColorPickerModal?';
    }

    this._modalInstance = modalInstance;
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
    document.removeEventListener('keydown', this._closeOnEsc);
    this._modalInstance.visible = false;

    this._changeFn = null;
  }

  /**
   * Opens the modal and attaches the appropriate listeners
   *
   * @param {string} value Value to initialize the modal with
   * @param {*} onChange Function to invoke whenever the value changes; optional
   */
  openModal(value, onChange) {
    document.addEventListener('keydown', this._closeOnEsc);
    this._modalInstance.visible = true;
    this._modalInstance.value = value;

    this._changeFn = onChange;
  }
}

export const colorPickerModalService = new ColorPickerModalService();

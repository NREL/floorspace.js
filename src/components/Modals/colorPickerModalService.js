class ColorPickerModalService {
  _attach(modalInstance) {
    this.modalInstance = modalInstance;
  }

  _change(value) {
    if (this._changeFn) {
      this._changeFn(value);
    }
  }

  closeModal() {
    document.removeEventListener('keydown', this.closeOnEsc);
    this.modalInstance.visible = false;

    this._changeFn = null;
  }

  openModal(value, onChange) {
    document.addEventListener('keydown', this.closeOnEsc);
    this.modalInstance.visible = true;
    this.modalInstance.value = value;

    this._changeFn = onChange;
  }
}

export const colorPickerModalService = new ColorPickerModalService();

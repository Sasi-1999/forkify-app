import View from './view.js';

class AddIngredient extends View {
  _parentElement = document.querySelector('.add__ingredient');

  addHandlerAddIngredient(handler) {
    this._parentElement.addEventListener('click', handler);
  }

  renderAddIngredient() {
    const markup = `
      <div class="ingredient">
        <div class="quantity">
          <label>Qty</label>
          <input value="" type="number" required name="quantity" />
        </div>
        <div class="unit">
          <label>Unit</label>
          <input value="" type="text" name="unit" />
        </div>
        <div class="item">
          <label>Item</label>
          <input value="" type="text" name="item" />
        </div>
      </div>
    `;

    this._parentElement.insertAdjacentHTML('beforebegin', markup);
  }
}

export default new AddIngredient();

'use babel';

import { Emitter, CompositeDisposable } from 'atom';

export class BaseView {

  constructor() {

    this.element = document.createElement('div');
    this.element.classList.add(this.getViewName());

    this.subscriptions = new CompositeDisposable();
  }

  serialize() {}

  destroy() {
    this.element.remove();
    this.subscriptions.dispose();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    return '**Base view**';
  }

  getViewName() {
    return '**base-view**-';
  }
}

export default BaseView;

'use babel';

import { Marp }  from '@marp-team/marp-core';
import { Emitter, CompositeDisposable } from 'atom';
import { BaseView } from './base-view';
import postcss from 'postcss';

export default class AtomMarpView extends BaseView {

  constructor(editorid) {
    super()
    this.marp = new Marp();

    this.editor = this.getEditor(editorid);

    this.packer = postcss([css => {
      css.walkAtRules('font-face', rule => {
        rule.remove();
      });
    }]);


    this.subscriptions.add(

      this.editor.onDidStopChanging(() => {
        atom.commands.dispatch(this.editor,'atom-marp:update');
      }),
      this.editor.onDidSave(() => {
        atom.commands.dispatch(this.editor,'atom-marp:update');
      }),
      this.editor.getBuffer().onDidReload(() => {
        atom.commands.dispatch(this.editor,'atom-marp:update');
      }),

      atom.commands.add(this.editor, {
        'atom-marp:update' : () => this.update(),
      })
    );

    this.update().then(() => {
      Marp.ready();
    });
  }

  serialize() {}

  getEditor(editorid) {
    for(editor of atom.workspace.getTextEditors()) {
      if(editor.id === editorid) return editor;
    }
  }

  getViewName() {
    return 'atom-marp';
  }

  getTitle() {
    return 'Marp Preview';
  }

  getURI(editor) {
    return `atom://atom-marp/editor/${this.editor.id}`;
  }

  setContent(html) {
    this.content = html;
  }

  setStyle(css) {
    this.css = this.packer.process(css).css;
  }

  update() {
    return new Promise((res, rej) => {

      const rendered = this.marp.render(this.editor.getText());
      this.setContent(rendered.html);
      this.setStyle(rendered.css);

      this.element.innerHTML = this.content;
      const styledom = document.createElement('style');
      styledom.innerHTML = this.css;
      this.element.appendChild(styledom);

      res();
    });
  }

}

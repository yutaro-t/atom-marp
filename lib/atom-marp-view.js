'use babel';

import { Marp }  from '@marp-team/marp-core';
import { Emitter, CompositeDisposable } from 'atom';
import { BaseView } from './base-view';
import postcss from 'postcss';
import postcssScss from 'postcss-scss';
import fs from 'fs';
import path from 'path';

const testTheme = __dirname + '/../spec/test_theme.css';

export default class AtomMarpView extends BaseView {

  constructor(editorid) {
    super()
    this.marp = new Marp();
    this.marp.themeSet.add(fs.readFileSync(testTheme));

    this.editor = this.getEditor(editorid);
    this.subscriptions.add(

      this.editor.onDidStopChanging(() => {
        this.updateAll();
      }),
      this.editor.onDidSave(() => {
        this.updateAll();
      }),
      this.editor.getBuffer().onDidReload(() => {
        this.updateAll();
      })
    );
    this.updateAll().then(() => {
      console.log('hi');
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
    return 'atom-marp'
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
    this.css = css;
  }

  updateAll() {
    return new Promise((res, rej) => {
      const rendered = this.marp.render(this.editor.getText());
      this.setContent(rendered.html);
      this.setStyle(rendered.css);
      this.update().then(res());
    });
  }

  update() {
    return new Promise((res, rej) => {
      this.element.innerHTML = this.content;
      const styledom = document.createElement('style');
      styledom.innerHTML = this.css;
      this.element.appendChild(styledom);
      res();
    });
  }

}

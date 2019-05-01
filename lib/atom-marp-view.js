'use babel';

import { Marp }  from '@marp-team/marp-core';
import { CompositeDisposable, File } from 'atom';
import { BaseView } from './base-view';
import postcss from 'postcss';

export default class AtomMarpView extends BaseView {

  static deserialize(state) {
    return new AtomMarpView(state);
  }

  constructor({ editorid, filePath }) {
    super();
    this.marp = new Marp();
    if(editorid) {
      this.editorid = editorid;
      this.editor = this.getEditor(editorid);
      this.subscriptions.add(
        this.editor.getBuffer().onDidStopChanging(() => this.update()),
        this.editor.onDidSave(() => this.update()),
        this.editor.getBuffer().onDidReload(() => this.update()),
      );
    } else if(filePath) {
      this.filePath = filePath;
      this.file = new File(filePath);
      this.subscriptions.add(
        this.file.onDidChange(() => this.update()),
      )
    }

    this.packer = postcss([css => {

      css.first.before(`
        .atom-marp {
          overflow: auto;
        }
        .atom-marp .marpit>svg>foreignObject>section {
          position: static;
        }

        .atom-marp .marpit>svg>foreignObject>section .katex .base {
          position: static;
        }
      `);

      css.walkAtRules('font-face', rule => {
        rule.remove();
      });
    }]);

    this.update().then(() => {
      Marp.ready();
    });
  }

  serialize() {
    return {
      deserializer: 'AtomMarpView',
      editorId: this.editorid,
      filePath: this.getPath(),
    }
  }

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

  getURI() {
    if(this.editor){
      return `atom://atom-marp/editor/${this.editor.id}`;
    } else if(this.file) {
      return `atom://atom-marp/file/${this.file.getPath()}`;
    } else {
      return `atom://atom-marp/`;
    }
  }

  getText() {
    if(this.editor) {
      return Promise.resolve(this.editor.getText());
    } else if (this.file) {
      return this.file.read();
    }
  }

  setContent(html) {
    this.content = html;
  }

  setStyle(css) {
    this.css = this.packer.process(css).css;
  }

  update() {
    return this.getText().then( text => {
      const rendered = this.marp.render(text);
      this.setContent(rendered.html);
      this.setStyle(rendered.css);
      this.element.innerHTML = this.content;
      const styledom = document.createElement('style');
      styledom.innerHTML = this.css;
      this.element.appendChild(styledom);
      return;
    });Z
  }

  getPath() {
    if(this.file) {
      return this.file.getPath();
    } else if(this.editor) {
      return this.editor.getPath();
    }
  }

}

'use babel';

import AtomMarpView from './atom-marp-view';
import { CompositeDisposable, Disposable, TextEditor } from 'atom';

export default {

  activate(state) {


    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(

      atom.workspace.addOpener((uri) => {
        uri = decodeURI(uri);
        if(uri.startsWith(this.getEditorURI())) {
          const editorid = parseInt(uri.substring(this.getEditorURI().length));
          this.view = new AtomMarpView({ editorid });
        } else if(uri.startsWith(this.getFileURI())) {
          const filePath = uri.substring(this.getFileURI().length);
          this.view = new AtomMarpView({ filePath });
        }

        return this.view;
      }),

      atom.commands.add('atom-workspace', {
        'atom-marp:toggle': () => this.toggle(),
        'atom-marp:toggle-file': () => this.toggleFile(),
      }),

      new Disposable(() => {
        this.view.destroy();
      }),
    );
  },

  deactivate() {
    this.subscription.dispose();
  },

  serialize() {
    return this.view.serialize();
  },

  deserializeView(state) {
    return new AtomMarpView(state);
  },

  toggle() {
    let activePane = atom.workspace.getActivePaneItem();
    if(activePane instanceof AtomMarpView) {
      activePane.destroy();
      return;
    }

    const editor = atom.workspace.getActiveTextEditor();
    if(editor){
      atom.workspace.open(this.getEditorURI(editor), {
        split: 'right',
      });
    }
  },

  getEditorURI(editor) {
    if(editor){
      return `${this.getURI()}editor/${editor.id}`;
    } else {
      return `${this.getURI()}editor/`;
    }
  },

  getFileURI(path) {
    if(path){
      return `${this.getURI()}file/${path.id}`;
    } else {
      return `${this.getURI()}file/`;
    }
  },

  getURI() {
    return 'atom://atom-marp/';
  }
};

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
      atom.commands.add('atom-text-editor', {
        'atom-marp:toggle': () => this.toggle(),
      }),

      atom.commands.add(
        `.tree-view .file .name[data-name$=\\.md]`,
        'atom-marp:toggle-file',
        ({ target }) => this.toggleFile(target),
      ),

      new Disposable(() => {
        this.view.destroy();
      }),
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    if(this.view){
      return this.view.serialize();
    }
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

    if(editor === null) return

    if (!this.removePreviewForEditor(editor)) {
      this.addPreviewForEditor(editor)
    }
  },

  toggleFile(target) {

    const filePath = target.dataset.path
    if (!filePath) {
      return
    }

    for (const editor of atom.workspace.getTextEditors()) {
      if (editor.getPath() === filePath) {
        this.addPreviewForEditor(editor)
      }
    }

    atom.workspace.open(this.getFileURI(filePath), {
      searchAllPanes: true
    })
  },

  addPreviewForEditor(editor) {
    const activePane = atom.workspace.getActivePane();
    atom.workspace.open(this.getEditorURI(editor), {
      split: 'right',
    }).then(p => {
      if(p instanceof AtomMarpView) {
        activePane.activate();
      }
    });
  },

  removePreviewForEditor (editor) {
    const uri = this.getEditorURI(editor)
    const previewPane = atom.workspace.paneForURI(uri)
    if (previewPane != null) {
      previewPane.destroyItem(previewPane.itemForURI(uri))
      return true
    } else {
      return false
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
  },

  handleURI(parsedUri) {
    console.log('uri', parsedUri);
  }
};

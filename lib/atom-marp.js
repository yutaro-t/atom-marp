'use babel';

import AtomMarpView from './atom-marp-view';
import { CompositeDisposable, Disposable, TextEditor } from 'atom';

export default {

  activate(state) {


    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(

      atom.workspace.addOpener((uri) => {
        uri = decodeURI(uri);
        if(uri.startsWith(this.getURI())) {
          return new AtomMarpView(parseInt(uri.substring(this.getURI().length)))
        }
      }),

      atom.commands.add('atom-workspace', {
        'atom-marp:toggle': () => this.toggle()
      }),

      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof AtomMarpView) {
            item.destroy();
          }
        });
      })
    );
  },

  deactivate() {
    this.subscription.dispose();
  },

  toggle() {
    let activePane = atom.workspace.getActivePaneItem();
    if(activePane instanceof AtomMarpView) {
      activePane.destroy();
      return;
    }

    const editor = atom.workspace.getActiveTextEditor();
    if(editor){
      atom.workspace.open(this.getURI(editor), {
        split: 'right',
      });
    }
  },

  getURI(editor) {
    if(editor){
      return `atom://atom-marp/editor/${editor.id}`;
    } else {
      return `atom://atom-marp/editor/`;
    }
  },
};

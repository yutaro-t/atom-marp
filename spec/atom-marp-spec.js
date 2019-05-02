'use babel';

import AtomMarp from '../lib/atom-marp'
import AtomMarpView from '../lib/atom-marp-view'
import path from 'path';
import fs from 'fs-plus';
import temp from 'temp';

describe('AtomMarp', () => {
  let preview, activationPromise, workspaceElement
  let tempTrack = temp.track()
  let editor

  beforeEach(function () {
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)
    activationPromise = atom.packages.activatePackage('atom-marp')

    const fixturesPath = path.join(__dirname, 'fixtures')
    const tempPath = tempTrack.mkdirSync('atom')
    fs.copySync(fixturesPath, tempPath)
    atom.project.setPaths([tempPath])

  })

  const executeCommand = callback => {
    runs(() => {
      atom.commands.dispatch(atom.workspace.getActiveTextEditor().getElement(), 'atom-marp:toggle')
    })
    waitsForPromise(() => activationPromise)
    runs(callback)
  }

  const expectPreviewInSplitPane = () => {
    waitsFor(() => {
      return atom.workspace.getCenter().getPanes().length === 2
    })

    runs(() => {
      preview = atom.workspace.getCenter().getPanes()[1].getActiveItem()
      expect(preview).toBeInstanceOf(AtomMarpView)
      expect(preview.getPath()).toBe(
        atom.workspace.getActivePaneItem().getPath()
      )
    })
  }

  describe('when a preview has not been created for the file', function() {
    it('displays a markdown preview in a split pane', function() {
      waitsForPromise(() => atom.workspace.open('markdowns/test.md'))
      executeCommand(() => {
        expectPreviewInSplitPane()
      })

      runs(() => {
        const [editorPane] = atom.workspace.getCenter().getPanes()
        expect(editorPane.getItems()).toHaveLength(1)
        expect(editorPane.isActive()).toBe(true)
      })
    })
  })

});

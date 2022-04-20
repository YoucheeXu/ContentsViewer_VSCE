// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CContensViewer } from './ContensViewer';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// const contentsProvider = new ContentsTreeView();
	// vscode.window.registerTreeDataProvider('ContentsViewer-view', contentsProvider)
	const contentsViewer = new CContensViewer(context);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	vscode.commands.registerCommand('ContentsViewer.GotoLine', async (lineNum: number) => {
		await vscode.commands.executeCommand('revealLine', {
			lineNumber: lineNum,
			at: "center"
		});
	});

	vscode.commands.registerCommand('ContentsViewer.refresh', () => {
		// The code you place here will be executed every time your command is executed
		contentsViewer.refresh();
		const editor = vscode.window.activeTextEditor?.selection;
		if (editor) {
			contentsViewer.highlightItemByCurLineNum();
		}
	});

	vscode.commands.registerCommand('ContentsViewer.headIndex', () => {
		contentsViewer.headIndex();
		const editor = vscode.window.activeTextEditor?.selection;
		if (editor) {
			contentsViewer.highlightItemByCurLineNum();
		}
	});

	vscode.commands.registerCommand('ContentsViewer.specificIndex', () => {
		contentsViewer.specificIndex();
		const editor = vscode.window.activeTextEditor?.selection;
		if (editor) {
			contentsViewer.highlightItemByCurLineNum();
		}
	});

	vscode.commands.registerCommand('ContentsViewer.numberContents', () => {
		contentsViewer.numberContents();
		const editor = vscode.window.activeTextEditor?.selection;
		if (editor) {
			contentsViewer.highlightItemByCurLineNum();
		}
	});

	// context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

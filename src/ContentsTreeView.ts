import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { CDocument, contentData_t } from "./Document";

export class ContentsTreeView implements vscode.TreeDataProvider<Content> {

    private _onDidChangeTreeData: vscode.EventEmitter<Content | undefined | void> = new vscode.EventEmitter<Content | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Content | undefined | void> = this._onDidChangeTreeData.event;

    private _cdoc: CDocument;

    constructor() {
        this._cdoc = new CDocument();
        this.refresh();
    }

    refresh(): void {
        // this._onDidChangeTreeData.fire();
        const txtDocument = vscode.window.activeTextEditor?.document;
        const name = txtDocument?.fileName;
        const langId = txtDocument?.languageId;
        console.log(`langue Id = ${langId}`);
        this._cdoc.setDoc(txtDocument?.getText() || "");
        this._cdoc.parse();
    }

    getTreeItem(element: Content): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Content): Thenable<Content[]> {
        let contentAry = new Array<Content>();
        if (element) {
            return Promise.resolve([]);
        } else {
            this._cdoc.mapContents.forEach((contentData, lineNum) => {
                const ctt = new Content(contentData.szContent, vscode.TreeItemCollapsibleState.None, lineNum);
                contentAry.push(ctt);
            });
            return Promise.resolve(contentAry);
        }
    }
}

export class Content extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private readonly lineNum: number
    ) {
        super(label, collapsibleState);

        this.tooltip = String(lineNum);
        // this.description = `${this.label}@${this.tooltip}`;
    }

    // iconPath = {
    //     light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    //     dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };

    command: vscode.Command = {
        title: "",
        command: 'ContentsViewer.GotoLine',                     // 
        arguments: [
            this.lineNum
        ]
    };

    contextValue = 'Content';
}

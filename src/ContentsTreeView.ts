import { timeStamp } from 'console';
import * as vscode from 'vscode';
import { mapContents_t } from "./Document";

export class ContentsTreeView implements vscode.TreeDataProvider<Content> {

    // private _onDidChangeTreeData: vscode.EventEmitter<Content | undefined | void> = new vscode.EventEmitter<Content | undefined | void>();
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    // readonly onDidChangeTreeData: vscode.Event<Content | undefined | void> = this._onDidChangeTreeData.event;
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

    private _treeView: vscode.TreeView<Content>;
    private _mapContents = {} as mapContents_t;

    constructor(context: vscode.ExtensionContext) {

        this._treeView = vscode.window.createTreeView('ContentsViewer-view', { treeDataProvider: this, showCollapseAll: true, canSelectMany: true });
        context.subscriptions.push(this._treeView);

        // langue Id = plaintext
    }

    getTreeItem(element: Content): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Content): Thenable<Content[]> {
        if (this._mapContents.size >= 1) {
            let contentAry = new Array<Content>();
            if (element) {
                return Promise.resolve([]);
            } else {
                this._mapContents.forEach((contentData, lineNum) => {
                    const ctt = new Content(contentData.szContent, vscode.TreeItemCollapsibleState.None, lineNum);
                    contentAry.push(ctt);
                });
                return Promise.resolve(contentAry);
            }
        } else {
            return Promise.resolve([]);
        }
    }

    getParent(element?: Content): any {
        return null;
    }

    public updateData(mapContents: mapContents_t) {
        this._mapContents = mapContents;
        this._onDidChangeTreeData.fire(undefined);
    }

    public highlightItemByLineNum(lineNum: number) {
        let szContent = this._mapContents.get(lineNum)?.szContent || "";
        const content = new Content(szContent, vscode.TreeItemCollapsibleState.None, lineNum);
        this._treeView.reveal(content, { focus: true });
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

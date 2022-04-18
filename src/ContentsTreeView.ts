import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { indexType_t, contentData_t, CDocument } from "./Document";

export class ContentsTreeView implements vscode.TreeDataProvider<Content> {

    // private _onDidChangeTreeData: vscode.EventEmitter<Content | undefined | void> = new vscode.EventEmitter<Content | undefined | void>();
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    // readonly onDidChangeTreeData: vscode.Event<Content | undefined | void> = this._onDidChangeTreeData.event;
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

    private _treeView: vscode.TreeView<Content>;

    private _cdoc: CDocument;

    private _stIndexType = indexType_t.normIndex;
    private _szIndex = "";

    constructor(context: vscode.ExtensionContext) {
        this._cdoc = new CDocument();

        this._treeView = vscode.window.createTreeView('ContentsViewer-view', { treeDataProvider: this, showCollapseAll: true, canSelectMany: true });
        context.subscriptions.push(this._treeView);

        this.refresh();

        // langue Id = plaintext
    }

    public refresh(): void {
        const txtDocument = vscode.window.activeTextEditor?.document;
        const name = txtDocument?.fileName;
        const langId = txtDocument?.languageId;
        console.log(`langue Id = ${langId}`);
        this._cdoc.setDoc(txtDocument?.getText() || "");
        this._cdoc.parse(this._stIndexType, this._szIndex);

        this._onDidChangeTreeData.fire(undefined);
    }

    public headIndex(): void {
        if (this._stIndexType === indexType_t.headIndex) {
            // TODO: cancel checked
            this._stIndexType = indexType_t.normIndex;
            return this.refresh();
        } else {
            // TODO: check

            this._stIndexType = indexType_t.headIndex;
        }

        const txtDocument = vscode.window.activeTextEditor?.document;
        const name = txtDocument?.fileName;
        const langId = txtDocument?.languageId;
        console.log(`langue Id = ${langId}`);
        this._cdoc.setDoc(txtDocument?.getText() || "");
        this._cdoc.parse(indexType_t.headIndex);

        this._onDidChangeTreeData.fire(undefined);
    }

    public specificIndex(): void {
        if (this._stIndexType === indexType_t.specificIndex) {
            // TODO: cancel checked
            this._stIndexType = indexType_t.normIndex;
            return this.refresh();
        } else {
            // TODO: check

            this._stIndexType = indexType_t.specificIndex;
        }

        const txtDocument = vscode.window.activeTextEditor?.document;
        const name = txtDocument?.fileName;
        const langId = txtDocument?.languageId;
        console.log(`langue Id = ${langId}`);
        this._cdoc.setDoc(txtDocument?.getText() || "");
        let _this = this;
        vscode.window.showInputBox(
            { // 这个对象中所有参数都是可选参数
                password: false, // 输入内容是否是密码
                ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
                placeHolder: 'specificIndex', // 在输入框内的提示信息
                prompt: '赶紧输入，不输入就赶紧滚', // 在输入框下方的提示信息
                validateInput: function (text) { return null; } // 对输入内容进行验证并返回
            }).then(function (szIndex) {
                _this._szIndex = szIndex || "";
                _this._cdoc.parse(indexType_t.specificIndex, szIndex);
                _this._onDidChangeTreeData.fire(undefined);
            });
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

    getParent(element?: Content): any {
        return null;
    }

    public highlightItemByCurLineNum() {
        const editor = vscode.window.activeTextEditor?.selection;
        if (editor) {
            let curLineNum = editor.active.line + 1;
            // const treeView = vscode.window.createTreeView("ContentsViewer-view", { treeDataProvider: this });
            // reveal(element: T, options?: {expand: boolean | number, focus: boolean, select: boolean}): 
            // { focus: true, select: false, expand: true }
            // let item = this.getNodeAtPosition(itemNum);
            // let item = this._cdoc.;
            let lineNum = this._cdoc.itemIdxByLineNum(curLineNum);
            let szContent = this._cdoc.mapContents.get(lineNum)?.szContent || "";
            const content = new Content(szContent, vscode.TreeItemCollapsibleState.None, lineNum);
            this._treeView.reveal(content, { focus: true });
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

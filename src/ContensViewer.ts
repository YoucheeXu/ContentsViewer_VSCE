import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { indexType_t, contentData_t, CDocument } from "./Document";
import { ContentsTreeView, Content } from "./contentsTreeView";
import { rejects } from 'assert';

export class CContensViewer {
    private _stIndexType = indexType_t.normIndex;
    private _szIndex = "";
    private _cdoc: CDocument;
    private _treeview: ContentsTreeView;

    // private _textEditor: vscode.TextEditor;

    constructor(context: vscode.ExtensionContext) {
        this._cdoc = new CDocument();
        this._treeview = new ContentsTreeView(context);
        this.refresh();
    }

    public refresh(): void {
        const txtDocument = vscode.window.activeTextEditor?.document;
        const name = txtDocument?.fileName;
        const langId = txtDocument?.languageId;
        console.log(`langue Id = ${langId}`);
        this._cdoc.setDoc(txtDocument?.getText() || "");
        this._cdoc.parse(this._stIndexType, this._szIndex);

        this._treeview.updateData(this._cdoc.mapContents);
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

        this.refresh();
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
                _this.refresh();
            });
    }

    public highlightItemByCurLineNum() {
        const editor = vscode.window.activeTextEditor?.selection;
        if (editor) {
            let curLineNum = editor.active.line + 1;
            let lineNum = this._cdoc.itemIdxByLineNum(curLineNum);
            this._treeview.highlightItemByLineNum(lineNum);
        }
    }

    public updateDoc(doc: string): Promise<boolean> {
        const textEditor = vscode.window.activeTextEditor;
        if (!textEditor) {
            vscode.window.showErrorMessage("Editor Does Not Exist");
            return Promise.reject(false);
        }

        // Creating a new range with startLine, startCharacter & endLine, endCharacter.
        let invalidRange = new vscode.Range(0, 0, textEditor.document.lineCount, 0);

        // To ensure that above range is completely contained in this document.
        let validFullRange = textEditor.document.validateRange(invalidRange);

        return new Promise((resolve, reject) => {
            textEditor.edit(editBuilder => {
                editBuilder.replace(validFullRange, doc);
            }).then(success => {
                resolve(success);
            });
        });
    }

    public numberContents() {
        this._cdoc.numberContents();
        let doc = this._cdoc.getDoc();
        this.updateDoc(doc).then((ret) => {
            if (ret) {
                this.refresh();
            }
        });
    }
}
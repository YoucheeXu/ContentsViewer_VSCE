// Document.ts
import * as fs from 'fs';
import { runInThisContext } from 'vm';
import * as utils from "./utils";

export interface contentData_t {
	szContent: string;
	szKeyWord: string;
	nLevel: number;
}

interface line_t {
	nStrt: number;
	nEnd: number;
	txt: string;
}

enum indexType_t {
	normIndex,
	headIndex,
	specificIndex
}

export class CDocument {
	private _bDebug = false;

	private _document = new Array<line_t>();

	private _mapContents = new Map<number, contentData_t>();

	private _numOfBlankLineBetweenParagraphs: number = 1;
	private _szNum: string = "";
	private _numOfX: number = 0;
	private _szKeyWordAry = new Array<string>();

	constructor() {
		// this.splitDoc(doc);
		this.setParameters(1, '一二三四五六七八九十零百千０１２３４５６７８９0123456789', 7, "集部册卷篇章节话回折");
	}

	// TODO: wait to test
	public setDoc(doc: string) {
		this.splitDoc(doc);
	}

	// TODO: wait to test
	public getDoc() {
		let doc = "";
		for (let line of this._document) {
			doc += (line.txt + "\r\n");
		}
	}

	// TODO: wait to test
	private splitDoc(doc: string) {
		let lineLst = doc.split(/\r\n/g);
		let pos = 0;
		for (let lineTxt of lineLst) {
			let lenOfLineTxt = lineTxt.length + 2;
			let line: line_t = { nStrt: pos, nEnd: pos + lenOfLineTxt, txt: lineTxt };
			this._document.push(line);
			pos += lenOfLineTxt;
		}
	}

	// TODO: wait to test
	private lineNumFromPos(pos: number) {
		for (let line of this._document) {
			if (pos >= line.nStrt && pos < line.nEnd) {
				return line.txt;
			}
		}
		return "";
	}

	// TODO: wait to test
	private posFromLineNum(lineNum: number) {
		let line = this._document[lineNum - 1];
		return line.nStrt;
	}

	// TODO: wait to test
	public itemIdxByLineNum(lineNum: number): number {
		let prvLineNum = Number.MAX_VALUE;
		for (let key of this._mapContents.keys()) {
			let curLineNum = key;
			if (lineNum >= prvLineNum && lineNum < curLineNum) {
				return prvLineNum;
			}
			prvLineNum = curLineNum;
		};
		return 0;
	}

	// TODO: wait to test
	private addContent(nItem: number, szContentName: string, nLine: number, nLevel: number, szKeyWord: string) {
		// LOGINFO("Doc AddContent: %s, Level : %d, nLine: %d", wszContentName, nLevel, nLine);

		if (!this._mapContents.get(nLine)) {
			let val: contentData_t = {
				nLevel: nLevel,
				szContent: szContentName,
				szKeyWord: szKeyWord
			};
			this._mapContents.set(nLine, val);

			return 1;
		}

		return -1;
	}

	// TODO wait to test
	private indexContents(szRegExp: string, szKeyWord: string, nLevel: number): number {
		let i = 0;
		for (let idx = 0; idx < this._document.length; idx++) {
			let lineTxt = this._document[idx].txt;
			if (lineTxt.search(szRegExp) !== -1) {
				this.addContent(i, lineTxt, idx + 1, nLevel, szKeyWord);
				i++;
			}
		}
		return i;
	}

	// TODO: wait to test
	public setParameters(numOfBlankLineBetweenParagraphs: number, szNum: string, uCountX: number, szKeyWord: string) {
		this._numOfBlankLineBetweenParagraphs = numOfBlankLineBetweenParagraphs;
		this._numOfX = uCountX;

		this._szNum = szNum;

		this._szKeyWordAry = szKeyWord.split("");
		// console.log(`_szKeyWordAry = ${this._szKeyWordAry}`);
	}

	// TODO: wait to test
	public delLine(nLineNum: number) {
		this._document.splice(nLineNum - 1);
	}

	// TODO
	public cutLines(nLineStart: number, nLineEnd: number) {
	}

	// TODO
	public pasteBeforeLine(nLineNum: number) {

	}

	// TODO: wait to test
	public replaceLine(nLineNum: number, szTxt: string) {
		this._document[nLineNum - 1].txt = szTxt;
	}

	// TODO: wait to test
	public getLine(nLineNum: number): string {
		return this._document[nLineNum - 1].txt;
	}

	// TODO: wait to test
	public getLineCount(): number {
		return this._document.length;
	}

	// TODO: wait to test
	public mergeParagraphs(szDoc: string) {
		szDoc = szDoc.replace(/\r\n\r\n/g, "@");

		szDoc = szDoc.replace(/\r\n/g, "");

		szDoc = szDoc.replace(/@/g, "\r\n\r\n");

		szDoc = szDoc.replace(/^　　/g, "@");

		szDoc = szDoc.replace(/　　/g, "");

		szDoc = szDoc.replace(/^@/g, "　　");
	}

	// TODO: wait to test
	public alignParagraphs() {
		let szDoc = "";

		//earse wailing blankspace of paragraphs
		szDoc = szDoc.replace(/^[ 　\t]+$/g, "");
		//replace heading blanksapce of paragraphs to "　　"
		szDoc = szDoc.replace(/^[ 　\t]*/g, "　　");
		//earse wailing blankspace of paragraphs
		szDoc = szDoc.replace(/^[ 　\t]+$/g, "");

		if (0 === this._numOfBlankLineBetweenParagraphs) {
			szDoc = szDoc.replace(/[\r\n]+?/g, "\r\n");
		}
		else if (1 === this._numOfBlankLineBetweenParagraphs) {
			szDoc = szDoc.replace(/\r\n/g, "\r\n\r\n");
			szDoc = szDoc.replace(/\r\n\r\n\r\n/g, "\r\n\r\n");
		}

		this.parse(indexType_t.normIndex, "");

		this.trimContents();

		let szFirstLine = this.getLine(1);

		szFirstLine = szFirstLine.trim();

		this.replaceLine(1, szFirstLine);
	}

	// TODO
	public scriptReplace(szScript: string) {
	}

	// TODO
	public big5ToGBK() {

	}

	// TODO: wait to test
	public parse(stIndexType: indexType_t = indexType_t.normIndex, szIndex?: string) {
		let nMaxLevel = 0;
		let nTotalNum = 0;
		if (indexType_t.normIndex === stIndexType) {

			let wt = String(this._numOfX * 2);

			let szText = "^[ 　\\t]*?第[";

			szText = szText + this._szNum;
			szText = szText + "]{0,";

			szText = szText + wt;
			szText = szText + "}卷.*";

			let nPos = szText.indexOf("卷");

			let nTotalLevel = this._szKeyWordAry.length;

			let nLevel = 1;
			let nNum = 0;
			let szKeyWord: string;
			for (let i = 1; i <= nTotalLevel; i++) {
				//_tcscpy(tszkeyWord, m_wszKeyWord[i - 1]);
				szKeyWord = this._szKeyWordAry[i - 1];

				szText = utils.strReplaceAtPos(szText, nPos, 1, szKeyWord);

				if (nNum > 0) { nLevel++; }
				nNum = this.indexContents(szText, szKeyWord, nLevel);

				if (nNum > 0) { nMaxLevel = nLevel; };
				nTotalNum = nTotalNum + nNum;
			}
		}
		else if (indexType_t.headIndex === stIndexType) {
			nTotalNum = this.indexContents("^[^ 　\\t\\r\\n].+", "", 1);
		} else if (indexType_t.specificIndex === stIndexType) {
			nTotalNum = this.indexContents(szIndex || "", "", 1);
		}

		return nMaxLevel;
	}

	// TODO: wait to test
	public trimContents() {
		let szContent: string, szKeyWord: string;
		let nLine = 0;
		let nPos = 0;

		this._mapContents.forEach((value: contentData_t, key: number) => {
			nLine = key;
			szContent = value.szContent;
			szKeyWord = value.szKeyWord;

			szContent = szContent.replace(/^[ 　\t]+/g, "");

			szContent = szContent.replace(/[ 　\t]+$/g, "");

			nPos = szContent.indexOf("　");
			while (nPos !== -1) {
				szContent = utils.strReplaceAtPos(szContent, nPos, 1, " ");
				nPos = szContent.indexOf("　");
			}

			nPos = szContent.indexOf("\t");
			while (nPos !== -1) {
				szContent = utils.strReplaceAtPos(szContent, nPos, 1, " ");
				nPos = szContent.indexOf("\t");
			}

			nPos = szContent.indexOf(szKeyWord);

			if (-1 !== nPos) {
				szContent = utils.strInsert(szContent, nPos + 1, " ");

				nPos = szContent.indexOf("  ");

				while (-1 !== nPos) {
					szContent = utils.strReplaceAtPos(szContent, nPos, 2, " ");

					nPos = szContent.indexOf("  ");
				}
			}

			this.replaceLine(nLine, szContent);
		});
	}

	// TODO: align number
	// FIXME: sometimes lose "1" in "12" and so on
	public numberContents() {
		let nPos = 0;
		let iterator = this._mapContents.entries();
		let r: IteratorResult<[number, contentData_t]>;

		while (r = iterator.next(), !r.done) {
			let [nLine, value] = r.value;
			let szKeyWord = value.szKeyWord;
			let szContent = value.szContent;
			szContent = szContent.trim();

			let nLastpos = szContent.indexOf(szKeyWord);

			if (nLastpos === -1) { return; }

			let szNumber = szContent.substr(1, nLastpos - 1);

			if ("十" === szNumber) {
				szNumber = "10";

				szContent = utils.strReplaceAtPos(szContent, 1, nLastpos - 1, szNumber);

				this.replaceLine(nLine, szContent);
				continue;
			}

			if ("十" === szNumber.substr(0, 1)) {
				szNumber = utils.strReplaceAtPos(szNumber, 0, 1, "1");
			}

			nPos = szNumber.indexOf("0");
			while (nPos !== -1) {
				szNumber = utils.strReplaceAtPos(szNumber, nPos, 1, "零");

				nPos = szNumber.indexOf("0");
			}

			nPos = szNumber.indexOf("o");
			while (nPos !== -1) {
				szNumber = utils.strReplaceAtPos(szNumber, nPos, 1, "零");

				nPos = szNumber.indexOf("o");
			}

			let szLast = szNumber.substr(nLastpos - 2, 1);

			if ("十" === szLast) {
				szNumber = utils.strReplaceAtPos(szNumber, nLastpos - 2, 1, "0");
			} else if (szLast === "百") {
				szNumber = utils.strReplaceAtPos(szNumber, nLastpos - 2, 1, "00");
			} else if (szLast === "千") {
				szNumber = utils.strReplaceAtPos(szNumber, nLastpos - 2, 1, "000");
			}

			nPos = szNumber.indexOf("十零");
			if (nPos !== -1) {
				szNumber = utils.strErase(szNumber, nPos, 2);
			}

			nPos = szNumber.indexOf("十");
			if (nPos !== -1) {
				szNumber = utils.strErase(szNumber, nPos, 1);
			}

			nPos = szNumber.indexOf("百零");
			if (nPos !== -1) { szNumber = utils.strReplaceAtPos(szNumber, nPos, 2, "0"); }

			nPos = szNumber.indexOf("百");
			if (nPos !== -1) { szNumber = szNumber = utils.strErase(szNumber, nPos, 1); }

			nPos = szNumber.indexOf("千零");
			if (nPos !== -1) {
				if (nLastpos - nPos <= 4) { szNumber = utils.strReplaceAtPos(szNumber, nPos, 2, "00"); }
				else { szNumber = utils.strReplaceAtPos(szNumber, nPos, 2, "0"); }
			}

			nPos = szNumber.indexOf("千");
			if (nPos !== -1) { szNumber = szNumber = utils.strErase(szNumber, nPos, 1); }

			let szLefts = "一二三四五六七八九零";
			let szRights = "1234567890";

			let szLeft, szRight;

			for (let i = 0; i < 10; i++) {

				szLeft = szLefts.substr(i, 1);
				szRight = szRights.substr(i, 1);

				nPos = szNumber.indexOf(szLeft);

				while (nPos !== -1) {
					szNumber = utils.strReplaceAtPos(szNumber, nPos, 1, szRight);

					nPos = szNumber.indexOf(szLeft);

				}
			}

			// remove left banks
			szContent = utils.strReplaceAtPos(szContent, 1, nLastpos - 1, szNumber);

			this.replaceLine(nLine, szContent);
		}
	}

	// TODO: wait to test
	public delDuplicateContents() {
		let nLineInterval = 0;
		let iterator = this._mapContents.entries();
		let r: IteratorResult<[number, contentData_t]>;

		while (r = iterator.next(), !r.done) {
			let [nLine1, content1] = r.value;

			let r2 = iterator.next();
			let [nLine2, content2] = r2.value;

			if (content1.szContent === content2.szContent) {
				this.delLine(nLine1);
			}
		}
	}

	// TODO
	// 1. exclusive level 2 up content	
	// 2. Delete not empty content's empty mark
	// 3. print a to-do list
	public markEmptyContents() {
		let nLineInterval = 0;
		let iterator = this._mapContents.entries();
		let r: IteratorResult<[number, contentData_t]>;

		while (r = iterator.next(), !r.done) {
			let [nLine1, content1] = r.value;
			let szContent1 = content1.szContent;
			let nLevel1 = content1.nLevel;
			if (szContent1.endsWith("+")) {
				continue;
			}
			let r2 = iterator.next();
			let [nLine2, content2] = r2.value;
			let nLevel2 = content1.nLevel;

			nLineInterval = nLine2 - nLine1;
			if (nLineInterval <= 5 && nLevel1 >= nLevel2) {
				szContent1 += "+";
				this.replaceLine(nLine1, szContent1);
			}
		}
	}

	// TODO: wait to test
	public updateContents() {
		let bFistLineIndexed = false;
		this._mapContents.forEach((value: contentData_t, key: number) => {
			let nLine = key;
			let szContentName = value.szContent;
			if (1 === nLine) { bFistLineIndexed = true; }
			this.replaceLine(nLine, szContentName);
		});
	}

	get mapContents(): Map<number, contentData_t> {
		return this._mapContents;
	}

	set mapContents(value: Map<number, contentData_t>) {
		this._mapContents = value;
	}

	// TODO
	public replaceInBody(szSrc: string, wszDes: string, bRegExp = true) {

	}

	// TODO
	public replaceInContents(wszSrc: string, wszDes: string, bRegExp = true) {

	}

	// TODO: wait to test
	public exportContents(szFile: string) {
		let fd = fs.openSync(szFile, "w+");

		this._mapContents.forEach((value: contentData_t, key: number) => {
			let nLine = key;
			let szContent = value.szContent;
			fs.writeSync(fd, String(nLine));
			fs.writeSync(fd, "\t");
			fs.writeSync(fd, szContent);
			fs.writeSync(fd, "\n");
		});

		fs.closeSync(fd);
	}

	// TODO: wait to test
	public importContents(szFile: string) {
		this._mapContents.clear();

		let buf = Buffer.alloc(1024);
		fs.open(szFile, 'r+', function (err, fd) {
			if (err) {
				return console.error(err);
			}

			fs.read(fd, buf, 0, buf.length, 0, function (err, bytes) {
				if (err) {
					console.log(err);
				}

				// 仅输出读取的字节
				if (bytes > 0) {
					console.log(buf.slice(0, bytes).toString());
				}

				// 关闭文件
				fs.close(fd, function (err) {
					if (err) {
						console.log(err);
					}
					console.log("文件关闭成功");
				});
			});
		});
	}
};
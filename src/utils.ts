// utils.ts
import * as path from 'path';

export function strReplaceAtPos(szString: string, index: number, len: number, szReplace: string) {
    return szString.substring(0, index) + szReplace + szString.substring(index + len);
}

export function strErase(szString: string, index: number, len: number) {
    return szString.substring(0, index) + szString.substring(index + len);
}

export function strInsert(szString: string, index: number, szInsert: string) {
    return szString.substring(0, index) + szInsert + szString.substring(index + 1);
}

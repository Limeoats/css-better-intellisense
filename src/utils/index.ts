import { TextDocument, Position, window } from "vscode";
import { promises as fs } from "fs";
import * as p from "path";

const genImportRegExp = (key: string): RegExp => {
    const file = "(.+\\.(\\S{1,2}ss|stylus|styl))";
    const fromOrRequire = "(?:from\\s+|=\\s+require(?:<any>)?\\()";
    const requireEndOptional = "\\)?";
    const pattern = `\\s${key}\\s+${fromOrRequire}["']${file}["']${requireEndOptional}`;
    return new RegExp(pattern);
};

export const getCurrentLine = (document: TextDocument, position: Position): string => {
    return document.lineAt(position).text;
};

export const getWords = (line: string, position: Position): string => {
    const text = line.slice(0, position.character);
    const convertText = text.replace(/(\?\.)/g, ".");
    const index = convertText.search(/[a-zA-Z0-9._]*$/);
    if (index === -1) {
        return "";
    }
    return convertText.slice(index);
};

export const findImportModule = (text: string, key: string): string => {
    const re = genImportRegExp(key);
    const results = re.exec(text);
    if (!!results && results.length > 0) {
        return results[1];
    } else {
        return "";
    }
};

export const readModuleFile = async (
    filePath: string,
    currentDir: string
): Promise<string> => {
    const realPath = p.resolve(currentDir, filePath);
    const contents = await fs.readFile(realPath, "utf-8");
    return contents;
};

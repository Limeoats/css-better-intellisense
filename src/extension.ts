// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getCurrentLine, getWords, findImportModule, readModuleFile } from "./utils";
import * as path from "path";

const triggerBeforeCurrentWord = (
    document: vscode.TextDocument,
    position: vscode.Position
): boolean => {
    const range = document.getWordRangeAtPosition(position);
    if (!range) {
        return false;
    }
    const previousCharRange = new vscode.Range(range.start.translate(0, -1), range.start);
    const previousChar = document.getText(previousCharRange);
    if (previousChar === ".") {
        return true;
    }
    return false;
};

const isStyle = (document: vscode.TextDocument, position: vscode.Position): boolean => {
    const line = getCurrentLine(document, position);
    const word = document.getText(document.getWordRangeAtPosition(position));
    const x = triggerBeforeCurrentWord(document, position);
    return true;
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log(
        'Congratulations, your extension "css-better-intellisense" is now active!'
    );

    let disposable = vscode.languages.registerHoverProvider("typescriptreact", {
        async provideHover(document, position, token) {
            // const word = document.getText(document.getWordRangeAtPosition(position));
            // const importModule = findImportModule(document.getText(), )
            const r = document.getWordRangeAtPosition(position)?.end;
            if (!r) {
                return;
            }
            const line = getCurrentLine(document, position);
            const words = getWords(line, r);
            if (words === "" || words.indexOf(".") === -1) {
                return;
            }
            const [obj, field] = words.split(".");
            const importModule = findImportModule(document.getText(), obj);
            if (importModule === "") {
                return;
            }

            // Get the contents of the related module file
            const contents = await readModuleFile(
                importModule,
                path.dirname(document.uri.fsPath)
            );

            // Find the specific class being referenced
            const cbegin = contents.indexOf(`.${field}`);
            const cend = contents.indexOf("}", cbegin);
            const text = contents.substring(cbegin, cend + 1);

            const formatted = "```css\n" + text + "\n```";
            return new vscode.Hover(formatted);
        },
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

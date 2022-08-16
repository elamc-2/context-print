import { Position, TextEditor, window } from "vscode";
import { Point, SyntaxNode as ParserSyntaxNode } from "web-tree-sitter";
import type { SyntaxNode, NodeTypeDefaults } from "./types";
import * as path from 'path';

export const nodeLocationBuilder = (node: ParserSyntaxNode): string => { 
    const editor = window.activeTextEditor;
    return path.basename(editor!.document.fileName, '.py') + "." + node.startPosition.row;
};

export const insertAtPosition = (editor: TextEditor, treeIter: SyntaxNode[]): void => {
    const pos = editor.selection.active;
    const input = "print('" + Array.from(
        treeIter, node => `${node.type.substring(0, node.type.indexOf('_'))}:(${node.text})@${node.location}`
    ).join("/") + "')";

    editor.edit((editBuilder: any) => {
        editBuilder.insert(pos, input);
    });
};

export const isBetween = (cursorStart: Point, cursorEnd: Point): boolean => {
    const startPosAsNative = new Position(cursorStart.row, cursorStart.column);
    const endPosAsNative = new Position(cursorEnd.row, cursorEnd.column);

    const editorPos: Position = window.activeTextEditor!.selection.active;
    if (editorPos.isBefore(endPosAsNative) && editorPos.isAfter(startPosAsNative)) {
        return true;
    }
    return false;
};

export const isOfTypeDefaults = (type: string): type is NodeTypeDefaults => {
    return [
        'function_definition',
        'class_definition',
        'if_statement',
        'elif_clause',
        'else_clause',
        'for_statement',
        'while_statement'
    ].includes(type);
};


import * as vscode from 'vscode';
import * as Parser from "web-tree-sitter";
import { TreeCursor } from 'web-tree-sitter';
import type { SyntaxNode, Language } from './types';
import { insertAtPosition, isBetween, isOfTypeDefaults, nodeLocationBuilder } from './util';


const language: Language = {
	module: "tree-sitter-python",
};

class TreeIterator {
	protected cursor;

	constructor(cursor: TreeCursor) {
		this.cursor = cursor;
	}

	protected createNode(): SyntaxNode {
		const thisNode = this.cursor.currentNode();
		return {
			type: this.cursor.nodeType,
			text: thisNode.childForFieldName('name')?.text || thisNode.childForFieldName('condition')?.text || null,
			location: nodeLocationBuilder(thisNode),
		};
	}

	public *[Symbol.iterator]() {
		const constructor: any = this.constructor;

		if (this.cursor.nodeIsNamed
			&& isOfTypeDefaults(this.cursor.nodeType)
			&& isBetween(this.cursor.startPosition, this.cursor.endPosition)
		) {
			yield this.createNode() as SyntaxNode;
		}

		if (this.cursor.gotoFirstChild()) {
			yield* new constructor(this.cursor);

			while (this.cursor.gotoNextSibling()) {
				yield* new constructor(this.cursor);
			}

			this.cursor.gotoParent();
		}

	}
}

const initParser = Parser.init();

export function activate(context: vscode.ExtensionContext) {

	const loadLang = async (): Promise<boolean> => {

		const uri: vscode.Uri = vscode.Uri.joinPath(
			context.extensionUri,
			language.module + '.wasm'
		);

		const lang = await Parser.Language.load(uri.path);
		const parser = new Parser();
		parser.setLanguage(lang);

		language.parser = parser;
		return true;
	};

	const init = async () => {
		await initParser;

		if (!(await loadLang())) {
			return;
		}

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const tree = language.parser!.parse(editor.document.getText());
		const treeIter = new TreeIterator(tree.walk());
		insertAtPosition(editor, [...treeIter]);
	};

	let disposable = vscode.commands.registerCommand('context-print.addContextPrint', () => {
		init();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }

import * as Parser from "web-tree-sitter";

export interface Language {
	module: string;
	parser?: Parser;
}

export interface SyntaxNode {
	type: string;
	text: string | null;
	[key: string]: unknown;
}

export type NodeTypeDefaults = 'function_definition' | 'class_definition' | 'if_statement' | 'elif_clause' | 'else_clause' | 'for_statement' | 'while_statement';


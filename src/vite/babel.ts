import type { types as Babel } from "@babel/core"
import generate from "@babel/generator"
import { type ParseResult, parse } from "@babel/parser"
/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { NodePath } from "@babel/traverse"
import traverse from "@babel/traverse"
import * as t from "@babel/types"

export { traverse, generate, parse, t }
export type { Babel, NodePath, ParseResult }

#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const captain_1 = require("./captain");
const roo_1 = require("../roo");
const program = new commander_1.Command();
const roo = new roo_1.Roo();
const captain = new captain_1.Captain();
program
    .name('roo')
    .description('Roo CLI - Project Orchestration and Task Management')
    .version('1.0.0');
(0, captain_1.setupCaptainCommands)(program, roo);
program.parse(process.argv);
//# sourceMappingURL=index.js.map
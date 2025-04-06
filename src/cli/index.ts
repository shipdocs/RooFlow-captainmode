#!/usr/bin/env node
import { Command } from 'commander';
import { setupCaptainCommands, Captain } from './captain';
import { Roo } from '../roo';

const program = new Command();
const roo = new Roo();
const captain = new Captain();

program
    .name('roo')
    .description('Roo CLI - Project Orchestration and Task Management')
    .version('1.0.0');

setupCaptainCommands(program, roo);

program.parse(process.argv);
import {strict as assert} from 'node:assert';import {test} from 'node:test';import {validPhone,validDate,validUuid,transitions} from '../lib/rules.ts';
test('UAE phone validation',()=>{assert.equal(validPhone('0501234567'),true);assert.equal(validPhone('+971501234567'),true);assert.equal(validPhone('123'),false)});
test('dates reject past and impossible values',()=>{assert.equal(validDate('2000-01-01'),false);assert.equal(validDate('2099-02-31'),false);assert.equal(validDate('2099-02-01'),true)});
test('terminal and acceptance workflow',()=>{assert.deepEqual(transitions.completed,[]);assert.deepEqual(transitions.cancelled,[]);assert.equal(transitions.quoted.includes('scheduled'),false);assert.equal(transitions.accepted.includes('scheduled'),true)});
test('request identifiers validate strictly',()=>{assert.equal(validUuid(crypto.randomUUID()),true);assert.equal(validUuid("' OR 1=1"),false)});

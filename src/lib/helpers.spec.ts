// tslint:disable:no-expression-statement
import test from 'ava'
import {template} from './helpers'

test('template 1', (t) => {
  t.is(template('Hello {me}', {me: 'world'}), 'Hello world')
})

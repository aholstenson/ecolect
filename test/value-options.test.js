import { expect } from 'chai';

import lang from '../src/language/en';
import Builder from '../src/resolver/builder';

import { options, dateInterval } from '../src/values';

describe('Value: Options', function() {

	describe('Single option - no value', () => {
		const queryOptions = options()
			.option('deadline')
				.add('with deadline')
				.done()
			.build();

		const resolver = new Builder(lang)
			.value('queryOptions', queryOptions)
			.add('Things {queryOptions}')
			.build();

		it('Full match', () => {
			return resolver.match('things with deadline', { partial: false })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v = r.best.values.queryOptions[0];
					expect(v.option).to.equal('deadline');
					expect(v.values).to.deep.equal({});
				});
		});

		it('Partial match', () => {
			return resolver.match('things with d', { partial: true })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v = r.best.values.queryOptions[0];
					expect(v.option).to.equal('deadline');
					expect(v.values).to.deep.equal({});
				});
		});
	});

	describe('With values', () => {
		const queryOptions = options({ min: 1 })
			.option('deadline')
				.value('deadline', dateInterval())
				.add('with deadline {deadline}')
				.add('deadline {deadline}')
				.done()
			.option('completed')
				.value('completed', dateInterval())
				.add('completed {completed}')
				.done()
			.build();

		const resolver = new Builder(lang)
			.value('queryOptions', queryOptions)
			.add('Things {queryOptions}')
			.build();

		it('Full match', () => {
			return resolver.match('things with deadline jan 12th', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v = r.best.values.queryOptions[0];
					expect(v.option).to.equal('deadline');
					expect(v.values).to.deep.equal({
						deadline: {
							start: { period: 'day', year: 2018, month: 0, day: 12 },
							end: { period: 'day', year: 2018, month: 0, day: 12 }
						}
					});
				});
		});

		it('Multiple options', () => {
			return resolver.match('things with deadline jan 12th and completed today', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v0 = r.best.values.queryOptions[0];
					expect(v0.option).to.equal('deadline');
					expect(v0.values).to.deep.equal({
						deadline: {
							start: { period: 'day', year: 2018, month: 0, day: 12 },
							end: { period: 'day', year: 2018, month: 0, day: 12 }
						}
					});

					const v1 = r.best.values.queryOptions[1];
					expect(v1.option).to.equal('completed');
					expect(v1.values).to.deep.equal({
						completed: {
							start: { period: 'day', year: 2018, month: 0, day: 2 },
							end: { period: 'day', year: 2018, month: 0, day: 2 }
						}
					});
				});
		});
	});

	describe('With custom values', () => {
		const values = [
			'one',
			'two',
			'three',
			'four five'
		];

		const queryOptions = options({ min: 1 })
			.option('value')
				.value('name', function(encounter) {
					let text = encounter.text();
					if(encounter.partial) {
						for(const v of values) {
							if(v.indexOf(text) === 0) {
								encounter.match(v);
							}
						}
					} else {
						if(values.indexOf(text) >= 0) {
							encounter.match(text);
						}
					}
				})
				.add('named {name}')
				.done()
			.option('completed')
				.value('completed', dateInterval())
				.add('completed {completed}')
				.done()
			.build();

		const resolver = new Builder(lang)
			.value('queryOptions', queryOptions)
			.add('Things {queryOptions}')
			.build();

		it('Full match', () => {
			return resolver.match('things named one', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.queryOptions).to.be.instanceOf(Array);

					const v = r.best.values.queryOptions[0];
					expect(v.option).to.equal('value');
					expect(v.values).to.deep.equal({
						name: 'one'
					});
				});
		});

	});

});
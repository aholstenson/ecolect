import { en } from '../src/language/en';
import { ResolverBuilder } from '../src/resolver/ResolverBuilder';

import { optionsValue, dateIntervalValue, enumerationValue, customValue } from '../src/values';

describe('Value: Options', function() {

	/*
	describe('Standalone option: No values', () => {
		const matcher = optionsValue()
			.option('deadline')
				.add('with deadline')
				.done()
			.build()
			.matcher(en);

		it('with deadline [partial=false]', () => matcher('with deadline')
			.then(v => {
				expect(v).toEqual([
					{
						option: 'deadline',
						values: {},
					}
				]);

				expect(v[0].expression).toEqual([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 13 }
					}
				]);
			})
		);

		it('with deadline [partial=true]', () => matcher('with deadline', { partial: true })
			.then(v => {
				expect(v).toEqual([
					{
						option: 'deadline',
						values: {},
					}
				]);

				expect(v[0].expression).toEqual([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 13 }
					}
				]);
			})
		);

		it('with [partial=true]', () => matcher('with', { partial: true })
			.then(v => {
				expect(v).toEqual([
					{
						option: 'deadline',
						values: {},
					}
				]);

				expect(v[0].expression).toEqual([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 4 }
					}
				]);
			})
		);

		it('with d [partial=true]', () => matcher('with d', { partial: true })
			.then(v => {
				expect(v).toEqual([
					{
						option: 'deadline',
						values: {},
					}
				]);

				expect(v[0].expression).toEqual([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 6 }
					}
				]);
			})
		);

		it('with deadline and wi [partial=true]', () => matcher('with deadline and wi', { partial: true })
			.then(v => {
				expect(v).toEqual([
					{
						option: 'deadline',
						values: {},
					},
					{
						option: 'deadline',
						values: {}
					}
				]);

				expect(v[0].expression).toEqual([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 0, end: 13 }
					}
				]);

				expect(v[1].expression).toEqual([
					{
						type: 'text',
						value: 'with deadline',
						source: { start: 18, end: 20 }
					}
				]);
			})
		);
	});

	describe('Standalone option: With value', () => {
		const matcher = optionsValue()
			.option('deadline')
				.value('deadline', dateIntervalValue())
				.add('with deadline {deadline}')
				.done()
			.build()
			.matcher(en);

		it('with deadline [partial=false]', () => matcher('with deadline jan 12th', { now: new Date(2010, 0, 1) })
			.then(v => {
				expect(v).not.toBeNull();
				expect(v.length).toEqual(1);

				const a = v[0];
				expect(a.option).toEqual('deadline');
				expect(a.values.deadline).toEqual({
					start: { period: 'day', year: 2010, month: 0, day: 12 },
					end: { period: 'day', year: 2010, month: 0, day: 12 }
				});
			})
		);

		it('with deadline [partial=true]', () => matcher('with deadline', { partial: true })
			.then(v => {
				expect(v).not.toBeNull();
				expect(v.length).toEqual(1);

			})
		);
	});
	*/

	describe('Single option - no value', () => {
		const queryOptions = optionsValue()
			.option('deadline')
				.add('with deadline')
				.done()
			.build();

		const resolver = new ResolverBuilder(en)
			.value('queryOptions', queryOptions)
			.add('Things {queryOptions}')
			.build();

		it('Full match', () => {
			return resolver.match('things with deadline', { partial: false })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.best.values.get('queryOptions')).toBeInstanceOf(Array);

					const v = r.best.values.get('queryOptions')[0];
					expect(v.option).toEqual('deadline');
					expect(v.values).toEqual(new Map());
				});
		});

		it('Partial match', () => {
			return resolver.match('things with d', { partial: true })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.best.values.get('queryOptions')).toBeInstanceOf(Array);

					const v = r.best.values.get('queryOptions')[0];
					expect(v.option).toEqual('deadline');
					expect(v.values).toEqual(new Map());
				});
		});
	});

	describe('With values', () => {
		const queryOptions = optionsValue()
			.option('deadline')
				.value('deadline', dateIntervalValue())
				.add('with deadline {deadline}')
				.add('deadline {deadline}')
				.done()
			.option('completed')
				.value('completed', dateIntervalValue())
				.add('completed {completed}')
				.done()
			.build();

		const resolver = new ResolverBuilder(en)
			.value('queryOptions', queryOptions)
			.add('Things {queryOptions}')
			.build();

		it('Full match', () => {
			return resolver.match('things with deadline jan 12th', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.best.values.get('queryOptions')).toBeInstanceOf(Array);

					const v = r.best.values.get('queryOptions')[0];
					expect(v.option).toEqual('deadline');
					expect(v.values.get('deadline')).toEqual({
						start: { period: 'day', year: 2018, month: 0, day: 12 },
						end: { period: 'day', year: 2018, month: 0, day: 12 }
					});
				});
		});

		it('Multiple options', () => {
			return resolver.match('things with deadline jan 12th and completed today', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.best.values.get('queryOptions')).toBeInstanceOf(Array);

					const v0 = r.best.values.get('queryOptions')[0];
					expect(v0.option).toEqual('deadline');
					expect(v0.values.get('deadline')).toEqual({
						start: { period: 'day', year: 2018, month: 0, day: 12 },
						end: { period: 'day', year: 2018, month: 0, day: 12 }
					});

					const v1 = r.best.values.get('queryOptions')[1];
					expect(v1.option).toEqual('completed');
					expect(v1.values.get('completed')).toEqual({
						start: { period: 'day', year: 2018, month: 0, day: 2 },
						end: { period: 'day', year: 2018, month: 0, day: 2 }
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

		const queryOptions = optionsValue()
			.option('value')
				.value('name', customValue(async function(encounter) {
					let text = encounter.text;
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
				}))
				.add('named {name}')
				.done()
			.option('completed')
				.value('completed', dateIntervalValue())
				.add('completed {completed}')
				.add('c {completed}')
				.done()
			.build();

		const resolver = new ResolverBuilder(en)
			.value('queryOptions', queryOptions)
			.add('Things {queryOptions}')
			.build();

		const resolver2 = new ResolverBuilder(en)
			.value('enum', enumerationValue([ 'test', 'abc' ]))
			.value('queryOptions', queryOptions)
			.add('{enum} {queryOptions}')
			.build();

		it('Full match', () => {
			return resolver.match('things named one', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.best.values.get('queryOptions')).toBeInstanceOf(Array);

					const v = r.best.values.get('queryOptions')[0];
					expect(v.option).toEqual('value');
					expect(v.values.get('name')).toEqual('one');
				});
		});

		it('Partial match: thing', () => {
			return resolver.match('thing', { partial: true, now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.best.values.get('queryOptions')).toBeInstanceOf(Array);

					const v = r.best.values.get('queryOptions')[0];
					expect(v.option).toEqual('value');

					const v2 = r.matches[1].values.get('queryOptions')[0];
					expect(v2.option).toEqual('completed');
				});
		});

		it('Partial match: thing com', () => {
			return resolver.match('thing com', { partial: true, now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.best.values.get('queryOptions')).toBeInstanceOf(Array);

					const v = r.best.values.get('queryOptions')[0];
					expect(v.option).toEqual('completed');
				});
		});

		it('Partial match: thing completed ja', () => {
			return resolver.match('thing completed ja', { partial: true, now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.best.values.get('queryOptions')).toBeInstanceOf(Array);

					const v = r.best.values.get('queryOptions')[0];
					expect(v.option).toEqual('completed');
				});
		});

		it('Match with enum first', () => {
			return resolver2.match('test named one', { now: new Date(2018, 0, 2) })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.best.values.get('queryOptions')).toBeInstanceOf(Array);

					const v = r.best.values.get('queryOptions')[0];
					expect(v.option).toEqual('value');
					expect(v.values.get('name')).toEqual('one');
				});
		});

		it('Partial match with enum first', () => {
			return resolver2.match('test named one', { now: new Date(2018, 0, 2), partial: true })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.matches.length).toEqual(1);
				});
		});

		it('Partial match with enum first', () => {
			return resolver2.match('test n', { now: new Date(2018, 0, 2), partial: true })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.matches.length).toEqual(1);

					expect(r.best.values.get('queryOptions')).toEqual([
						{
							option: 'value',
							values: new Map()
						}
					]);
				});
		});

		it('Partial match with enum first', () => {
			return resolver2.match('test', { now: new Date(2018, 0, 2), partial: true })
				.then(r => {
					expect(r.best).not.toBeNull();
					expect(r.matches.length).toEqual(2);
				});
		});

	});

});
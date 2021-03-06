import { Language } from '@ecolect/language';

import { ActionsBuilder } from './ActionsBuilder';
import { IntentsBuilder } from './IntentsBuilder';

export * from './matching';
export * from './resolver/expression';

export * from './resolver/Phrases';
export * from './resolver/newPhrases';
export * from './resolver/PhrasesBuilder';

export * from './values';

export * from './IntentsBuilder';
export * from './ActionsBuilder';

export function intentsBuilder(lang: Language) {
	return new IntentsBuilder(lang);
}

export function actionsBuilder<Context, ReturnType>(lang: Language) {
	return new ActionsBuilder<Context, ReturnType>(lang);
}

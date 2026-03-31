import { Extension } from '@tiptap/core';

export interface CommandsOptions {
  suggestionComponent: any;
}

export default Extension.create<CommandsOptions>({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestionComponent: null,
    };
  },
});

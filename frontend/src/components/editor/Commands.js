import { Extension } from '@tiptap/core';

export default Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestionComponent: null,
    };
  },
});

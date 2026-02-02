import Store from 'electron-store';

const store = new Store({
  defaults: {
    config: {
      apiKey: '',
      baseURL: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      maxTokens: 512,
      temperature: 0.3,
    },
    history: [],
  },
});

export { store };

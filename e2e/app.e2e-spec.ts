import { FractalRendererPage } from './app.po';

describe('fractal-renderer App', () => {
  let page: FractalRendererPage;

  beforeEach(() => {
    page = new FractalRendererPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});

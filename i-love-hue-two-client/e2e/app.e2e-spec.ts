import { ILoveHueTwoClientPage } from './app.po';

describe('i-love-hue-two-client App', () => {
  let page: ILoveHueTwoClientPage;

  beforeEach(() => {
    page = new ILoveHueTwoClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

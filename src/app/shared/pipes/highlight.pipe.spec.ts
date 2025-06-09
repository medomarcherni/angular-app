import { HighlightPipe } from './highlight.pipe';

describe('HighlightPipe', () => {
  let pipe: HighlightPipe;

  beforeEach(() => {
    pipe = new HighlightPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return original value when searchText is empty', () => {
    const input = 'Hello World';
    const searchText = '';
    const result = pipe.transform(input, searchText);
    expect(result).toBe(input);
  });

  it('should return original value when value is empty', () => {
    const input = '';
    const searchText = 'hello';
    const result = pipe.transform(input, searchText);
    expect(result).toBe(input);
  });

  it('should highlight single match', () => {
    const input = 'Hello World';
    const searchText = 'Hello';
    const result = pipe.transform(input, searchText);
    expect(result).toBe('<span class="highlight">Hello</span> World');
  });

  it('should highlight multiple matches', () => {
    const input = 'Hello hello world';
    const searchText = 'hello';
    const result = pipe.transform(input, searchText);
    expect(result).toBe('<span class="highlight">Hello</span> <span class="highlight">hello</span> world');
  });

  it('should be case insensitive', () => {
    const input = 'Hello hElLo world';
    const searchText = 'hello';
    const result = pipe.transform(input, searchText);
    expect(result).toBe('<span class="highlight">Hello</span> <span class="highlight">hElLo</span> world');
  });

  it('should handle special regex characters in search text', () => {
    const input = 'This is a test (with parentheses)';
    const searchText = '(with';
    const result = pipe.transform(input, searchText);
    expect(result).toBe('This is a test <span class="highlight">(with</span> parentheses)');
  });

  it('should not modify string when no matches found', () => {
    const input = 'This is a test string';
    const searchText = 'nothing';
    const result = pipe.transform(input, searchText);
    expect(result).toBe(input);
  });
});
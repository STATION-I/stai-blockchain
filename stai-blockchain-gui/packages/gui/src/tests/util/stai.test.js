const stai = require('../../util/stai');

describe('stai', () => {
  it('converts number mojo to stai', () => {
    const result = stai.mojo_to_stai(1000000);

    expect(result).toBe(0.000001);
  });
  it('converts string mojo to stai', () => {
    const result = stai.mojo_to_stai('1000000');

    expect(result).toBe(0.000001);
  });
  it('converts number mojo to stai string', () => {
    const result = stai.mojo_to_stai_string(1000000);

    expect(result).toBe('0.000001');
  });
  it('converts string mojo to stai string', () => {
    const result = stai.mojo_to_stai_string('1000000');

    expect(result).toBe('0.000001');
  });
  it('converts number stai to mojo', () => {
    const result = stai.stai_to_mojo(0.000001);

    expect(result).toBe(1000000);
  });
  it('converts string stai to mojo', () => {
    const result = stai.stai_to_mojo('0.000001');

    expect(result).toBe(1000000);
  });
  it('converts number mojo to colouredcoin', () => {
    const result = stai.mojo_to_colouredcoin(1000000);

    expect(result).toBe(1000);
  });
  it('converts string mojo to colouredcoin', () => {
    const result = stai.mojo_to_colouredcoin('1000000');

    expect(result).toBe(1000);
  });
  it('converts number mojo to colouredcoin string', () => {
    const result = stai.mojo_to_colouredcoin_string(1000000);

    expect(result).toBe('1,000');
  });
  it('converts string mojo to colouredcoin string', () => {
    const result = stai.mojo_to_colouredcoin_string('1000000');

    expect(result).toBe('1,000');
  });
  it('converts number colouredcoin to mojo', () => {
    const result = stai.colouredcoin_to_mojo(1000);

    expect(result).toBe(1000000);
  });
  it('converts string colouredcoin to mojo', () => {
    const result = stai.colouredcoin_to_mojo('1000');

    expect(result).toBe(1000000);
  });
});

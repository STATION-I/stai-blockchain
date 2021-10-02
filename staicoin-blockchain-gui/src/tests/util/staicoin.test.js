const staicoin = require('../../util/staicoin');

describe('staicoin', () => {
  it('converts number mojo to staicoin', () => {
    const result = staicoin.mojo_to_staicoin(1000000);

    expect(result).toBe(0.000001);
  });
  it('converts string mojo to staicoin', () => {
    const result = staicoin.mojo_to_staicoin('1000000');

    expect(result).toBe(0.000001);
  });
  it('converts number mojo to staicoin string', () => {
    const result = staicoin.mojo_to_staicoin_string(1000000);

    expect(result).toBe('0.000001');
  });
  it('converts string mojo to staicoin string', () => {
    const result = staicoin.mojo_to_staicoin_string('1000000');

    expect(result).toBe('0.000001');
  });
  it('converts number staicoin to mojo', () => {
    const result = staicoin.staicoin_to_mojo(0.000001);

    expect(result).toBe(1000000);
  });
  it('converts string staicoin to mojo', () => {
    const result = staicoin.staicoin_to_mojo('0.000001');

    expect(result).toBe(1000000);
  });
  it('converts number mojo to colouredcoin', () => {
    const result = staicoin.mojo_to_colouredcoin(1000000);

    expect(result).toBe(1000);
  });
  it('converts string mojo to colouredcoin', () => {
    const result = staicoin.mojo_to_colouredcoin('1000000');

    expect(result).toBe(1000);
  });
  it('converts number mojo to colouredcoin string', () => {
    const result = staicoin.mojo_to_colouredcoin_string(1000000);

    expect(result).toBe('1,000');
  });
  it('converts string mojo to colouredcoin string', () => {
    const result = staicoin.mojo_to_colouredcoin_string('1000000');

    expect(result).toBe('1,000');
  });
  it('converts number colouredcoin to mojo', () => {
    const result = staicoin.colouredcoin_to_mojo(1000);

    expect(result).toBe(1000000);
  });
  it('converts string colouredcoin to mojo', () => {
    const result = staicoin.colouredcoin_to_mojo('1000');

    expect(result).toBe(1000000);
  });
});

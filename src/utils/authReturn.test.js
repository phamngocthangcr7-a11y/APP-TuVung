import { readAuthReturn, signInLinkMessage } from './authReturn';

test('shows an expired-link error and removes authentication data from the URL', () => {
  const result = readAuthReturn('https://example.test/?view=study#error=access_denied&error_code=otp_expired&error_description=Details');
  expect(result).toEqual({ errorCode: 'otp_expired', cleanUrl: '/?view=study' });
  expect(signInLinkMessage(result.errorCode)).toMatch(/hết hạn hoặc đã được dùng/);
});

test('keeps ordinary URLs and removes access and refresh tokens from successful redirects', () => {
  expect(readAuthReturn('https://example.test/?view=study#heading')).toBeNull();
  expect(readAuthReturn('https://example.test/#access_token=test&refresh_token=test&type=magiclink')).toEqual({
    errorCode: null, cleanUrl: '/'
  });
});

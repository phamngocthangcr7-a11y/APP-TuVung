const authKeys = [
  'access_token', 'refresh_token', 'expires_in', 'expires_at', 'token_type',
  'provider_token', 'provider_refresh_token', 'error', 'error_code', 'error_description',
  'code', 'flow_id', 'type'
];

export function readAuthReturn(href) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const get = key => hash.get(key) ?? url.searchParams.get(key);
  if (!['access_token', 'refresh_token', 'error', 'error_code', 'error_description', 'code'].some(get)) return null;
  const errorCode = get('error_code');
  for (const key of authKeys) {
    hash.delete(key);
    url.searchParams.delete(key);
  }
  url.hash = hash.toString();
  return { errorCode, cleanUrl: url.pathname + url.search + url.hash };
}

export function signInLinkMessage(errorCode) {
  if (errorCode === 'otp_expired' || errorCode === 'flow_state_expired' || errorCode === 'flow_state_not_found') {
    return 'Liên kết đã hết hạn hoặc đã được dùng. Hãy yêu cầu email mới hoặc nhập mã trong email mới nhất.';
  }
  return 'App chưa xác thực được liên kết này. Hãy mở email mới nhất trong trình duyệt bạn dùng để học hoặc nhập mã xác nhận.';
}

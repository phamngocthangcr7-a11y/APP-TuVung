import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import App from './App';
import EntryDialog from './components/EntryDialog';
import { setNotebookAccount, withGuestNotebook } from './utils/notebookStorage';
import { syncNotebook } from './utils/notebookSync';
import { exportAllDataAsJSON, importDataFromJSON } from './utils/storage';
import { readAuthReturn, signInLinkMessage } from './utils/authReturn';

// The publishable key is safe to ship in the browser. Other deployments can
// supply their own project through build-time environment variables.
const isProductionSite = typeof window !== 'undefined' &&
  window.location.origin === 'https://app-tu-vung-weld.vercel.app';
const productionUrl = 'https://apmmaxhugqhnqhlzvuex.supabase.co';
const productionKey = 'sb_publishable_69TI1csbyCq-PrXE6rrSHw_2Vu205gj';
const customUrl = process.env.REACT_APP_SUPABASE_URL;
const customKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;
const authReturn = typeof window !== 'undefined' ? readAuthReturn(window.location.href) : null;
const client = customUrl && customKey ? createClient(customUrl, customKey)
  : isProductionSite ? createClient(productionUrl, productionKey) : null;
const loading = <main className="mx-auto max-w-md p-6" role="status">Đang mở sổ từ…</main>;

function AccountNotebook({ user, linkError }) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(Boolean(linkError));
  const [useCode, setUseCode] = useState(false);
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const flush = useRef(null);
  const account = user?.id || null;

  useEffect(() => {
    if (linkError && !account) setOpen(true);
  }, [linkError, account]);

  useEffect(() => {
    setNotebookAccount(account);
    if (!account) { setReady(true); return; }

    let active = true;
    let running = null;
    let delay;
    const sync = () => {
      if (!active) return Promise.resolve(false);
      if (running) return running;
      setSyncStatus('Đang đồng bộ…');
      running = syncNotebook(client, account, () => active).then(() => {
        if (active) setSyncStatus('Đã đồng bộ');
        return true;
      }).catch(() => {
        if (active) setSyncStatus('Chưa đồng bộ · sẽ thử lại');
        return false;
      }).finally(() => { running = null; });
      return running;
    };
    const queue = () => {
      clearTimeout(delay);
      delay = setTimeout(async () => {
        if (running) await running;
        if (active) sync();
      }, 300);
    };
    const storageChanged = event => {
      if (event.key?.startsWith(`account:${account}:`) && !event.key.endsWith('notebook_sync_baseline_v1')) queue();
    };
    flush.current = async () => {
      clearTimeout(delay);
      if (running) await running;
      return sync();
    };
    sync().finally(() => { if (active) setReady(true); });
    const interval = setInterval(sync, 12_000);
    window.addEventListener('focus', sync);
    window.addEventListener('online', sync);
    window.addEventListener('notebook-change', queue);
    window.addEventListener('storage', storageChanged);
    return () => {
      active = false;
      flush.current = null;
      clearTimeout(delay);
      clearInterval(interval);
      window.removeEventListener('focus', sync);
      window.removeEventListener('online', sync);
      window.removeEventListener('notebook-change', queue);
      window.removeEventListener('storage', storageChanged);
    };
  }, [account]);

  const run = async operation => {
    setBusy(true);
    setMessage('');
    try { await operation(); }
    catch (error) { setMessage(error.message || 'Chưa thực hiện được. Hãy thử lại.'); }
    finally { setBusy(false); }
  };

  const signIn = event => {
    event.preventDefault();
    run(async () => {
      const { error } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin }
      });
      if (error?.code === 'email_address_not_authorized') {
        throw new Error('Hãy dùng email quản trị dự án Supabase. Dịch vụ gửi mail hiện chưa hỗ trợ email ngoài nhóm.');
      }
      if (error?.code === 'over_email_send_rate_limit') {
        throw new Error('Đã đến giới hạn gửi email đăng nhập. Hãy dùng liên kết đã nhận hoặc thử lại sau.');
      }
      if (error) throw error;
      setMessage('Mở email mới nhất. Nếu email có mã xác nhận, chọn Nhập mã từ email. Nếu có liên kết, mở liên kết trong trình duyệt bạn muốn dùng để học.');
    });
  };

  const verifyCode = event => {
    event.preventDefault();
    run(async () => {
      const { error } = await client.auth.verifyOtp({ email: email.trim(), token: code, type: 'email' });
      if (error?.code === 'otp_expired' || error?.code === 'invalid_credentials') {
        throw new Error('Mã đã hết hạn hoặc không đúng. Hãy dùng mã trong email mới nhất.');
      }
      if (error) throw error;
    });
  };

  const migrate = () => run(async () => {
    const guest = withGuestNotebook(exportAllDataAsJSON);
    const result = importDataFromJSON(guest);
    if (!result.success) throw new Error(result.error);
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    const synced = await flush.current?.();
    setMessage(synced ? `Đã gộp dữ liệu. Sổ tài khoản có ${result.total} từ.` : 'Đã gộp trên thiết bị. Ứng dụng sẽ thử đồng bộ lại.');
  });

  const signOut = () => run(async () => {
    if (!await flush.current?.()) throw new Error('Chưa lưu được dữ liệu lên tài khoản. Hãy thử lại khi có mạng.');
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) throw error;
  });

  if (!ready) return loading;
  const bar = <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-end gap-3 px-4 pt-2 text-sm">
    {user && <span role="status" className="text-slate-600">{syncStatus}</span>}
    <button type="button" className="entry-secondary" onClick={() => { setMessage(''); setOpen(true); }}>
      {user ? 'Tài khoản' : 'Đăng nhập'}
    </button>
  </div>;
  return <>
    <App accountBar={bar} isAccountNotebook={Boolean(user)}/>
    {open && <EntryDialog title={user ? 'Tài khoản học' : 'Đăng nhập bằng email'} onClose={() => setOpen(false)}>
      {user ? <div className="entry-body">
        <p className="break-all">{user.email}</p>
        <p>Sổ từ, bộ học riêng và tiến độ đồng bộ khi đăng nhập bằng cùng email trên thiết bị khác.</p>
        <button type="button" className="entry-primary" disabled={busy} onClick={migrate}>Đưa sổ cũ trên trình duyệt này vào tài khoản</button>
        <div className="entry-actions">
          <button type="button" className="entry-secondary" disabled={busy}
            onClick={() => run(async () => { if (!await flush.current?.()) throw new Error('Chưa đồng bộ được.'); })}>Đồng bộ ngay</button>
          <button type="button" className="entry-secondary" disabled={busy} onClick={signOut}>Đăng xuất</button>
        </div>
        {message && <p role="status">{message}</p>}
      </div> : <form onSubmit={useCode ? verifyCode : signIn}>
        <div className="entry-body">
          {linkError && <p role="alert" className="entry-error">{linkError}</p>}
          <label>Email<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)}/></label>
          {useCode && <label>Mã xác nhận từ email<input required autoFocus inputMode="numeric" autoComplete="one-time-code"
            pattern="[0-9]{6,10}" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 10))}/></label>}
          <p>Dùng cùng một email để mở cùng sổ từ trên máy tính và điện thoại.</p>
          {message && <p role="status">{message}</p>}
        </div>
        <div className="entry-footer">
          <button type="button" className="entry-secondary" disabled={busy}
            onClick={() => { setUseCode(value => !value); setMessage(''); }}>{useCode ? 'Quay lại gửi email' : 'Nhập mã từ email'}</button>
          <button className="entry-primary" disabled={busy}>{useCode ? 'Xác nhận mã' : 'Gửi email đăng nhập'}</button>
        </div>
      </form>}
    </EntryDialog>}
  </>;
}

export default function AccountApp() {
  const [initializing, setInitializing] = useState(Boolean(client));
  const [user, setUser] = useState(null);
  const [linkError, setLinkError] = useState('');
  useEffect(() => {
    if (!client) return;
    let active = true;
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session) setLinkError('');
      setInitializing(false);
    });
    if (authReturn) {
      const checkReturn = async () => {
        let message = '';
        try {
          const { error } = await client.auth.initialize();
          const code = authReturn.errorCode || error?.details?.code || error?.code;
          if (code || error) {
            message = signInLinkMessage(code);
          } else {
            const { data: sessionData } = await client.auth.getSession();
            if (!sessionData.session) message = signInLinkMessage();
          }
        } catch {
          message = signInLinkMessage();
        }
        if (!active) return;
        setLinkError(message);
        window.history.replaceState(window.history.state, '', authReturn.cleanUrl);
      };
      checkReturn();
    }
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  if (!client) return <App/>;
  if (initializing) return loading;
  return <AccountNotebook key={user?.id || 'guest'} user={user} linkError={user ? '' : linkError}/>;
}

export function GuestKeyCard({ issued }: { issued: boolean }) {
  return (
    <figure className={issued ? "wallets is-issued" : "wallets is-sealed"}>
      <div className="wallet-row">
        <Handset kind="iphone" issued={issued} />
        <Handset kind="android" issued={issued} />
      </div>
      <figcaption className="quiet mt-3 text-sm">
        {issued
          ? "The HAYVRA card was added to the wallet after sign-in."
          : "Added after sign-in"}
      </figcaption>
    </figure>
  );
}

function Handset({ kind, issued }: { kind: "iphone" | "android"; issued: boolean }) {
  const apple = kind === "iphone";
  return (
    <div className="handset-wrap">
      <div className={apple ? "handset is-ios" : "handset is-and"} dir="ltr" lang="en">
        {apple ? <span className="island" aria-hidden="true" /> : <span className="punch" aria-hidden="true" />}
        <div className="status">
          <span>{apple ? "9:41" : "9:30"}</span>
          <StatusIcons />
        </div>
        <div className="wallet-head">
          <div className="wallet-title">
            {apple ? null : <span className="and-badge" aria-hidden="true" />}
            <p>Wallet</p>
          </div>
          {apple ? <span className="wallet-plus" aria-hidden="true">+</span> : (
            <span className="wallet-more" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
        <article className="crest-pass">
          <div className="crest-frame">
            <div className="crest-inner">
              <img src="/media/mark.png" alt="" width={160} height={160} />
              <p className="crest-name">HAYVRA</p>
              <p className="crest-rule" aria-hidden="true">
                <span />
              </p>
              <p className="crest-guest">GUEST</p>
            </div>
          </div>
        </article>
        <div className={issued ? "hold" : "hold is-off"}>
          {apple ? <ReaderIcon /> : <WaveIcon />}
          <p>{apple ? "Hold Near Reader" : "Hold to reader"}</p>
        </div>
        <span className="home-bar" aria-hidden="true" />
      </div>
      <p className="quiet mt-2 text-center text-sm">{apple ? "iPhone Wallet" : "Android Wallet"}</p>
    </div>
  );
}

function StatusIcons() {
  return (
    <span className="status-icons" aria-hidden="true">
      <svg viewBox="0 0 18 12">
        <rect x="0" y="7" width="3" height="5" rx="0.4" />
        <rect x="5" y="4" width="3" height="8" rx="0.4" />
        <rect x="10" y="1.5" width="3" height="10.5" rx="0.4" />
        <rect x="15" y="0" width="3" height="12" rx="0.4" />
      </svg>
      <svg viewBox="0 0 16 12">
        <path d="M8 3.2c2 0 3.8.8 5.1 2.1l-1.2 1.2A5.2 5.2 0 0 0 8 5.2a5.2 5.2 0 0 0-3.9 1.3L2.9 5.3A7 7 0 0 1 8 3.2Z" />
        <path d="M8 6.6c1.1 0 2.1.4 2.8 1.1L9.6 8.9A2.2 2.2 0 0 0 8 8.2c-.6 0-1.1.2-1.6.7L5.2 7.7A3.8 3.8 0 0 1 8 6.6Z" />
        <circle cx="8" cy="11" r="1.1" />
      </svg>
      <svg viewBox="0 0 25 12">
        <rect x="0.6" y="0.6" width="20" height="10.8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <rect x="2" y="2" width="14" height="8" rx="1" />
        <rect x="21.4" y="3.6" width="1.6" height="4.8" rx="0.4" />
      </svg>
    </span>
  );
}

function ReaderIcon() {
  return (
    <svg className="hold-icon is-blue" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="4" width="8" height="14" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 7.2h4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg className="hold-icon is-gold" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.2 9.2a5 5 0 0 1 7.6 0" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 7a8 8 0 0 1 12 0" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.4 11.6a2.2 2.2 0 0 1 3.2 0" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

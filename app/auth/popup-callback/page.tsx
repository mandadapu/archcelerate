'use client'

import { useEffect } from 'react'

export default function PopupCallback() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: 'auth-success' }, window.location.origin)
    }
    setTimeout(() => window.close(), 100)
  }, [])

  return (
    <div
      style={{
        background: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        margin: 0,
        fontFamily: 'ui-monospace, monospace',
        color: '#64748b',
        fontSize: '12px',
        letterSpacing: '0.1em',
      }}
    >
      <p>AUTHENTICATION COMPLETE. CLOSING...</p>
    </div>
  )
}

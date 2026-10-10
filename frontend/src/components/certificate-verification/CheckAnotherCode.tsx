import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

/** Lets a verifier type the code printed on a certificate. */
export function CheckAnotherCode({ label = 'Check another certificate' }: { label?: string }) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  return (
    <form className="mt-8" onSubmit={event => { event.preventDefault(); const value = code.trim(); if (value) navigate(`/verify/${encodeURIComponent(value)}`); }}>
      <label htmlFor="verify-code" className="mb-2 block text-center text-sm font-medium text-muted">{label}</label>
      <div className="mx-auto flex max-w-md gap-2">
        <input id="verify-code" value={code} onChange={event => setCode(event.target.value)} placeholder="Code or certificate number"
          className="input h-11 flex-1 rounded-full border-base-300 bg-base-100 font-mono text-sm uppercase placeholder:font-sans placeholder:normal-case focus:border-brand focus:outline-none" />
        <button type="submit" disabled={!code.trim()} className="btn h-11 rounded-full border-0 bg-brand px-5 text-white hover:bg-brand hover:text-primary-content"><FiSearch aria-hidden />Check</button>
      </div>
    </form>
  );
}

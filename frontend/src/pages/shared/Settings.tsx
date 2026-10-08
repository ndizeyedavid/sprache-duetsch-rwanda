import { useSearchParams } from 'react-router-dom';
import { AppearancePane } from '../../components/settings/AppearancePane';
import { ProfilePane } from '../../components/settings/ProfilePane';
import { SecurityPane } from '../../components/settings/SecurityPane';
import { SettingsNav } from '../../components/settings/SettingsNav';
import type { SettingsTab } from '../../components/settings/settings-tabs';
import { isSettingsTab } from '../../components/settings/settings-tabs';
import { Panel } from '../../components/ui/Panel';

export function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab');
  const tab: SettingsTab = isSettingsTab(requested) ? requested : 'profile';

  function switchTab(next: SettingsTab) {
    const params = new URLSearchParams(searchParams);
    params.set('tab', next);
    setSearchParams(params, { replace: true });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted">Your profile, password and theme.</p>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Panel padded={false} className="p-2"><SettingsNav active={tab} onChange={switchTab} /></Panel>
        <Panel>
          {tab === 'profile' ? <ProfilePane /> : null}
          {tab === 'security' ? <SecurityPane /> : null}
          {tab === 'appearance' ? <AppearancePane /> : null}
        </Panel>
      </div>
    </div>
  );
}

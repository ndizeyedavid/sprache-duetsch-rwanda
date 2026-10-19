import { FiSettings } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { PageHero } from '../../components/hero/PageHero';
import { AppearancePane } from '../../components/settings/AppearancePane';
import { NotificationsPane } from '../../components/settings/NotificationsPane';
import { ProfilePane } from '../../components/settings/ProfilePane';
import { SecurityPane } from '../../components/settings/SecurityPane';
import { SettingsNav } from '../../components/settings/SettingsNav';
import type { SettingsTab } from '../../components/settings/settings-tabs';
import { isSettingsTab } from '../../components/settings/settings-tabs';
import { Panel } from '../../components/ui/Panel';
import { roleLabel } from '../../lib/roles';
import { useSession } from '../../lib/session';

export function Settings() {
  const { user } = useSession();
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
      <PageHero eyebrow="Your account" icon={FiSettings} title="Settings" art="settings"
        description={`${user ? `Hallo, ${user.firstName}! ` : ''}Your profile, password, notifications and theme — all in one place.`}
        meta={user ? <>
          <span className="hero-chip hero-chip-solid">{roleLabel[user.role]}</span>
          <span className="hero-chip max-w-full truncate">{user.email}</span>
        </> : null} />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[16.25rem_minmax(0,1fr)]">
        <Panel padded={false} className="p-2"><SettingsNav active={tab} onChange={switchTab} /></Panel>
        <Panel>
          {tab === 'profile' ? <ProfilePane /> : null}
          {tab === 'security' ? <SecurityPane /> : null}
          {tab === 'notifications' ? <NotificationsPane /> : null}
          {tab === 'appearance' ? <AppearancePane /> : null}
        </Panel>
      </div>
    </div>
  );
}

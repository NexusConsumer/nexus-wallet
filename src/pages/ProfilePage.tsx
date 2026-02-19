import ProfileHeader from '../components/profile/ProfileHeader';
import MenuList from '../components/profile/MenuList';

export default function ProfilePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <ProfileHeader />
      <MenuList />
    </div>
  );
}

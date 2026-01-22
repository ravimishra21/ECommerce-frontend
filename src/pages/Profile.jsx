import { useNavigate } from 'react-router-dom';
import { Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Assuming your auth context is here
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth(); // Use AuthContext for user data and auth status
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Track if user data is loading

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
 //     navigate('/auth');
    } else {
      setLoading(false); // Set loading to false if the user is authenticated
    }
  }, [isAuthenticated, navigate]);

  // If user data is not available or is still loading, show a loading state
  if (loading) return <div>Loading...</div>;

  if (!user) return null; // If no user data, do nothing

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                logout(); // Call logout function from AuthContext
                navigate('/'); // Redirect to home or login page after logout
              }}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

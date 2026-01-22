import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
    const [roles, setRoles] = useState('user'); // Add this line to define role

  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track if the user is authenticated
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { syncCartFromServer } = useCart();

  // Check if the user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true); // If a token is found, mark the user as authenticated
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Send POST request to the backend API for login
      const response = await axios.post('http://localhost:9090/api/auth/login', {
        username,
        password,
      });

  

      // If login is successful, save the token (or user details)
      if (response.status === 200) {
        const { token } = response.data; // Assuming the backend sends back a JWT token
       const name= response.data.username;
       console.log("User details from login response:", response.data);
        const userid= response.data.userid;
        localStorage.setItem('authToken', token);  // Save token in localStorage
        localStorage.setItem('username', name);
         localStorage.setItem('userid', userid);
        // Update AuthContext so other components (Navbar) see the user as authenticated
         console.log("localstorage : ", localStorage);
      
        try {
          // Create a lightweight user object for the context. Adjust fields as needed.
          const userObj = { id: Date.now(), username, token };
          setUser(userObj);
        } catch (err) {
          console.warn('Could not set user in context', err);
        }

        // Fetch cart count from backend for this authenticated user
        (async () => {
          try {
            // Use the userId from localStorage (set above) or userid from response
            const userId = userid || localStorage.getItem('userid');
            const cartRes = await fetch(`/api/cart/totalNumberOfAllCartOfSpecificUser/${userId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if (cartRes.ok) {
              const cartData = await cartRes.json();
              syncCartFromServer(cartData);
            } else {
              console.warn('Could not fetch cart count from server');
            }
          } catch (err) {
            console.error('Error fetching cart count:', err);
          }
        })();

        setIsAuthenticated(true); // Set the authentication state to true locally
        toast.success('Login successful!');
        navigate('/'); // Navigate to homepage or a protected route after successful login
      } else {
        toast.error('Failed to login');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !username || !roles ) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
       const roleName = roles === 'admin' ? 'ROLE_ADMIN' : 'ROLE_USER';

    // If you know the role IDs in DB (e.g. 1 = ROLE_USER, 2 = ROLE_ADMIN), set them here.
    const roleId = roles === 'admin' ? 2 : 1;

    const response = await axios.post('http://localhost:9090/api/auth/register', {
      username,
      email,
      password,
      roles: [
        {
          id: roleId,       // must match existing role IDs in DB
          name: roleName,   // e.g. "ROLE_USER" or "ROLE_ADMIN"
        },
      ],
      enabled: true,        // optional – backend has default
      // createdAt: new Date().toISOString(), // optional – backend has default
    }
  , {
  headers: {
    'Content-Type': 'application/json', // Explicitly set content type
  },

  }
  
  );

    if (response.status === 201) {
      toast.success('Account created successfully!');
      navigate('/auth');
    } else {
      toast.error('Failed to create account');
    }
  } catch (error) {
    console.error('Signup error:', error);
    toast.error('Authentication failed');
  } finally {
    setLoading(false);
  }
};


  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove the token from localStorage
    setIsAuthenticated(false); // Set authentication state to false
    navigate('/'); // Redirect to the homepage or login page after logout
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? ( // Conditionally render based on authentication status
            <div>
              <Button
                onClick={handleLogout}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                {/* <TabsTrigger value="signup">Sign Up</TabsTrigger> */}
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Username</Label>
                    <Input
                      id="login-email"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Login'}
                  </Button>


                </form>
               </TabsContent>

                 <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signup">Don't have an account ? Sign up</TabsTrigger>
                
              </TabsList>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">username</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>


<div className="flex items-center space-x-4">
  <Label htmlFor="role" className="mr-2">Role:</Label>
  <div className="flex items-center justify-center space-x-4">
   
    <div className="flex items-center">
      <Input
        id="role-user"
        type="radio"
        name="role"
        value="user"
        checked={roles === 'user'}
        onChange={(e) => setRoles(e.target.value)}
        required
        className="w-4 h-4" // Makes the radio button small
      />
      <Label htmlFor="role-user" className="ml-2">User</Label>
    </div>

     <div className="flex items-center">
      <Input
        id="role-admin"
        type="radio"
        name="role"
        value="admin"
        checked={roles === 'admin'}
        onChange={(e) => setRoles(e.target.value)}
        required
        className="w-4 h-4" // Makes the radio button small
      />
      <Label htmlFor="role-admin" className="ml-2">Admin</Label>
    </div>

  </div>
</div>





                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

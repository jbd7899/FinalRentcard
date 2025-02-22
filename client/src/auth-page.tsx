// Previous imports and code remain unchanged

const AuthPage = () => {
  // Previous code remains unchanged

  useEffect(() => {
    if (user) {
      const dashboardPath = user.userType === 'tenant' ? '/tenant/dashboard' : '/landlord/dashboard';
      setLocation(dashboardPath);
    }
  }, [user, setLocation]);

  // Rest of the file remains unchanged

import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { UserProvider } from './components/users/UserProvider';

function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}

export default App;
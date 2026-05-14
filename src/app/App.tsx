import { RouterProvider } from 'react-router-dom';
import { router } from 'src/routes';
import './App.css'
import { UserProvider } from 'src/stores/UserContext';

function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}

export default App;
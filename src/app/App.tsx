import { RouterProvider } from 'react-router-dom';
import { router } from 'src/routes';
import './App.css'
import { UserProvider } from 'src/stores/UserContext';
import { Bounce, ToastContainer } from 'react-toastify';
import { useColorScheme } from '@mui/material';

function App() {
  const { mode } = useColorScheme();
  return (
    <UserProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={mode}
        transition={Bounce}
        icon={false}
        toastStyle={{ padding: 0, minHeight: "unset" }}
      />
    </UserProvider>
  );
}

export default App;
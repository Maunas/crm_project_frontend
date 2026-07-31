import { RouterProvider } from 'react-router-dom';
import { UserProvider } from 'src/stores/UserContext';
import { Bounce, ToastContainer } from 'react-toastify';
import { useColorScheme } from '@mui/material';
import { router } from 'src/routing/routes';
import { tokenStore } from 'src/lib/tokenStore';

function App() {
  const { mode } = useColorScheme();

  if (import.meta.env.DEV) {
    console.info(tokenStore.getAccessToken())
  }

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
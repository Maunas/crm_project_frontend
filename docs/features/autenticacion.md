# Autenticación (`src/features/auth/`)

## Estructura
```
auth/
  LoginForm.tsx       → LoginFormPage
  SignupForm.tsx      → SignupFormPage
  userServices.ts     → loginUser, registerUser, getCurrentUser, logout, refreshTokens, updateCurrentUser
```

## Componentes

### `LoginFormPage` — `LoginForm.tsx`
Página de inicio de sesión. Ruta: `/login`.
- Formulario con email + contraseña (usando `PasswordField`)
- Botón "Recordarme"
- Consume `useUserContext().login(data, rememberMe)`
- Redirige a `/dashboard` tras login exitoso

### `SignupFormPage` — `SignupForm.tsx`
Página de registro. Ruta: `/signup`.
- Formulario con nombre, email, contraseña, repetir contraseña
- Validación de contraseñas coincidentes
- Consume `useUserContext().signup(data)`
- Redirige a `/dashboard` tras registro exitoso

## Servicios (`userServices.ts`)
```tsx
loginUser(data: UserLogin) → { access_token, refresh_token }
registerUser(data: UserSignup) → { access_token, refresh_token }
getCurrentUser() → UserData
logout(refreshToken: string) → void
refreshTokens(refreshToken: string) → { access_token, refresh_token }
updateCurrentUser(data: UserProfileUpdate) → void
inviteUser(data: UserInvitation) → void
getUsers(params?) → Paginable<UserData>
```

## Rutas
- `/login` → `LoginFormPage` (sin layout)
- `/signup` → `SignupFormPage` (sin layout)
- `/onboarding` → `OnboardingPage` (sin layout, para nuevos usuarios sin org)

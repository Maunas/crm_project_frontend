import { createContext } from "react";
import type { UserContextItems } from "../features/users/UserProvider";

export const UserContext = createContext<UserContextItems>({} as UserContextItems)
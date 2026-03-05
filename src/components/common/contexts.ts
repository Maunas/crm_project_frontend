import { createContext } from "react";
import type { UserContextItems } from "../users/UserProvider";

export const UserContext = createContext<UserContextItems>({} as UserContextItems)
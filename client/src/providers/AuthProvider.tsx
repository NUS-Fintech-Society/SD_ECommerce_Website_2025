import { createContext, useContext, ReactNode, Dispatch, useReducer } from 'react';

interface User {
  name: string;
  email: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  dispatch: Dispatch<Action>;
}

interface Action {
    type: "LOGIN" | "LOGOUT" | "UPDATE_USER"
    payload: User | null;
}

interface State {
    user: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const authReducer = (state: State, action: Action) => {
    switch (action.type) {
        case "LOGIN":
            return { user: action.payload };
        case "LOGOUT":
            return { user: null };
        case "UPDATE_USER":
            return { user: action.payload };
        default:
            return state;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, {
      //temporary user
        user: {
        name: "John Doe",
        email: "john@example.com"
      }
    });
  
    return (
      <AuthContext.Provider value={{ user: state.user, dispatch }}>
        {children}
      </AuthContext.Provider>
    );
  }

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
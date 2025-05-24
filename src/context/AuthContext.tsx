import auth from '@/api/auth';
import useTenant from '@/hooks/useTenant';
import { loadPermimssions, loadRoles } from '@/api/roles';
import { getUsers } from '@/api/users';
import { useState, createContext, useEffect, Dispatch, useCallback } from 'react';

type AuthContext = {
  users: SimpleUser[] | null;
  user: User | null;
  company: CompanyInfo | null;
  setUser: Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (signUpInfo: SignUpInfo) => Promise<void>;
  login: ({ companyName, email, password }: { companyName: string; email: string; password: string }) => Promise<void>;
  verifyPassword: ({
    companyName,
    email,
    password
  }: {
    companyName: string;
    email: string;
    password: string;
  }) => Promise<any>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
  changePassword: (companyName: string, password: string) => Promise<void>;
  updateUser: (companyName: string, updatedUser: User) => Promise<void>;
  updateUserSettings: (companyName: string, updatedUser: User) => Promise<void>;
  uploadAvatar: (companyName: string, avatar: File) => Promise<User | null>;
  getCompanyInfo: (companyName: string) => Promise<void>;
  updateCompanyInfo: (companyName: string, companyInfo: CompanyInfo) => Promise<void>;
  uploadCompanyAvatar: (companyName: string, companyId: string, avatar: File) => Promise<string | null>;
  getRoles: (companyName: string) => Promise<Role[] | null>;
  getSimpleUser: (userId: string) => SimpleUser | undefined;
  hasPermission: (permission: string) => Promise<boolean>;
  getPermissions: (companyName: string) => Promise<Permission[] | null>;
};

export const AuthContext = createContext<AuthContext | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<SimpleUser[] | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('access_token');
    return Boolean(token);
  });

  const companyName = useTenant();
  useEffect(() => {
    const authenticated = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        const user = companyName && companyName.length > 0 ? await auth.getUser(companyName) : null;
        const companyInfo = companyName && companyName.length > 0 ? await auth.loadCompanyInfo(companyName) : null;
        if (!token || !user) {
          throw new Error('No token found');
        }

        setUser(user);
        setCompany(companyInfo);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        // console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    const loadUsers = async () => {
      const companyUsers = await getUsers(companyName);
      setUsers(companyUsers);
    };

    authenticated();
    loadUsers();
  }, [companyName]);

  const signUp = async (signUpInfo: SignUpInfo) => {
    const res: TokenResponse = await auth.signUp(signUpInfo);
    if (res) {
      setIsAuthenticated(true);
      setUser(res.user);
      localStorage.setItem('access_token', res.access_token);
    }
  };

  const login = async ({ companyName, email, password }: { companyName: string; email: string; password: string }) => {
    const res = await auth.login(companyName, email, password);
    if (res) {
      setIsAuthenticated(true);
      setUser(res.user);
      localStorage.setItem('access_token', res.access_token);
    }
    return res;
  };

  const verifyPassword = async ({
    companyName,
    email,
    password
  }: {
    companyName: string;
    email: string;
    password: string;
  }) => {
    const res = await auth.verifyPassword(companyName, email, password);
    return res;
  };

  const hasPermission = async (permission: string) => {
    const roles: Role[] = await getRoles(companyName);
    const userRoles = roles.filter((role) => user?.roles?.includes(role.role_name));
    const permissions = userRoles.map((role) => role.permissions).flat();
    return permissions.filter((p) => p.permission_name === permission).length > 0;
  };

  const logout = async () => {
    try {
      localStorage.removeItem('access_token');
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = useCallback(
    async (companyName: string, updatedUser: User) => {
      try {
        const res = await auth.updateUser(companyName, {
          ...updatedUser
        });
        if (res) {
          setUser(updatedUser);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [setUser]
  );

  const updateUserSettings = useCallback(
    async (companyName: string, updatedUser: User) => {
      const layoutOrders = updatedUser.settings.layout_order.map((layoutOrder) => {
        const filteredLayoutOrderTypes = layoutOrder.types.filter((type) => {
          // Don't save to server if the tab is a record tab but user didn't pin it
          return !(type.isPrimitiveType === false && type.saved === false);
        });
        return { ...layoutOrder, types: filteredLayoutOrderTypes };
      });

      try {
        await auth.updateUser(companyName, {
          ...updatedUser,
          settings: { ...updatedUser.settings, layout_order: layoutOrders }
        });

        // if (res) {
        //   setUser(updatedUser);
        // }
      } catch (error) {
        console.error(error);
      }
    },
    [setUser]
  );

  const uploadAvatar = useCallback(
    async (companyName: string, avatar: File) => {
      try {
        const res = await auth.uploadAvatar(companyName, avatar);
        console.log('Avatar upload response:', res);
        console.log('User:', user);
        if (res) {
          const user = companyName && companyName.length > 0 ? await auth.getUser(companyName) : null;
          setUser(user);
          return user;
        } else {
          return null;
        }
      } catch (error) {
        console.error(error);
      }
    },
    [setUser]
  );

  const uploadCompanyAvatar = async (companyName: string, companyId: string, avatar: File) => {
    const res = await auth.uploadCompanyAvatar(companyName, companyId, avatar);
    if (res) {
      getCompanyInfo(companyName);
    }
    return res;
  };

  const reloadUser = async () => {
    const user = companyName && companyName.length > 0 ? await auth.getUser(companyName) : null;
    setUser(user);
  };

  const getSimpleUser = (userId: string): SimpleUser | undefined => {
    return users?.find((user) => user.user_id === userId);
  };

  const changePassword = async (companyName: string, password: string) => {
    const res = await auth.changePassword(companyName, user?.user_id ?? '', password);
    return res;
  };

  const getCompanyInfo = async (companyName: string) => {
    const companyInfo = await auth.loadCompanyInfo(companyName);
    setCompany(companyInfo);
  };

  const updateCompanyInfo = async (companyName: string, companyInfo: CompanyInfo) => {
    const res = await auth.updateCompanyInfo(companyName, companyInfo);
    if (res) {
      setCompany({
        name: companyInfo.name,
        address: companyInfo.address,
        description: companyInfo.description,
        phone: companyInfo.phone,
        tax_code: companyInfo.tax_code,
        avatar_url: companyInfo.avatar_url,
        company_id: companyInfo.company_id
      });
    }
    return res;
  };

  const getRoles = async (companyName: string) => {
    const roles = await loadRoles(companyName);
    return roles;
  };

  const getPermissions = async (companyName: string) => {
    const permissions = await loadPermimssions(companyName);
    return permissions;
  };

  // if (!companyName) return null;

  const value = {
    user,
    users,
    isLoading,
    isAuthenticated,
    company,
    setUser,
    login,
    logout,
    signUp,
    updateUser,
    updateUserSettings,
    uploadAvatar,
    reloadUser,
    changePassword,
    verifyPassword,
    getCompanyInfo,
    getRoles,
    hasPermission,
    getPermissions,
    getSimpleUser,
    updateCompanyInfo,
    uploadCompanyAvatar
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

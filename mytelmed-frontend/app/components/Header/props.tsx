export interface HeaderProps {
  isLoggedIn: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  className?: string;
}

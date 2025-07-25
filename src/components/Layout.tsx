import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Layout as AntLayout, 
  Menu, 
  Button, 
  Dropdown, 
  Avatar, 
  Badge, 
  Typography,
  Space,
  Drawer
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TrophyOutlined,
  BarChartOutlined,
  ProjectOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useAuthContext } from './AuthProvider';
import { useCurrentUser } from '../hooks/useData';

const { Header, Sider, Content } = AntLayout;
const { Title, Text } = Typography;

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined />, path: '/dashboard' },
  { key: 'objectives', label: 'Strategic Objectives', icon: <TrophyOutlined />, path: '/objectives' },
  { key: 'kpis', label: 'KPIs', icon: <BarChartOutlined />, path: '/kpis' },
  { key: 'kpi-data', label: 'KPI Data', icon: <DatabaseOutlined />, path: '/kpi-data' },
  { key: 'initiatives', label: 'Initiatives', icon: <ProjectOutlined />, path: '/initiatives' },
  { key: 'quarterly-review', label: 'Quarterly Review', icon: <CalendarOutlined />, path: '/quarterly-review' },
  { key: 'strategy-map', label: 'Strategy Map', icon: <BranchesOutlined />, path: '/strategy-map' },
  { key: 'reports', label: 'Reports', icon: <FileTextOutlined />, path: '/reports' },
  { key: 'divisions', label: 'Divisions', icon: <TeamOutlined />, path: '/divisions' },
  { key: 'users', label: 'User Management', icon: <UserOutlined />, path: '/users' },
  { key: 'data-management', label: 'Data Management', icon: <DatabaseOutlined />, path: '/data-management' },
  { key: 'settings', label: 'Settings', icon: <SettingOutlined />, path: '/settings' },
];

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, signOut } = useAuthContext();
  const { data: currentUser, isLoading: currentUserLoading, error: currentUserError } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Debug logging
  React.useEffect(() => {
    console.log('Layout Debug Info:');
    console.log('- Auth user:', user?.email);
    console.log('- Current user loading:', currentUserLoading);
    console.log('- Current user error:', currentUserError);
    console.log('- Current user data:', currentUser);
  }, [user, currentUser, currentUserLoading, currentUserError]);

  const handleSignOut = async () => {
    await signOut();
  };

  // Filter menu items based on user permissions
  const getFilteredMenuItems = () => {
    // Show all items if no user data (safer fallback)
    if (!currentUser) {
      console.warn('No currentUser data available, showing all menu items');
      return menuItems;
    }
    
    console.log('Current user:', currentUser.email, 'Role:', currentUser.role);
    
    return menuItems.filter(item => {
      switch (item.key) {
        case 'users':
          // Only Admin, Executive, and Manager can see user management
          return ['Admin', 'Executive', 'Manager'].includes(currentUser.role);
        case 'divisions':
          // Only Admin and Executive can manage divisions
          return ['Admin', 'Executive'].includes(currentUser.role);
        case 'data-management':
          // Only Admin can access data management
          return currentUser.role === 'Admin';
        case 'settings':
          // Only Admin can access settings
          return currentUser.role === 'Admin';
        default:
          return true;
      }
    });
  };

  const handleMenuClick = (key: string) => {
    const item = menuItems.find(item => item.key === key);
    if (item) {
      navigate(item.path);
      setMobileDrawerOpen(false);
    }
  };

  const getSelectedKey = () => {
    const currentPath = location.pathname;
    const item = menuItems.find(item => item.path === currentPath);
    return item ? [item.key] : [];
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Sign Out',
      icon: <LogoutOutlined />,
      onClick: handleSignOut,
    },
  ];

  const menuProps = {
    mode: 'inline' as const,
    theme: 'light' as const,
    selectedKeys: getSelectedKey(),
    items: getFilteredMenuItems().map(item => ({
      key: item.key,
      label: item.label,
      icon: item.icon,
      onClick: () => handleMenuClick(item.key),
    })),
  };

  const SidebarContent = () => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start'
      }}>
        <div 
          className="mtcc-logo"
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            marginRight: collapsed ? 0 : '12px'
          }}
        >
          M
        </div>
        {!collapsed && (
          <div>
            <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
              MTCC BSC
            </Title>
          </div>
        )}
      </div>
      
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Menu {...menuProps} />
      </div>
    </div>
  );

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="80"
        width={280}
        style={{ display: 'none' }}
        className="desktop-sider"
      >
        <SidebarContent />
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div 
              className="mtcc-logo"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                marginRight: '8px'
              }}
            >
              M
            </div>
            <Title level={4} style={{ margin: 0 }}>
              MTCC BSC
            </Title>
          </div>
        }
        placement="left"
        closable={true}
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        width={280}
        className="mobile-drawer"
      >
        <Menu {...menuProps} />
      </Drawer>

      <AntLayout>
        <Header style={{ 
          padding: '0 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={mobileDrawerOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              style={{ display: 'block' }}
              className="mobile-menu-button"
            />
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ display: 'none' }}
              className="desktop-menu-button"
            />
            
            <div style={{ marginLeft: '16px' }}>
              <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </Title>
            </div>
          </div>

          <Space size="middle">
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: '18px' }} />}
                style={{ display: 'flex', alignItems: 'center' }}
              />
            </Badge>
            
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button type="text" style={{ display: 'flex', alignItems: 'center', height: 'auto' }}>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Text strong style={{ lineHeight: 1.2 }}>
                      {user?.user_metadata?.first_name || 'User'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px', lineHeight: 1.2 }}>
                      {user?.email}
                    </Text>
                  </div>
                  <DownOutlined style={{ fontSize: '12px' }} />
                </Space>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: '24px', overflow: 'auto' }}>
          <Outlet />
        </Content>
      </AntLayout>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media (min-width: 992px) {
            .desktop-sider {
              display: block !important;
            }
            .mobile-menu-button {
              display: none !important;
            }
            .desktop-menu-button {
              display: block !important;
            }
          }
          
          @media (max-width: 991px) {
            .desktop-sider {
              display: none !important;
            }
            .mobile-menu-button {
              display: block !important;
            }
            .desktop-menu-button {
              display: none !important;
            }
            .ant-layout-content {
              margin: 16px !important;
            }
          }
        `
      }} />
    </AntLayout>
  );
};
import './Header.css'

import { BsSunFill } from 'react-icons/bs'
import { FaMoon } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

import favicon from '@/assets/favicon.png'
import useTheme from '@/hooks/useTheme'
import { ROUTE_PATHS } from '@/routes/route'
import { canManageResources, clearAuthStorage, getStoredUser } from '@/utils/auth'

import type { HeaderItemProps } from '@/types/interfaces/layouts'

const HeaderItem: React.FC = () => {
  const navigate = useNavigate()
  const user = getStoredUser()
  const canManage = canManageResources(user)

  const headerItems: HeaderItemProps[] = [
    {
      id: 1,
      name: canManage ? '보호자 관리' : '보호자 목록',
      path: '/owners',
    },
    {
      id: 2,
      name: canManage ? '반려동물 관리' : '반려동물 목록',
      path: ROUTE_PATHS.PETS,
    },
    {
      id: 3,
      name: canManage ? '수의사 관리' : '수의사 목록',
      path: ROUTE_PATHS.VETS,
    },
  ]

  if (canManage) {
    headerItems.push({
      id: 4,
      name: '관리',
      path: ROUTE_PATHS.MANAGEMENT,
    })
  }

  return (
    <div className="header-items">
      {headerItems.map(item => (
        <div
          className="header-item"
          key={item.id}
          onClick={() => item.path && navigate(item.path)}
        >
          {item.name}
        </div>
      ))}
    </div>
  )
}

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`}
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className="theme-toggle-thumb">
        {theme === 'light' ? <BsSunFill /> : <FaMoon />}
      </span>
    </button>
  )
}

const LayoutHeader: React.FC = () => {
  const navigate = useNavigate()
  const user = getStoredUser()

  const handleLogout = () => {
    clearAuthStorage()
    navigate(ROUTE_PATHS.SIGN_IN)
  }

  return (
    <header className="header-area">
      <div className="header-left">
        <button
          className="home-button"
          type="button"
          aria-label="홈으로 이동"
          onClick={() => navigate('/dash-board')}
        >
          <img
            src={favicon}
            alt=""
          />
        </button>
        <HeaderItem />
      </div>

      <div className="header-items">
        <p className="header-greeting">
          안녕하세요, {user?.username ?? '사용자'}님
        </p>
        <div
          className="header-item"
          onClick={() => navigate('/my-page')}
        >
          <span>마이페이지</span>
        </div>
        <div
          className="header-item"
          onClick={handleLogout}
        >
          <span>로그아웃</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}

export default LayoutHeader
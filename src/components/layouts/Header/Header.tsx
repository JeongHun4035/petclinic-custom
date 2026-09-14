import './Header.css'

import { BsSunFill } from 'react-icons/bs'
import { FaMoon } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

import favicon from '@/assets/favicon.png'
import useTheme from '@/hooks/useTheme'
import { ROUTE_PATHS } from '@/routes/route'

import type { HeaderItemProps } from '@/types/interfaces/layouts'

const HeaderItem: React.FC = () => {
  const navigate = useNavigate()

  const headerItems: HeaderItemProps[] = [
    {
      id: 1,
      name: '보호자',
      path: '/owners',
    },
    {
      id: 2,
      name: '반려 동물',
      path: ROUTE_PATHS.PETS,
    },
    {
      id: 3,
      name: '수의사',
      path: ROUTE_PATHS.VETS,
    },
    {
      id: 4,
      name: '관리',
      path: ROUTE_PATHS.MANAGEMENT,
    },
  ]

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
        <div
          className="header-item"
          onClick={() => navigate('/my-page')}
        >
          <span>마이페이지</span>
        </div>
        <div
          className="header-item"
          onClick={() => navigate('/sign-in')}
        >
          <span>로그아웃</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}

export default LayoutHeader
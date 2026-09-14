import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { axiosRequest } from '@/api/axios'
import petClinicLogo from '@/assets/pet-clinic-logo.png'
import Button from '@/components/common/Button/Button'
import Input from '@/components/common/Input/Input'

import type { AuthResponse, AuthUser } from '@/types/interfaces/services'

import './Sign-in.css'

const UserInfoForm: React.FC = () => {
  const [userId, setUserId] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [userType, setUserType] = useState<'user' | 'doctor' | 'admin'>('user')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const userTypeLabel = userType === 'user' ? '보호자' : userType === 'doctor' ? '수의사' : '관리자'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const response = await axiosRequest.post<AuthResponse>('/petclinic/api/auth/login', {
        username: userId,
        password,
      })
      const authResponse = response.data

      localStorage.setItem('token', authResponse.accessToken)
      localStorage.setItem('tokenInfo', JSON.stringify({
        accessToken: authResponse.accessToken,
        tokenType: authResponse.tokenType,
        expiresIn: authResponse.expiresIn,
      }))

      const meResponse = await axiosRequest.get<AuthUser>('/petclinic/api/auth/me')
      localStorage.setItem('user', JSON.stringify(meResponse.data))
      navigate('/dash-board')
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('tokenInfo')
      localStorage.removeItem('user')
      setErrorMessage('아이디 또는 비밀번호를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="user-type-toggle" role="group" aria-label="로그인 유형 선택">
        <Button
          type="button"
          className={`user-type-button ${userType === 'user' ? 'is-active' : ''}`}
          aria-pressed={userType === 'user'}
          onClick={() => setUserType('user')}
        >
          보호자
        </Button>
        <Button
          type="button"
          className={`user-type-button ${userType === 'doctor' ? 'is-active' : ''}`}
          aria-pressed={userType === 'doctor'}
          onClick={() => setUserType('doctor')}
        >
          수의사
        </Button>
        <Button
          type="button"
          className={`user-type-button ${userType === 'admin' ? 'is-active' : ''}`}
          aria-pressed={userType === 'admin'}
          onClick={() => setUserType('admin')}
        >
          관리자
        </Button>
      </div>

      <div className="input-group">
        <Input
          id="userId"
          label={`${userTypeLabel} 아이디`}
          type="text"
          value={userId}
          placeholder={`${userTypeLabel} 아이디를 입력해주세요.`}
          onChange={setUserId}
        />
      </div>

      <div className="input-group">
        <Input
          id="password"
          label="비밀번호"
          type="password"
          value={password}
          placeholder="비밀번호를 입력해주세요."
          onChange={setPassword}
        />
      </div>
      <div className="input-footer">
        <Button
          type="submit"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="signup-button"
          fullWidth
        >
          회원가입
        </Button>
      </div>
      {errorMessage ? <p className="signin-error">{errorMessage}</p> : null}
    </form>
  )
}

const SignIn: React.FC = () => {
  return (
    <div className="signin-container">
      <div className="userInput-form">
        <div className="signin-logo">
          <img
            src={petClinicLogo}
            alt="Pet Clinic"
          />
        </div>
        <UserInfoForm />
      </div>
    </div>
  )
}

export default SignIn
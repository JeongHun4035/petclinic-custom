import { useState } from 'react'

import './Sign-in.css'
import petClinicLogo from '@/assets/pet-clinic-logo.png'
import Button from '@/components/common/Button/Button'
import Input from '@/components/common/Input/Input'

const UserInfoForm: React.FC = () => {
  const [userId, setUserId] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [userType, setUserType] = useState<'user' | 'doctor'>('user')
  const userTypeLabel = userType === 'user' ? '보호자' : '수의사'

  return (
    <>
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
        >
          로그인
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
    </>
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
import { useState } from 'react'

import './Sign-in.css'
import reactDevLogo from '@/assets/react-dev.png'
import Button from '@/components/common/Button/Button'
import Input from '@/components/common/Input/Input'

const UserInfoForm: React.FC = () => {
  const [userId, setUserId] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  return (
    <>
      <div className="input-group">
        <Input
          id="userId"
          label="User ID"
          type="text"
          value={userId}
          placeholder="Input your User ID"
          onChange={setUserId}
        />
      </div>

      <div className="input-group">
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          placeholder="Input your Password"
          onChange={setPassword}
        />
      </div>
      <Button>
        SIGN IN
      </Button>
    </>
  )
}

const SignIn: React.FC = () => {
  return (
    <div className="signin-container">
      <div className="userInput-form">
        <div className="signin-logo">
          <img
            src={reactDevLogo}
            alt="React Dev"
          />
        </div>
        <UserInfoForm />
      </div>
    </div>
  )
}

export default SignIn
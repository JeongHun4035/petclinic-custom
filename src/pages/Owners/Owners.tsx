import { useEffect, useState } from 'react'

import { axiosRequest } from '@/api/axios'
import Button from '@/components/common/Button/Button'
import Input from '@/components/common/Input/Input'
import Popup from '@/components/common/Popup/Popup'
import Table from '@/components/common/Table/Table'
import { canManageResources, getStoredUser } from '@/utils/auth'

import type { Owner } from '@/types/interfaces/services'

import './Owners.css'

let ownersRequest: ReturnType<typeof axiosRequest.get<Owner[]>> | null = null

const loadOwners = () => {
  ownersRequest ??= axiosRequest.get<Owner[]>('/petclinic/api/owners')

  return ownersRequest
}

const ownerColumns = [
  {
    key: 'id',
    label: '회원번호',
  },
  {
    key: 'name',
    label: '보호자명',
    render: (owner: Owner) => `${owner.firstName} ${owner.lastName}`,
  },
  {
    key: 'telephone',
    label: '연락처',
  },
  {
    key: 'address',
    label: '주소',
  },
  {
    key: 'city',
    label: '도시',
  },
  {
    key: 'pets',
    label: '반려동물',
    render: (owner: Owner) => owner.pets.length,
  },
]

interface OwnerRegistrationFormProps {
  isOpen: boolean,
  onClose: () => void,
  onSuccess: () => void,
}

const OwnerRegistrationForm = ({
  isOpen,
  onClose,
  onSuccess,
}: OwnerRegistrationFormProps) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormValues({})
      setErrorMessage('')
    }
  }, [isOpen])

  const updateValue = (field: string, value: string) => {
    setFormValues(previousValues => ({
      ...previousValues,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await axiosRequest.post<Owner>('/petclinic/api/owners', {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        address: formValues.address,
        city: formValues.city,
        telephone: formValues.telephone,
      })
      onSuccess()
      onClose()
    } catch {
      setErrorMessage('등록에 실패했습니다. 입력값과 권한을 확인해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="registration-form" onSubmit={handleSubmit}>
      <Input id="owner-first-name" label="이름" required value={formValues.firstName ?? ''} onChange={value => updateValue('firstName', value)} />
      <Input id="owner-last-name" label="성" required value={formValues.lastName ?? ''} onChange={value => updateValue('lastName', value)} />
      <Input id="owner-address" label="주소" required value={formValues.address ?? ''} onChange={value => updateValue('address', value)} />
      <Input id="owner-city" label="도시" required value={formValues.city ?? ''} onChange={value => updateValue('city', value)} />
      <Input id="owner-telephone" label="전화번호" required pattern="[0-9]{10}" value={formValues.telephone ?? ''} onChange={value => updateValue('telephone', value)} />
      {errorMessage ? <p className="registration-error">{errorMessage}</p> : null}
      <div className="registration-actions">
        <Button type="button" variant="outline" onClick={onClose}>취소</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '등록 중...' : '등록'}</Button>
      </div>
    </form>
  )
}

const Owners: React.FC = () => {
  const canRegisterOwner = canManageResources(getStoredUser())
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [owners, setOwners] = useState<Owner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchOwners = () => {
    setIsLoading(true)
    loadOwners()
      .then(response => setOwners(response.data))
      .catch(() => setErrorMessage('보호자 목록을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchOwners()
  }, [])

  const filteredOwners = owners.filter(owner => {
    const keyword = searchTerm.toLowerCase()
    return [
      owner.firstName,
      owner.lastName,
      owner.telephone,
      owner.address,
      owner.city,
    ].some(value => value.toLowerCase().includes(keyword))
  })

  return (
    <section className="owners-page">
      <div className="owners-heading">
        <div>
          <p className="owners-eyebrow">PETCLINIC MEMBERS</p>
          <h1>보호자 관리</h1>
          <p className="owners-description">등록된 보호자와 반려동물 정보를 한눈에 확인하세요.</p>
        </div>
        {canRegisterOwner ? (
          <Button type="button" onClick={() => setIsRegistrationOpen(true)}>보호자 등록</Button>
        ) : null}
      </div>

      <div className="owners-toolbar">
        <Input
          id="owner-search"
          aria-label="보호자 검색"
          placeholder="이름, 연락처 또는 이메일 검색"
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <span className="owners-count">총 {filteredOwners.length}명</span>
      </div>

      {errorMessage ? <p>{errorMessage}</p> : null}
      {isLoading ? <p>보호자 목록을 불러오는 중입니다.</p> : null}
      {!isLoading && !errorMessage ? (
        <Table
          columns={ownerColumns}
          rows={filteredOwners}
          getRowKey={owner => owner.id}
          emptyMessage="검색 결과가 없습니다."
          renderExpandedRow={owner => (
            <div className="owner-pets">
              {owner.pets.length > 0 ? owner.pets.map(pet => (
                <div className="owner-pet" key={pet.id}>
                  <p>
                    <span>
                      이름 :
                    </span>
                    <strong>{pet.name}</strong>
                  </p>
                  <p>
                    <span>
                      종류 :
                    </span>
                    <strong>{pet.type.name}</strong>
                  </p>
                  <p>
                    <span>
                      생년월일 :
                    </span>
                    <span> {pet.birthDate}</span>
                  </p>
                </div>
              )) : (
                <p className="owner-pets-empty">등록된 반려동물이 없습니다.</p>
              )}
            </div>
          )}
        />
      ) : null}
      <Popup
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        title="보호자 등록"
        contentClassName="registration-popup-content"
      >
        <OwnerRegistrationForm
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onSuccess={() => {
            ownersRequest = null
            fetchOwners()
          }}
        />
      </Popup>
    </section>
  )
}

export default Owners

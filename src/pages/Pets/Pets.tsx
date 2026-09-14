import { useEffect, useState } from 'react'

import { axiosRequest } from '@/api/axios'
import Button from '@/components/common/Button/Button'
import Input from '@/components/common/Input/Input'
import Popup from '@/components/common/Popup/Popup'
import Table from '@/components/common/Table/Table'
import { canManageResources, getStoredUser } from '@/utils/auth'

import type { Pet } from '@/types/interfaces/services'

import './Pets.css'

let petsRequest: ReturnType<typeof axiosRequest.get<Pet[]>> | null = null

const loadPets = () => {
  petsRequest ??= axiosRequest.get<Pet[]>('/petclinic/api/pets')

  return petsRequest
}

const petColumns = [
  {
    key: 'id',
    label: '반려동물 번호',
  },
  {
    key: 'name',
    label: '이름',
  },
  {
    key: 'type',
    label: '종류',
    render: (pet: Pet) => pet.type.name,
  },
  {
    key: 'birthDate',
    label: '생년월일',
  },
  {
    key: 'ownerId',
    label: '보호자 번호',
  },
]

interface PetType {
  id: number,
  name: string,
}

interface PetRegistrationFormProps {
  isOpen: boolean,
  onClose: () => void,
  onSuccess: () => void,
}

const PetRegistrationForm = ({
  isOpen,
  onClose,
  onSuccess,
}: PetRegistrationFormProps) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [owners, setOwners] = useState<Pet['ownerId'][]>([])
  const [ownerNames, setOwnerNames] = useState<Record<number, string>>({})
  const [petTypes, setPetTypes] = useState<PetType[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormValues({})
    setErrorMessage('')
    Promise.all([
      axiosRequest.get<{
        id: number,
        firstName: string,
        lastName: string,
      }[]>('/petclinic/api/owners'),
      axiosRequest.get<PetType[]>('/petclinic/api/pettypes'),
    ])
      .then(([ownersResponse, petTypesResponse]) => {
        setOwners(ownersResponse.data.map(owner => owner.id))
        setOwnerNames(Object.fromEntries(ownersResponse.data.map(owner => [owner.id, `${owner.firstName} ${owner.lastName}`])))
        setPetTypes(petTypesResponse.data)
      })
      .catch(() => setErrorMessage('등록에 필요한 목록을 불러오지 못했습니다.'))
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
      const selectedPetType = petTypes.find(type => String(type.id) === formValues.typeId)
      await axiosRequest.post<Pet>(`/petclinic/api/owners/${formValues.ownerId}/pets`, {
        name: formValues.name,
        birthDate: formValues.birthDate,
        type: selectedPetType,
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
      <Input id="pet-name" label="이름" required value={formValues.name ?? ''} onChange={value => updateValue('name', value)} />
      <Input id="pet-birth-date" label="생년월일" type="date" required value={formValues.birthDate ?? ''} onChange={value => updateValue('birthDate', value)} />
      <label className="registration-field">
        <span>보호자</span>
        <select required value={formValues.ownerId ?? ''} onChange={event => updateValue('ownerId', event.target.value)}>
          <option value="">보호자를 선택해주세요.</option>
          {owners.map(ownerId => <option key={ownerId} value={ownerId}>{ownerNames[ownerId]} ({ownerId})</option>)}
        </select>
      </label>
      <label className="registration-field">
        <span>종류</span>
        <select required value={formValues.typeId ?? ''} onChange={event => updateValue('typeId', event.target.value)}>
          <option value="">종류를 선택해주세요.</option>
          {petTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
        </select>
      </label>
      {errorMessage ? <p className="registration-error">{errorMessage}</p> : null}
      <div className="registration-actions">
        <Button type="button" variant="outline" onClick={onClose}>취소</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '등록 중...' : '등록'}</Button>
      </div>
    </form>
  )
}

const Pets: React.FC = () => {
  const canRegisterPet = canManageResources(getStoredUser())
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchPets = () => {
    setIsLoading(true)
    loadPets()
      .then(response => setPets(response.data))
      .catch(() => setErrorMessage('반려동물 목록을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchPets()
  }, [])

  const filteredPets = pets.filter(pet => [
    pet.name,
    pet.type.name,
    pet.birthDate,
    String(pet.ownerId),
  ].some(value => value.toLowerCase().includes(searchTerm.toLowerCase())))

  return (
    <section className="pets-page">
      <div className="pets-heading">
        <div>
          <p className="pets-eyebrow">PETCLINIC PETS</p>
          <h1>반려동물 관리</h1>
          <p className="pets-description">등록된 반려동물과 보호자 정보를 확인하세요.</p>
        </div>
        {canRegisterPet ? (
          <Button type="button" onClick={() => setIsRegistrationOpen(true)}>반려동물 등록</Button>
        ) : null}
      </div>
      <div className="pets-toolbar">
        <Input
          id="pet-search"
          aria-label="반려동물 검색"
          placeholder="이름, 종류 또는 보호자 번호 검색"
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <span className="pets-count">총 {filteredPets.length}마리</span>
      </div>
      {errorMessage ? <p>{errorMessage}</p> : null}
      {isLoading ? <p>반려동물 목록을 불러오는 중입니다.</p> : null}
      {!isLoading && !errorMessage ? (
        <Table
          columns={petColumns}
          rows={filteredPets}
          getRowKey={pet => pet.id}
          emptyMessage="검색 결과가 없습니다."
          renderExpandedRow={pet => (
            <div className="pet-details">
              <p>
                <span>이름 :</span>
                <strong>{pet.name}</strong>
              </p>
              <p>
                <span>종류 :</span>
                <strong>{pet.type.name}</strong>
              </p>
              <p>
                <span>생년월일 :</span>
                <span>{pet.birthDate}</span>
              </p>
              <p>
                <span>보호자 번호 :</span>
                <span>{pet.ownerId}</span>
              </p>
              <p>
                <span>진료 기록 :</span>
                <span>{pet.visits.length} 건</span>
              </p>
            </div>
          )}
        />
      ) : null}
      <Popup
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        title="반려동물 등록"
        contentClassName="registration-popup-content"
      >
        <PetRegistrationForm
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onSuccess={() => {
            petsRequest = null
            fetchPets()
          }}
        />
      </Popup>
    </section>
  )
}

export default Pets

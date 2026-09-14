import { useEffect, useState } from 'react'

import { axiosRequest } from '@/api/axios'
import Button from '@/components/common/Button/Button'
import Input from '@/components/common/Input/Input'
import Popup from '@/components/common/Popup/Popup'
import Table from '@/components/common/Table/Table'
import { canManageResources, getStoredUser } from '@/utils/auth'

import type { Vet } from '@/types/interfaces/services'

import './Vets.css'

let vetsRequest: ReturnType<typeof axiosRequest.get<Vet[]>> | null = null

const loadVets = () => {
  vetsRequest ??= axiosRequest.get<Vet[]>('/petclinic/api/vets')

  return vetsRequest
}

const vetColumns = [
  {
    key: 'id',
    label: '수의사 번호',
  },
  {
    key: 'name',
    label: '수의사명',
    render: (vet: Vet) => `${vet.firstName} ${vet.lastName}`,
  },
  {
    key: 'specialties',
    label: '전문 분야',
    render: (vet: Vet) => vet.specialties.length > 0 ?
      vet.specialties.map(specialty => specialty.name).join(', ') :
      '전문 분야 없음',
  },
]

interface Specialty {
  id: number,
  name: string,
}

interface VetRegistrationFormProps {
  isOpen: boolean,
  onClose: () => void,
  onSuccess: () => void,
}

const VetRegistrationForm = ({
  isOpen,
  onClose,
  onSuccess,
}: VetRegistrationFormProps) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormValues({})
    setSelectedSpecialties([])
    setErrorMessage('')
    axiosRequest.get<Specialty[]>('/petclinic/api/specialties')
      .then(response => setSpecialties(response.data))
      .catch(() => setErrorMessage('전문 분야 목록을 불러오지 못했습니다.'))
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
      await axiosRequest.post<Vet>('/petclinic/api/vets', {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        specialties: selectedSpecialties
          .map(id => specialties.find(specialty => String(specialty.id) === id))
          .filter((specialty): specialty is Specialty => Boolean(specialty)),
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
      <Input id="vet-first-name" label="이름" required value={formValues.firstName ?? ''} onChange={value => updateValue('firstName', value)} />
      <Input id="vet-last-name" label="성" required value={formValues.lastName ?? ''} onChange={value => updateValue('lastName', value)} />
      <label className="registration-field">
        <span>전문 분야</span>
        <select multiple required value={selectedSpecialties} onChange={event => setSelectedSpecialties(Array.from(event.target.selectedOptions, option => option.value))}>
          {specialties.map(specialty => <option key={specialty.id} value={specialty.id}>{specialty.name}</option>)}
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

const Vets: React.FC = () => {
  const canRegisterVet = canManageResources(getStoredUser())
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [vets, setVets] = useState<Vet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchVets = () => {
    setIsLoading(true)
    loadVets()
      .then(response => setVets(response.data))
      .catch(() => setErrorMessage('수의사 목록을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchVets()
  }, [])

  const filteredVets = vets.filter(vet => [
    vet.firstName,
    vet.lastName,
    ...vet.specialties.map(specialty => specialty.name),
  ].some(value => value.toLowerCase().includes(searchTerm.toLowerCase())))

  return (
    <section className="vets-page">
      <div className="vets-heading">
        <div>
          <p className="vets-eyebrow">PETCLINIC VETS</p>
          <h1>수의사 관리</h1>
          <p className="vets-description">담당 수의사와 전문 분야를 확인하세요.</p>
        </div>
        {canRegisterVet ? (
          <Button type="button" onClick={() => setIsRegistrationOpen(true)}>수의사 등록</Button>
        ) : null}
      </div>
      <div className="vets-toolbar">
        <Input
          id="vet-search"
          aria-label="수의사 검색"
          placeholder="이름 또는 전문 분야 검색"
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <span className="vets-count">총 {filteredVets.length}명</span>
      </div>
      {errorMessage ? <p>{errorMessage}</p> : null}
      {isLoading ? <p>수의사 목록을 불러오는 중입니다.</p> : null}
      {!isLoading && !errorMessage ? (
        <Table
          columns={vetColumns}
          rows={filteredVets}
          getRowKey={vet => vet.id}
          emptyMessage="검색 결과가 없습니다."
        />
      ) : null}
      <Popup
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        title="수의사 등록"
        contentClassName="registration-popup-content"
      >
        <VetRegistrationForm
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onSuccess={() => {
            vetsRequest = null
            fetchVets()
          }}
        />
      </Popup>
    </section>
  )
}

export default Vets

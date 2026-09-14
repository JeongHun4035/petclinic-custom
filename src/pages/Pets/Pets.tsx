import { useEffect, useState } from 'react'

import { axiosRequest } from '@/api/axios'
import Input from '@/components/common/Input/Input'
import Table from '@/components/common/Table/Table'

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

const Pets: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadPets()
      .then(response => setPets(response.data))
      .catch(() => setErrorMessage('반려동물 목록을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
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
    </section>
  )
}

export default Pets

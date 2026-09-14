import { useEffect, useState } from 'react'

import { axiosRequest } from '@/api/axios'
import Button from '@/components/common/Button/Button'
import Input from '@/components/common/Input/Input'
import Table from '@/components/common/Table/Table'

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

const Owners: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [owners, setOwners] = useState<Owner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await loadOwners()
        setOwners(response.data)
      } catch {
        setErrorMessage('보호자 목록을 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

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
        <Button type="button">보호자 등록</Button>
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
    </section>
  )
}

export default Owners

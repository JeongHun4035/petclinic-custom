import { useEffect, useState } from 'react'

import { axiosRequest } from '@/api/axios'
import Input from '@/components/common/Input/Input'
import Table from '@/components/common/Table/Table'

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

const Vets: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [vets, setVets] = useState<Vet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadVets()
      .then(response => setVets(response.data))
      .catch(() => setErrorMessage('수의사 목록을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
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
    </section>
  )
}

export default Vets

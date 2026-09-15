import { useCallback, useEffect, useState } from 'react'

import { axiosRequest } from '@/api/axios'
import Button from '@/components/common/Button/Button'
import Input from '@/components/common/Input/Input'
import Popup from '@/components/common/Popup/Popup'
import Table from '@/components/common/Table/Table'
import { canManageResources, getStoredUser } from '@/utils/auth'

import type { Appointment, AppointmentFields, Pet, Vet } from '@/types/interfaces/services'

import './Appointments.css'

const formatDateTime = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const toApiDateTime = (value: string) => {
  const date = new Date(value)
  return date.toISOString()
}

const Appointments: React.FC = () => {
  const user = getStoredUser()
  const canManage = canManageResources(user)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [vets, setVets] = useState<Vet[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [inputTypes, setInputTypes] = useState<Record<string, 'text' | 'date' | 'time'>>({})
  const [formValues, setFormValues] = useState({
    petId: '',
    vetId: '',
    startTime: '',
    endTime: '',
    reason: '',
  })

  const petName = (petId: number) => pets.find(pet => pet.id === petId)?.name ?? `반려동물 #${petId}`
  const vetName = (vetId: number) => {
    const vet = vets.find(item => item.id === vetId)
    return vet ? `${vet.firstName} ${vet.lastName}` : `수의사 #${vetId}`
  }

  const loadAppointments = useCallback(() => {
    const params = user?.ownerId && !canManage ? { ownerId: user.ownerId } : undefined

    setIsLoading(true)
    axiosRequest.get<Appointment[]>('/petclinic/api/appointments', { params })
      .then(response => setAppointments(response.data))
      .catch(() => setErrorMessage('예약 목록을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }, [canManage, user?.ownerId])

  const loadFormOptions = useCallback(() => {
    Promise.all([axiosRequest.get<Pet[]>('/petclinic/api/pets'), axiosRequest.get<Vet[]>('/petclinic/api/vets')])
      .then(([petsResponse, vetsResponse]) => {
        const availablePets = user?.ownerId && !canManage ?
          petsResponse.data.filter(pet => pet.ownerId === user.ownerId) :
          petsResponse.data

        setPets(availablePets)
        setVets(vetsResponse.data)
      })
      .catch(() => setFormError('예약에 필요한 정보를 불러오지 못했습니다.'))
  }, [canManage, user?.ownerId])

  useEffect(() => {
    loadAppointments()
    loadFormOptions()
  }, [loadAppointments, loadFormOptions])

  const updateValue = (field: string, value: string) => {
    setFormValues(previousValues => ({
      ...previousValues,
      [field]: value,
    }))
  }

  const updateDateTimePart = (field: 'startTime' | 'endTime', part: 'date' | 'time', value: string) => {
    setFormValues(previousValues => {
      const [currentDate = '', currentTime = ''] = previousValues[field].split('T')
      const nextDate = part === 'date' ? value : currentDate
      const nextTime = part === 'time' ? value : currentTime

      return {
        ...previousValues,
        [field]: `${nextDate}T${nextTime}`,
      }
    })
  }

  const openPopup = () => {
    setFormValues({
      petId: '',
      vetId: '',
      startTime: '',
      endTime: '',
      reason: '',
    })
    setInputTypes({})
    setFormError('')
    setIsPopupOpen(true)
  }

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')

    const start = new Date(formValues.startTime)
    const end = new Date(formValues.endTime)

    if (start <= new Date() || end <= start) {
      setFormError('시작 시간은 현재 이후여야 하며 종료 시간은 시작 시간보다 늦어야 합니다.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload: AppointmentFields = {
        petId: Number(formValues.petId),
        vetId: Number(formValues.vetId),
        startTime: toApiDateTime(formValues.startTime),
        endTime: toApiDateTime(formValues.endTime),
        reason: formValues.reason,
      }

      await axiosRequest.post<Appointment>('/petclinic/api/appointments', payload)
      setIsPopupOpen(false)
      loadAppointments()
    } catch {
      setFormError('예약 등록에 실패했습니다. 시간이 겹치거나 입력값을 확인해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const showPicker = (field: string, type: 'date' | 'time') => {
    setInputTypes(previousTypes => ({
      ...previousTypes,
      [field]: type,
    }))
  }

  const showPlaceholder = (field: string, value: string) => {
    if (!value) {
      setInputTypes(previousTypes => ({
        ...previousTypes,
        [field]: 'text',
      }))
    }
  }

  const handleCancel = async (appointmentId: number) => {
    if (!window.confirm('이 예약을 취소하시겠습니까?')) {
      return
    }

    try {
      await axiosRequest.post(`/petclinic/api/appointments/${appointmentId}/cancel`)
      loadAppointments()
    } catch {
      setErrorMessage('예약을 취소하지 못했습니다.')
    }
  }

  const handleConfirm = async (appointmentId: number) => {
    try {
      await axiosRequest.post(`/petclinic/api/appointments/${appointmentId}/confirm`)
      loadAppointments()
    } catch {
      setErrorMessage('담당 수의사만 예약을 확정할 수 있습니다.')
    }
  }

  const filteredAppointments = appointments.filter(appointment => [
    petName(appointment.petId),
    vetName(appointment.vetId),
    appointment.reason,
    appointment.status,
  ].some(value => value.toLowerCase().includes(searchTerm.toLowerCase())))

  const appointmentColumns = [
    {
      key: 'date',
      label: '예약 일시',
      render: (appointment: Appointment) => formatDateTime(appointment.startTime),
    },
    {
      key: 'pet',
      label: '반려동물',
      render: (appointment: Appointment) => petName(appointment.petId),
    },
    {
      key: 'vet',
      label: '수의사',
      render: (appointment: Appointment) => vetName(appointment.vetId),
    },
    {
      key: 'reason',
      label: '예약 사유',
    },
    {
      key: 'status',
      label: '상태',
      render: (appointment: Appointment) => (
        <span className={`appointment-status appointment-status--${appointment.status.toLowerCase()}`}>
          {appointment.status === 'PENDING' ? '확인중' : appointment.status === 'CONFIRMED' ? '확정' : '취소됨'}
        </span>
      ),
    },
    {
      key: 'action',
      label: '관리',
      render: (appointment: Appointment) => (
        <div className="appointment-actions-inline">
          {user?.vetId === appointment.vetId && appointment.status === 'PENDING' ? (
            <Button type="button" size="sm" onClick={() => handleConfirm(appointment.id)}>예약 확정</Button>
          ) : null}
          {appointment.status === 'PENDING' || appointment.status === 'CONFIRMED' ? (
            <Button type="button" size="sm" variant="outline" onClick={() => handleCancel(appointment.id)}>예약 취소</Button>
          ) : null}
          {appointment.status === 'CANCELLED' ? '-' : null}
        </div>
      ),
    },
  ]

  return (
    <section className="appointments-page">
      <div className="appointments-heading">
        <div>
          <p className="appointments-eyebrow">PETCLINIC APPOINTMENTS</p>
          <h1>예약 관리</h1>
          <p className="appointments-description">반려동물의 진료 예약을 확인하고 새로운 예약을 등록하세요.</p>
        </div>
        <Button type="button" onClick={openPopup}>예약 등록</Button>
      </div>

      <div className="appointments-toolbar">
        <Input
          id="appointment-search"
          aria-label="예약 검색"
          placeholder="반려동물, 수의사 또는 예약 사유 검색"
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <span className="appointments-count">총 {filteredAppointments.length}건</span>
      </div>

      {errorMessage ? <p className="appointments-error">{errorMessage}</p> : null}
      {isLoading ? <p>예약 목록을 불러오는 중입니다.</p> : null}
      {!isLoading && !errorMessage ? (
        <Table
          columns={appointmentColumns}
          rows={filteredAppointments}
          getRowKey={appointment => appointment.id}
          emptyMessage="등록된 예약이 없습니다."
        />
      ) : null}

      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="예약 등록"
        contentClassName="appointment-popup-content"
      >
        <form className="appointment-form" onSubmit={handleCreate}>
          <label className="appointment-field">
            <span>반려동물</span>
            <select required value={formValues.petId} onChange={event => updateValue('petId', event.target.value)}>
              <option value="">반려동물을 선택해주세요.</option>
              {pets.map(pet => <option key={pet.id} value={pet.id}>{pet.name} ({pet.id})</option>)}
            </select>
          </label>
          <label className="appointment-field">
            <span>수의사</span>
            <select required value={formValues.vetId} onChange={event => updateValue('vetId', event.target.value)}>
              <option value="">수의사를 선택해주세요.</option>
              {vets.map(vet => <option key={vet.id} value={vet.id}>{vet.firstName} {vet.lastName}</option>)}
            </select>
          </label>
          <div className="appointment-datetime-group">
            <Input
              id="appointment-start-date"
              label="시작 날짜"
              type={inputTypes.startDate ?? 'text'}
              required
              placeholder="YYYY-MM-DD"
              value={formValues.startTime.split('T')[0]}
              onFocus={() => showPicker('startDate', 'date')}
              onBlur={event => showPlaceholder('startDate', event.target.value)}
              onChange={value => updateDateTimePart('startTime', 'date', value)}
            />
            <Input
              id="appointment-start-time"
              label="시작 시간"
              type={inputTypes.startTime ?? 'text'}
              required
              placeholder="HH:mm"
              value={formValues.startTime.split('T')[1] ?? ''}
              onFocus={() => showPicker('startTime', 'time')}
              onBlur={event => showPlaceholder('startTime', event.target.value)}
              onChange={value => updateDateTimePart('startTime', 'time', value)}
            />
          </div>
          <div className="appointment-datetime-group">
            <Input
              id="appointment-end-date"
              label="종료 날짜"
              type={inputTypes.endDate ?? 'text'}
              required
              placeholder="YYYY-MM-DD"
              value={formValues.endTime.split('T')[0]}
              onFocus={() => showPicker('endDate', 'date')}
              onBlur={event => showPlaceholder('endDate', event.target.value)}
              onChange={value => updateDateTimePart('endTime', 'date', value)}
            />
            <Input
              id="appointment-end-time"
              label="종료 시간"
              type={inputTypes.endTime ?? 'text'}
              required
              placeholder="HH:mm"
              value={formValues.endTime.split('T')[1] ?? ''}
              onFocus={() => showPicker('endTime', 'time')}
              onBlur={event => showPlaceholder('endTime', event.target.value)}
              onChange={value => updateDateTimePart('endTime', 'time', value)}
            />
          </div>
          <Input id="appointment-reason" label="예약 사유" required maxLength={255} value={formValues.reason} onChange={value => updateValue('reason', value)} />
          {formError ? <p className="appointments-error">{formError}</p> : null}
          <div className="appointment-actions">
            <Button type="button" variant="outline" onClick={() => setIsPopupOpen(false)}>취소</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '등록 중...' : '예약 등록'}</Button>
          </div>
        </form>
      </Popup>
    </section>
  )
}

export default Appointments

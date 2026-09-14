import { useEffect, useRef } from 'react'

import dogImage from '@/assets/dog.png'
import dogsImage from '@/assets/dogs.png'
import medicalImage from '@/assets/medical.png'

import type { CSSProperties } from 'react'

import './Dashboard.css'

const backgroundImageStyle = (image: string) => ({
  '--dashboard-sector-image': `url(${image})`,
}) as CSSProperties

const Dashboard: React.FC = () => {
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dashboard = dashboardRef.current

    if (!dashboard) {
      return
    }

    const sectors = dashboard.querySelectorAll<HTMLElement>('.dashboard-sector')
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting)
      })
    }, { threshold: 0.32 })

    sectors.forEach(sector => observer.observe(sector))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="dashboard" ref={dashboardRef}>
      <section
        className="dashboard-sector dashboard-sector--companion"
        style={backgroundImageStyle(dogImage)}
      >
        <div className="dashboard-sector__content">
          <p className="dashboard-sector__label">섹터 01 · 함께하는 돌봄</p>
          <h1>반려동물에게<br />따뜻한 돌봄을 전해 주세요.</h1>
          <p>소중한 반려동물의 건강한 일상을 함께 돌봐 주세요.</p>
        </div>
      </section>

      <section
        className="dashboard-sector dashboard-sector--care"
        style={backgroundImageStyle(medicalImage)}
      >
        <div className="dashboard-sector__content">
          <p className="dashboard-sector__label">섹터 02 · 세심한 진료</p>
          <h1>진료 기록을 꼼꼼하게<br />살펴봐 주세요.</h1>
          <p>보호자 정보와 진료 기록을 확인해 더 나은 진료를 준비해 주세요.</p>
        </div>
      </section>

      <section
        className="dashboard-sector dashboard-sector--joy"
        style={backgroundImageStyle(dogsImage)}
      >
        <div className="dashboard-sector__content">
          <p className="dashboard-sector__label">섹터 03 · 건강한 일상</p>
          <h1>건강한 하루를<br />함께 시작해 주세요.</h1>
          <p>반려동물과 보호자의 행복한 일상을 지금부터 만들어 주세요.</p>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
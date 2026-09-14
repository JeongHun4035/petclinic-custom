import './Footer.css'

const Footer: React.FC = () => {
  return (
    <footer className="footer-area">
      <div className="footer-content">
        <p className="footer-notice">
          본 프로젝트는 bespin-global 교육과정과 함께 진행되었습니다.
        </p>
        <p className="footer-notice">
          PetClinic 오픈소스 제공사에 원저작권이 있으며, 변경 로직의 저작권은 Team Nova에 있습니다.
        </p>
      </div>
    </footer>
  )
}

export default Footer
import './Examples.css'
import { useNavigate } from 'react-router-dom'

const ExampleItems: React.FC = () => {
  const exampleItems = [
    {
      id: 'select',
      title: 'Select',
    },
    {
      id: 'popup',
      title: 'Popup',
    },
    {
      id: 'confirm',
      title: 'Confirm',
    },
  ]
  const navigate = useNavigate()

  const navigateToDetail = (id:string) => {
    navigate(`/examples/${id}`)
  }

  return (
    <div className="example-items">
      {exampleItems.map(item => (
        <div className="example-item" key={item.id} onClick={() => navigateToDetail(item.id)}>
          <h2>{item.title}</h2>
        </div>
      ))}
    </div>
  )
}


const Examples: React.FC = () => {
  return (
    <div className="examples-container">
      <ExampleItems />
    </div>
  )
}

export default Examples
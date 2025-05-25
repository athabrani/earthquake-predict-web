import type { NextPage } from 'next'
import HomePage from './components/predictionhome'

const Home: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <HomePage />
    </div>
  )
}

export default Home

import { useState } from 'react'
import Nav from './components/Nav.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ExamAnalyzer from './pages/ExamAnalyzer.jsx'
import WeaknessMap from './pages/WeaknessMap.jsx'
import UnivPredictor from './pages/UnivPredictor.jsx'

const PAGES = ['대시보드', '답안분석', '약점지도', '대학예측']

export default function App() {
  const [page, setPage] = useState(0)
  const [studentData, setStudentData] = useState({
    name: '',
    grade: '중3',
    targetUniv: '',
    scores: {},
    examHistory: [],
    weaknesses: []
  })

  const pages = [
    <Dashboard key="d" data={studentData} setData={setStudentData} goTo={setPage} />,
    <ExamAnalyzer key="e" data={studentData} setData={setStudentData} />,
    <WeaknessMap key="w" data={studentData} />,
    <UnivPredictor key="u" data={studentData} setData={setStudentData} />
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav page={page} setPage={setPage} pages={PAGES} />
      <main style={{ flex: 1, maxWidth: 780, margin: '0 auto', width: '100%', padding: '24px 16px 80px' }}>
        {pages[page]}
      </main>
    </div>
  )
}

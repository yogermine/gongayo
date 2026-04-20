import { useState } from 'react'

const UNIVS = [
  { name: 'SKY (서울대·연세대·고려대)', need: 95, color: '#7C3AED', bg: '#EDE9FE' },
  { name: '서성한중경외시', need: 85, color: '#1D4ED8', bg: '#DBEAFE' },
  { name: '서울 주요 4년제', need: 74, color: '#059669', bg: '#D1FAE5' },
  { name: '수도권 대학', need: 62, color: '#D97706', bg: '#FEF3C7' },
  { name: '지방 거점 국립대', need: 50, color: '#DC2626', bg: '#FEE2E2' },
]

const GRADE_SCORE = { '1등급': 96, '2등급': 88, '3등급': 77, '4등급': 63, '5등급': 50, '6등급': 38, '7등급': 28, '8등급': 18, '9등급': 8 }

export default function UnivPredictor({ data, setData }) {
  const [targetUniv, setTargetUniv] = useState(data.targetUniv || '')
  const [saved, setSaved] = useState(!!data.targetUniv)

  const korScore = GRADE_SCORE[data.scores?.kor] || 70
  const mathScore = GRADE_SCORE[data.scores?.math] || 70
  const engScore = GRADE_SCORE[data.scores?.eng] || 70
  const avg = Math.round((korScore + mathScore + engScore) / 3)

  const getProb = need => Math.max(3, Math.min(97, Math.round(avg - need + 50)))

  const saveTarget = () => {
    setData(p => ({ ...p, targetUniv }))
    setSaved(true)
  }

  const level = avg >= 90 ? '최상위권' : avg >= 80 ? '상위권' : avg >= 68 ? '중위권' : avg >= 55 ? '중하위권' : '하위권'
  const levelColor = avg >= 80 ? 'var(--color-success)' : avg >= 65 ? 'var(--color-warning)' : 'var(--color-danger)'

  if (!data.scores?.kor) return (
    <div className="card fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>📊</div>
      <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>먼저 대시보드에서 성적을 입력해주세요</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>국어·수학·영어 등급을 입력하면 합격 가능성을 예측합니다</div>
    </div>
  )

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>대학 합격 예측</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>현재 성적 기반 합격 가능성 분석</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>현재 수준</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: levelColor }}>{level}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>국어</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{korScore}<span style={{ fontSize: 11, fontWeight: 400 }}>점</span></div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>수학</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{mathScore}<span style={{ fontSize: 11, fontWeight: 400 }}>점</span></div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>영어</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{engScore}<span style={{ fontSize: 11, fontWeight: 400 }}>점</span></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>목표 대학 설정</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={targetUniv} onChange={e => { setTargetUniv(e.target.value); setSaved(false) }} placeholder="예) 연세대 경영학과" style={{ flex: 1 }} />
          <button className="btn-primary" onClick={saveTarget} style={{ whiteSpace: 'nowrap', fontSize: 13 }}>저장</button>
        </div>
        {saved && targetUniv && <div style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 6 }}>✓ 목표 대학이 저장되었습니다</div>}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10, fontWeight: 500, letterSpacing: '0.05em' }}>대학 그룹별 합격 가능성</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {UNIVS.map((u, i) => {
          const prob = getProb(u.need)
          const probColor = prob >= 70 ? 'var(--color-success)' : prob >= 40 ? 'var(--color-warning)' : 'var(--color-danger)'
          return (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: u.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: u.color, flexShrink: 0, textAlign: 'center', lineHeight: 1.2 }}>
                {u.name.substring(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: probColor }}>{prob}%</div>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${prob}%`, background: probColor, borderRadius: 4, transition: 'width 0.8s' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card" style={{ background: '#F0F4FF', border: '1px solid rgba(67,56,202,0.15)' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)', marginBottom: 8 }}>AI 입시 전략 요약</div>
        <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.8 }}>
          현재 평균 {avg}점({level}) 수준입니다. {avg >= 80 ? '상위권 대학 지원이 가능한 수준이에요. 킬러 문항 집중 공략으로 1등급을 목표로 하세요.' : avg >= 65 ? '조금만 더 올리면 중상위권 대학이 가능합니다. 취약 과목 1개를 집중 보완하는 게 가장 빠른 방법이에요.' : '기초 개념 정리부터 시작하는 게 중요합니다. 오답 분석 탭에서 약점 단원을 먼저 찾아보세요.'}
          {' '}목표 대학 합격을 위해 <strong>약점 단원 집중 보완</strong>과 <strong>기출 반복 학습</strong>을 병행하세요.
        </div>
      </div>
    </div>
  )
}

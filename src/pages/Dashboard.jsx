import { useState } from 'react'

const GRADES = ['초1','초2','초3','초4','초5','초6','중1','중2','중3','고1','고2','고3','재수']
const SCORE_GRADES = ['1등급','2등급','3등급','4등급','5등급','6등급','7등급','8등급','9등급']

function StatCard({ label, value, sub, color = 'var(--color-primary)' }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '18px 12px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard({ data, setData, goTo }) {
  const [editing, setEditing] = useState(!data.name)
  const [form, setForm] = useState({
    name: data.name || '',
    grade: data.grade || '중3',
    targetUniv: data.targetUniv || '',
    korGrade: data.scores?.kor || '3등급',
    mathGrade: data.scores?.math || '3등급',
    engGrade: data.scores?.eng || '3등급',
  })

  const save = () => {
    setData(prev => ({
      ...prev,
      name: form.name,
      grade: form.grade,
      targetUniv: form.targetUniv,
      scores: { kor: form.korGrade, math: form.mathGrade, eng: form.engGrade }
    }))
    setEditing(false)
  }

  const gradeToNum = g => parseInt(g) || 3
  const avg = data.scores?.kor
    ? ((gradeToNum(data.scores.kor) + gradeToNum(data.scores.math) + gradeToNum(data.scores.eng)) / 3).toFixed(1)
    : '-'

  const level = avg === '-' ? '-' : avg <= 1.5 ? '최상위권' : avg <= 2.5 ? '상위권' : avg <= 3.5 ? '중위권' : avg <= 4.5 ? '중하위권' : '하위권'
  const dday = Math.ceil((new Date('2025-11-13') - new Date()) / 86400000)

  if (editing) return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--color-primary)', marginBottom: 4 }}>공아요</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>학습 정보를 입력하면 AI가 맞춤 분석을 시작합니다</div>
      </div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>이름</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="홍길동" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>학년</label>
            <select value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}>
              {GRADES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>목표 대학 / 학과</label>
          <input value={form.targetUniv} onChange={e => setForm(p => ({ ...p, targetUniv: e.target.value }))} placeholder="예) 연세대 경영학과" />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>최근 모의고사 등급</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[['국어','korGrade'],['수학','mathGrade'],['영어','engGrade']].map(([label, key]) => (
              <div key={key}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
                <select value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}>
                  {SCORE_GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
        <button className="btn-primary" onClick={save} disabled={!form.name}>분석 시작하기</button>
      </div>
    </div>
  )

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{data.name}님의 학습 현황</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{data.grade} · {data.targetUniv || '목표 대학 미설정'}</div>
        </div>
        <button className="btn-secondary" onClick={() => setEditing(true)} style={{ fontSize: 12 }}>정보 수정</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        <StatCard label="평균 등급" value={avg} sub={level} />
        <StatCard label="국어" value={data.scores?.kor?.replace('등급','') || '-'} sub="등급" color="#7C3AED" />
        <StatCard label="수학" value={data.scores?.math?.replace('등급','') || '-'} sub="등급" color="#059669" />
        <StatCard label="영어" value={data.scores?.eng?.replace('등급','') || '-'} sub="등급" color="#D97706" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ cursor: 'pointer', borderColor: 'var(--color-primary)', borderWidth: 1.5 }} onClick={() => goTo(1)}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>답안 분석 시작하기</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>문제와 답안을 입력하면 AI가 오답 원인을 분석합니다</div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-primary)', fontWeight: 500 }}>시작하기 →</div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => goTo(3)}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>대학 합격 가능성 확인</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>현재 성적으로 목표 대학 합격 가능성을 예측합니다</div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>확인하기 →</div>
        </div>
      </div>

      {data.examHistory?.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>최근 분석 기록</div>
          {data.examHistory.slice(-3).reverse().map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{h.examName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{h.date} · 오답 {h.wrongCount}개</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: h.score >= 80 ? 'var(--color-success)' : h.score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                {h.score}점
              </div>
            </div>
          ))}
        </div>
      )}

      {data.examHistory?.length === 0 || !data.examHistory && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', border: '1.5px dashed var(--border-strong)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>아직 분석한 시험이 없어요<br />첫 번째 답안을 분석해 보세요!</div>
          <button className="btn-primary" onClick={() => goTo(1)}>첫 답안 분석하기</button>
        </div>
      )}
    </div>
  )
}
